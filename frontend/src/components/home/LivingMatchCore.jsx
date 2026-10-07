import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Zap, Flame, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Canonical skill nodes for the Living Match Core.
 * Coordinates are mapped to a 460x460 circular coordinate space.
 */
const BASE_SKILLS = [
  { id: 'react', label: 'React', angle: -75, radius: 140, dotColor: '#38bdf8' },
  { id: 'python', label: 'Python', angle: -20, radius: 148, dotColor: '#fbbf24' },
  { id: 'aiml', label: 'AI / ML', angle: 35, radius: 136, dotColor: '#34d399' },
  { id: 'figma', label: 'Figma', angle: 92, radius: 144, dotColor: '#c084fc' },
  { id: 'nodejs', label: 'Node.js', angle: 155, radius: 138, dotColor: '#10b981' },
  { id: 'uiux', label: 'UI / UX', angle: 215, radius: 134, dotColor: '#f43f5e' },
  { id: 'ts', label: 'TypeScript', angle: -130, radius: 142, dotColor: '#60a5fa' },
];

export const LivingMatchCore = ({ isMobile = false, reducedMotion = false }) => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const lensRef = useRef(null);
  const specularRef = useRef(null);
  const internalRef = useRef(null);

  const [hoveredNode, setHoveredNode] = useState(null);
  const [isInView, setIsInView] = useState(true);

  // Responsive dynamic center coordinate (in a 460 x 460 SVG coordinate frame)
  const CENTER = 230;

  // Integrate authentic user skills if present in session, otherwise fallback to base set
  const skills = useMemo(() => {
    if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
      return BASE_SKILLS.map((base, idx) => {
        const userSkill = user.skills[idx % user.skills.length];
        const skillName = typeof userSkill === 'string' ? userSkill : userSkill?.name;
        return {
          ...base,
          label: skillName ? (skillName.length > 12 ? skillName.slice(0, 10) + '..' : skillName) : base.label,
        };
      });
    }
    return BASE_SKILLS;
  }, [user]);

  // Compute 2D node coordinates relative to CENTER
  const nodeCoords = useMemo(() => {
    return skills.map((node) => {
      const rad = (node.angle * Math.PI) / 180;
      const x = CENTER + Math.cos(rad) * node.radius;
      const y = CENTER + Math.sin(rad) * node.radius;
      return { ...node, x, y };
    });
  }, [skills]);

  // ── 1. Spring-Interpolated Cursor Interaction Engine
  const mouseState = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isHovering: false,
    rafId: null,
  });

  const updateSpring = useCallback(() => {
    const s = mouseState.current;
    // Physical spring factor (damped lerp)
    const factor = s.isHovering ? 0.09 : 0.06;

    s.currentX += (s.targetX - s.currentX) * factor;
    s.currentY += (s.targetY - s.currentY) * factor;

    const dx = s.targetX - s.currentX;
    const dy = s.targetY - s.currentY;

    // Apply 3D tilt & translation to outer glass lens
    if (lensRef.current) {
      const tiltX = -s.currentY * 4.5;
      const tiltY = s.currentX * 4.5;
      const transX = s.currentX * 12;
      const transY = s.currentY * 12;
      lensRef.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${transX}px, ${transY}px, 0)`;
    }

    // Opposite parallax on the top-left specular curvature (creates curved optical glass depth)
    if (specularRef.current) {
      const specX = -s.currentX * 18;
      const specY = -s.currentY * 18;
      specularRef.current.style.transform = `translate3d(${specX}px, ${specY}px, 0)`;
    }

    // Co-directional parallax on internal core & network
    if (internalRef.current) {
      const intX = s.currentX * 8;
      const intY = s.currentY * 8;
      internalRef.current.style.transform = `translate3d(${intX}px, ${intY}px, 0)`;
    }

    // Continue loop if moving or still settling
    if (s.isHovering || Math.abs(dx) > 0.002 || Math.abs(dy) > 0.002) {
      s.rafId = requestAnimationFrame(updateSpring);
    } else {
      s.rafId = null;
    }
  }, []);

  const handlePointerMove = (e) => {
    if (isMobile || reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to +1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to +1

    const s = mouseState.current;
    s.targetX = Math.max(-1, Math.min(1, nx));
    s.targetY = Math.max(-1, Math.min(1, ny));
    s.isHovering = true;

    if (!s.rafId) {
      s.rafId = requestAnimationFrame(updateSpring);
    }
  };

  const handlePointerLeave = () => {
    if (isMobile || reducedMotion) return;
    const s = mouseState.current;
    s.targetX = 0;
    s.targetY = 0;
    s.isHovering = false;

    if (!s.rafId) {
      s.rafId = requestAnimationFrame(updateSpring);
    }
    setHoveredNode(null);
  };

  // ── 2. Visibility Observer (Zero CPU when off-screen)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mouseState.current.rafId) {
        cancelAnimationFrame(mouseState.current.rafId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative select-none flex items-center justify-center ${
        isMobile ? 'w-[300px] h-[300px] mx-auto mt-4' : 'w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] lg:w-[450px] lg:h-[450px] xl:w-[470px] xl:h-[470px]'
      }`}
      aria-label="HackMatch Interactive Living Match Core"
      role="region"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. CIRCULAR LIQUID-GLASS LENS
          Uses canonical Liquid Glass tokens:
          - Real backdrop-filter: blur(20px) saturate(160%)
          - Translucent background: rgba(15, 23, 42, 0.44)
          - Top specular highlight & deep depth shadow
          ───────────────────────────────────────────────────────────── */}
      <div
        ref={lensRef}
        data-glass-panel
        className={`w-full h-full rounded-full relative overflow-hidden flex items-center justify-center liquid-glass-floating ${
          !reducedMotion && isInView ? 'animate-core-idle' : ''
        }`}
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.44)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 28px 64px -12px rgba(0, 0, 0, 0.75), inset 0 2px 4px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 8px 0 rgba(0, 0, 0, 0.45)',
          willChange: 'transform',
          transition: 'box-shadow 300ms ease',
        }}
      >
        {/* ── Outer Lens Edge Refraction Ring (Concentric Glass Rim) ── */}
        <div
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.06)',
          }}
        />

        {/* ── Internal Ambient Diffuse Glow (Cobalt + Mint Depth) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, rgba(37, 99, 235, 0.12) 42%, transparent 70%)',
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            2. INTERNAL MATCH NETWORK LAYER (Parallax Depth Layer)
            SVG Connections + Central Match Core + 6-7 Skill Nodes
            ───────────────────────────────────────────────────────────── */}
        <div
          ref={internalRef}
          className="absolute inset-0 pointer-events-none"
          style={{ willChange: 'transform' }}
        >
          {/* SVG Connection Paths */}
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 460 460"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Active Connection Gradient */}
              <linearGradient id="activeBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
              </linearGradient>

              {/* Central Core Glow Filter */}
              <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle Orbit Guidance Rings (Very Faint Blueprint Geometry) */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={140}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={72}
              stroke="rgba(16, 185, 129, 0.12)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            {/* Cross-Connecting Mesh Paths (Sparse, Subtle) */}
            <path
              d={`M ${nodeCoords[0]?.x} ${nodeCoords[0]?.y} Q ${CENTER} ${CENTER - 80} ${nodeCoords[6]?.x} ${nodeCoords[6]?.y}`}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <path
              d={`M ${nodeCoords[1]?.x} ${nodeCoords[1]?.y} Q ${CENTER + 80} ${CENTER} ${nodeCoords[2]?.x} ${nodeCoords[2]?.y}`}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <path
              d={`M ${nodeCoords[4]?.x} ${nodeCoords[4]?.y} Q ${CENTER - 70} ${CENTER + 60} ${nodeCoords[5]?.x} ${nodeCoords[5]?.y}`}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Radial Connection Lines: Each Skill Node -> Central MATCH Core */}
            {nodeCoords.map((node) => {
              const isTargeted = hoveredNode === node.id;
              return (
                <g key={`path-${node.id}`}>
                  <line
                    x1={CENTER}
                    y1={CENTER}
                    x2={node.x}
                    y2={node.y}
                    stroke={isTargeted ? 'url(#activeBeam)' : 'rgba(255, 255, 255, 0.16)'}
                    strokeWidth={isTargeted ? 2.5 : 1}
                    strokeDasharray={isTargeted ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />
                  {isTargeted && (
                    <circle
                      cx={(CENTER + node.x) / 2}
                      cy={(CENTER + node.y) / 2}
                      r={3}
                      fill="#34d399"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* ─────────────────────────────────────────────────────────
              CENTRAL MATCH CORE (Physical Anchor)
              Luminous, controlled, slightly translucent, soft halo
              ───────────────────────────────────────────────────────── */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
            style={{ width: '68px', height: '68px' }}
          >
            {/* Soft Ambient Core Halo */}
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.15) 55%, transparent 75%)',
                filter: 'blur(8px)',
              }}
            />

            {/* Concentric Tactile Core Button */}
            <div
              className="relative w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 60%, #047857 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              }}
            >
              <Zap className="w-5 h-5 text-white fill-white/30" />
            </div>

            {/* Micro Badge Label */}
            <span
              className="absolute -bottom-5 text-[9px] font-mono font-extrabold uppercase tracking-widest text-emerald-300 select-none"
              style={{ textShadow: '0 0 8px rgba(16, 185, 129, 0.8)' }}
            >
              MATCH
            </span>
          </div>

          {/* ─────────────────────────────────────────────────────────
              6-8 SKILL NODES (Embedded in the Glass Object)
              Tactile glass pills, responsive on hover
              ───────────────────────────────────────────────────────── */}
          {nodeCoords.map((node) => {
            const isHovered = hoveredNode === node.id;
            // Position percentage in container
            const leftPct = (node.x / 460) * 100;
            const topPct = (node.y / 460) * 100;

            return (
              <div
                key={node.id}
                onPointerEnter={() => setHoveredNode(node.id)}
                onPointerLeave={() => setHoveredNode(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                }}
              >
                {/* Node Glass Pill */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none transition-all duration-200 ${
                    isHovered
                      ? 'scale-110 shadow-lg text-white'
                      : 'hover:scale-105 text-white/85'
                  }`}
                  style={{
                    backgroundColor: isHovered
                      ? 'rgba(16, 185, 129, 0.28)'
                      : 'rgba(255, 255, 255, 0.09)',
                    border: isHovered
                      ? '1px solid rgba(52, 211, 153, 0.65)'
                      : '1px solid rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: isHovered
                      ? `0 0 16px ${node.dotColor}80, inset 0 1px 0 rgba(255, 255, 255, 0.4)`
                      : '0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {/* Skill Node Dot */}
                  <span
                    className={`inline-block w-2 h-2 rounded-full transition-transform duration-200 ${
                      isHovered ? 'scale-125' : ''
                    }`}
                    style={{
                      backgroundColor: node.dotColor,
                      boxShadow: `0 0 6px ${node.dotColor}`,
                    }}
                  />
                  {/* Skill Label */}
                  <span
                    className="font-sans tracking-tight text-[11px] sm:text-xs font-medium"
                    style={{ color: '#ffffff' }}
                  >
                    {node.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. PHYSICAL OPTICAL CURVATURE & SPECULAR HIGHLIGHT
            Top-left spherical reflection that physically sells the glass lens!
            ───────────────────────────────────────────────────────────── */}
        <div
          ref={specularRef}
          className="absolute inset-0 rounded-full pointer-events-none select-none"
          style={{
            background:
              'radial-gradient(ellipse at 32% 22%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 62%)',
            willChange: 'transform',
          }}
        />

        {/* Bottom Rim Specular Bounce */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none select-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 68% 85%, rgba(16, 185, 129, 0.25) 0%, transparent 45%)',
          }}
        />
      </div>

      {/* Embedded CSS for 14-second ambient idle breath loop */}
      <style>{`
        @keyframes coreIdleMotion {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          35% {
            transform: translate3d(-3px, -5px, 0) rotate(0.8deg);
          }
          70% {
            transform: translate3d(3px, 4px, 0) rotate(-0.6deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }
        .animate-core-idle {
          animation: coreIdleMotion 14s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LivingMatchCore;
