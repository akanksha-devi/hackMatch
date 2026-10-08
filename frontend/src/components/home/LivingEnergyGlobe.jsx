import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Code2, 
  Brain, 
  Palette, 
  Users, 
  Database, 
  Layers, 
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Skill Nodes Definition for the Living Energy Globe / Match Field
 * Position coordinates are percentages relative to the container (0% to 100%)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CANONICAL_SKILL_NODES = [
  {
    id: 'webdev',
    label: 'Web Development',
    icon: Code2,
    color: '#38bdf8', // Electric Cyan
    glowColor: 'rgba(56, 189, 248, 0.45)',
    baseX: 52, // %
    baseY: 14, // %
    phase: 0.2,
    ribbonColorStart: '#38bdf8',
    ribbonColorEnd: '#818cf8',
  },
  {
    id: 'aiml',
    label: 'AI / ML',
    icon: Brain,
    color: '#fbbf24', // Luminous Solar Gold
    glowColor: 'rgba(251, 191, 36, 0.5)',
    baseX: 24, // %
    baseY: 26, // %
    phase: 1.4,
    ribbonColorStart: '#fbbf24',
    ribbonColorEnd: '#f59e0b',
  },
  {
    id: 'uiux',
    label: 'UI / UX Design',
    icon: Palette,
    color: '#c084fc', // Electric Violet
    glowColor: 'rgba(192, 132, 252, 0.45)',
    baseX: 84, // %
    baseY: 30, // %
    phase: 2.7,
    ribbonColorStart: '#c084fc',
    ribbonColorEnd: '#ec4899',
  },
  {
    id: 'datasci',
    label: 'Data Science',
    icon: Database,
    color: '#60a5fa', // Azure Blue
    glowColor: 'rgba(96, 165, 250, 0.45)',
    baseX: 78, // %
    baseY: 74, // %
    phase: 3.9,
    ribbonColorStart: '#60a5fa',
    ribbonColorEnd: '#38bdf8',
  },
  {
    id: 'product',
    label: 'Product',
    icon: Users,
    color: '#34d399', // Emerald Mint
    glowColor: 'rgba(52, 211, 153, 0.45)',
    baseX: 28, // %
    baseY: 70, // %
    phase: 4.8,
    ribbonColorStart: '#34d399',
    ribbonColorEnd: '#10b981',
  },
  {
    id: 'backend',
    label: 'Cloud / Systems',
    icon: Layers,
    color: '#a78bfa', // Deep Indigo Violet
    glowColor: 'rgba(167, 139, 250, 0.4)',
    baseX: 50, // %
    baseY: 88, // %
    phase: 5.6,
    ribbonColorStart: '#a78bfa',
    ribbonColorEnd: '#6366f1',
  },
];

export const LivingEnergyGlobe = ({ isMobile = false, reducedMotion = false }) => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isInView, setIsInView] = useState(true);

  // Integrate authentic user skills if present in session
  const nodes = useMemo(() => {
    if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
      return CANONICAL_SKILL_NODES.map((node, idx) => {
        const userSkill = user.skills[idx % user.skills.length];
        const skillName = typeof userSkill === 'string' ? userSkill : userSkill?.name;
        return {
          ...node,
          label: skillName || node.label,
        };
      });
    }
    return isMobile ? CANONICAL_SKILL_NODES.slice(0, 4) : CANONICAL_SKILL_NODES;
  }, [user, isMobile]);

  // Spring cursor interpolation physics state
  const mouseState = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isHovering: false,
  });

  // Handle pointer tracking with smoothed normalization (-1 to 1)
  const handlePointerMove = (e) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    mouseState.current.targetX = Math.max(-1, Math.min(1, nx));
    mouseState.current.targetY = Math.max(-1, Math.min(1, ny));
    mouseState.current.isHovering = true;
  };

  const handlePointerLeave = () => {
    if (reducedMotion) return;
    mouseState.current.targetX = 0;
    mouseState.current.targetY = 0;
    mouseState.current.isHovering = false;
    setHoveredNodeId(null);
  };

  // IntersectionObserver to zero out CPU/GPU when scrolled out of viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.08 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // High-Performance Procedural Energy Globe & Flowing Ribbons Canvas Engine
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Procedural energy embers / micro-particles
    const particleCount = isMobile ? 18 : 42;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      orbitRadius: 70 + Math.random() * 140,
      angle: (i / particleCount) * Math.PI * 2,
      speed: (0.12 + Math.random() * 0.28) * (Math.random() > 0.5 ? 1 : -1),
      size: 1 + Math.random() * 2.2,
      opacity: 0.2 + Math.random() * 0.6,
      color: ['#38bdf8', '#fbbf24', '#c084fc', '#34d399', '#60a5fa'][i % 5],
      driftPhase: Math.random() * Math.PI * 2,
    }));

    let startTime = performance.now();

    const render = (now) => {
      if (!isInView || document.hidden) {
        // Paused when out of viewport or tab is hidden
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = reducedMotion ? 2.5 : (now - startTime) * 0.001;

      // 1. Spring physics update for cursor interaction
      const ms = mouseState.current;
      const lerpFactor = ms.isHovering ? 0.08 : 0.04;
      ms.currentX += (ms.targetX - ms.currentX) * lerpFactor;
      ms.currentY += (ms.targetY - ms.currentY) * lerpFactor;

      ctx.clearRect(0, 0, width, height);

      // Globe center coordinates with magnetic spring offset
      const centerX = width * 0.50 + ms.currentX * (isMobile ? 6 : 14);
      const centerY = height * 0.50 + ms.currentY * (isMobile ? 6 : 14);
      const baseRadius = isMobile ? 62 : Math.min(width, height) * 0.17;

      // ─────────────────────────────────────────────────────────────────────────
      // A. AMBIENT VOLUMETRIC GLOW PASS (Shared Atmospheric Environment)
      // ─────────────────────────────────────────────────────────────────────────
      // Large atmospheric cyan/blue ambient glow
      const ambCyan = ctx.createRadialGradient(
        centerX + 20, centerY + 10, 10,
        centerX + 20, centerY + 10, baseRadius * 3.4
      );
      ambCyan.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      ambCyan.addColorStop(0.4, 'rgba(37, 99, 235, 0.12)');
      ambCyan.addColorStop(0.75, 'rgba(15, 23, 42, 0.04)');
      ambCyan.addColorStop(1, 'transparent');
      ctx.fillStyle = ambCyan;
      ctx.beginPath();
      ctx.arc(centerX + 20, centerY + 10, baseRadius * 3.4, 0, Math.PI * 2);
      ctx.fill();

      // Warm solar amber ambient flare (upper-left side of globe as in reference)
      const ambGold = ctx.createRadialGradient(
        centerX - baseRadius * 0.45, centerY - baseRadius * 0.35, 5,
        centerX - baseRadius * 0.45, centerY - baseRadius * 0.35, baseRadius * 2.2
      );
      ambGold.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
      ambGold.addColorStop(0.35, 'rgba(245, 158, 11, 0.14)');
      ambGold.addColorStop(0.8, 'transparent');
      ctx.fillStyle = ambGold;
      ctx.beginPath();
      ctx.arc(centerX - baseRadius * 0.45, centerY - baseRadius * 0.35, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────────────────
      // B. ESCAPING ENERGY RIBBONS / FILAMENTS (4-7 Organic Streams)
      // ─────────────────────────────────────────────────────────────────────────
      nodes.forEach((node) => {
        const isHovered = hoveredNodeId === node.id;
        const hasAnyHover = Boolean(hoveredNodeId);

        // Terminal position of the node in pixels
        const targetPxX = (node.baseX / 100) * width + ms.currentX * 10;
        const targetPxY = (node.baseY / 100) * height + ms.currentY * 10;

        // Angle from center to node
        const angle = Math.atan2(targetPxY - centerY, targetPxX - centerX);

        // Origin on the undulating organic surface of the globe
        const originR = baseRadius * (0.85 + Math.sin(elapsed * 1.5 + node.phase) * 0.06);
        const originX = centerX + Math.cos(angle) * originR;
        const originY = centerY + Math.sin(angle) * originR;

        // Organic curved control points with sine wave turbulence & cursor attraction
        const dist = Math.hypot(targetPxX - originX, targetPxY - originY);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);

        // Wave displacement
        const wave1 = Math.sin(elapsed * 1.8 + node.phase * 2.1) * (dist * 0.14);
        const wave2 = Math.cos(elapsed * 1.2 + node.phase * 1.7) * (dist * 0.12);

        // Cursor deflection
        const mouseDeflectX = ms.currentX * 22;
        const mouseDeflectY = ms.currentY * 22;

        const cp1X = originX + Math.cos(angle) * (dist * 0.35) + perpX * wave1 + mouseDeflectX;
        const cp1Y = originY + Math.sin(angle) * (dist * 0.35) + perpY * wave1 + mouseDeflectY;

        const cp2X = originX + Math.cos(angle) * (dist * 0.72) + perpX * wave2 + mouseDeflectX * 0.6;
        const cp2Y = originY + Math.sin(angle) * (dist * 0.72) + perpY * wave2 + mouseDeflectY * 0.6;

        // Determine ribbon brightness & opacity
        let ribbonAlpha = 0.55;
        let strokeW = isMobile ? 2 : 3.2;

        if (isHovered) {
          ribbonAlpha = 0.95;
          strokeW = isMobile ? 3.5 : 5.5;
        } else if (hasAnyHover) {
          ribbonAlpha = 0.25;
        }

        // Gradient along the ribbon curve
        const grad = ctx.createLinearGradient(originX, originY, targetPxX, targetPxY);
        grad.addColorStop(0, isHovered ? '#ffffff' : node.ribbonColorStart);
        grad.addColorStop(0.5, node.ribbonColorEnd);
        grad.addColorStop(1, `${node.color}cc`);

        // Outer glow pass for the ribbon
        ctx.save();
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered ? 24 : 12;
        ctx.strokeStyle = grad;
        ctx.lineWidth = strokeW;
        ctx.lineCap = 'round';
        ctx.globalAlpha = ribbonAlpha;

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetPxX, targetPxY);
        ctx.stroke();

        // Secondary luminous thin core filament
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHovered ? 2.2 : 1.2;
        ctx.globalAlpha = isHovered ? 0.9 : ribbonAlpha * 0.7;
        ctx.stroke();
        ctx.restore();

        // Traveling energy pulses along the ribbon (data/spark signal)
        const pulseCount = isHovered ? 3 : 2;
        const pulseSpeed = isHovered ? 0.85 : 0.45;

        for (let p = 0; p < pulseCount; p++) {
          const tPulse = ((elapsed * pulseSpeed + (p / pulseCount) + node.phase * 0.3) % 1);
          // Evaluate cubic bezier at tPulse
          const u = 1 - tPulse;
          const px = u*u*u*originX + 3*u*u*tPulse*cp1X + 3*u*tPulse*tPulse*cp2X + tPulse*tPulse*tPulse*targetPxX;
          const py = u*u*u*originY + 3*u*u*tPulse*cp1Y + 3*u*tPulse*tPulse*cp2Y + tPulse*tPulse*tPulse*targetPxY;

          ctx.save();
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = isHovered ? 1.0 : (0.4 + 0.6 * Math.sin(tPulse * Math.PI));
          ctx.beginPath();
          ctx.arc(px, py, isHovered ? 3.5 : 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // ─────────────────────────────────────────────────────────────────────────
      // C. THE LIVING ENERGY GLOBE (Undulating Organic Center)
      // ─────────────────────────────────────────────────────────────────────────
      ctx.save();

      // 1. Organic outer corona flare (never a static circle)
      const coronaPoints = 36;
      ctx.beginPath();
      for (let i = 0; i <= coronaPoints; i++) {
        const theta = (i / coronaPoints) * Math.PI * 2;
        const noise = Math.sin(theta * 3 + elapsed * 2.2) * 6 +
                      Math.cos(theta * 5 - elapsed * 1.8) * 4;
        const r = baseRadius * 1.08 + noise;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const coronaGrad = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.6,
        centerX, centerY, baseRadius * 1.25
      );
      coronaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      coronaGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.25)');
      coronaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      // 2. Main Organic Plasma Sphere Body
      const bodyPoints = 48;
      ctx.beginPath();
      for (let i = 0; i <= bodyPoints; i++) {
        const theta = (i / bodyPoints) * Math.PI * 2;
        // Dual-harmonic organic surface undulating breath
        const wave = Math.sin(theta * 4 + elapsed * 1.6) * 4.5 +
                     Math.cos(theta * 2 - elapsed * 1.1) * 3.5 +
                     Math.sin(theta * 7 + elapsed * 2.8) * 2;
        const r = baseRadius + wave;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Organic electric shading gradient (Amber solar hot spot on left, cyan on right)
      const sphereGrad = ctx.createRadialGradient(
        centerX - baseRadius * 0.35, centerY - baseRadius * 0.3, baseRadius * 0.1,
        centerX, centerY, baseRadius * 1.05
      );
      sphereGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)'); // Solar amber-white hot core
      sphereGrad.addColorStop(0.22, 'rgba(251, 191, 36, 0.85)'); // Vibrant amber
      sphereGrad.addColorStop(0.48, 'rgba(56, 189, 248, 0.75)'); // Electric cyan
      sphereGrad.addColorStop(0.78, 'rgba(30, 58, 138, 0.82)'); // Deep cobalt
      sphereGrad.addColorStop(1, 'rgba(15, 23, 42, 0.92)');    // Deep ink boundary
      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 32;
      ctx.fill();

      // 3. Swirling Internal Electrical Tendrils & Filaments
      ctx.shadowBlur = 0;
      const tendrilCount = 7;
      for (let k = 0; k < tendrilCount; k++) {
        const rot = elapsed * (0.6 + k * 0.12) + k * (Math.PI / 3);
        const trX = centerX + Math.cos(rot) * (baseRadius * 0.35);
        const trY = centerY + Math.sin(rot) * (baseRadius * 0.35);

        ctx.strokeStyle = k % 2 === 0 ? 'rgba(254, 240, 138, 0.65)' : 'rgba(125, 211, 252, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(trX, trY, baseRadius * 0.42, rot, rot + Math.PI * 0.9);
        ctx.stroke();
      }

      // 4. Central Radiant Nucleus Hotspot (Tactile Luminous Source)
      const nucleusX = centerX - baseRadius * 0.18 + ms.currentX * 8;
      const nucleusY = centerY - baseRadius * 0.15 + ms.currentY * 8;
      const nucleusGrad = ctx.createRadialGradient(
        nucleusX, nucleusY, 0,
        nucleusX, nucleusY, baseRadius * 0.55
      );
      nucleusGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      nucleusGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.6)');
      nucleusGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.2)');
      nucleusGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nucleusGrad;
      ctx.beginPath();
      ctx.arc(nucleusX, nucleusY, baseRadius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ─────────────────────────────────────────────────────────────────────────
      // D. DRIFTING PARTICLES & EMBERS
      // ─────────────────────────────────────────────────────────────────────────
      particles.forEach((p) => {
        p.angle += p.speed * 0.015;
        const r = p.orbitRadius + Math.sin(elapsed * 1.5 + p.driftPhase) * 12;
        const px = centerX + Math.cos(p.angle) * r + ms.currentX * 12;
        const py = centerY + Math.sin(p.angle) * r + ms.currentY * 12;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.opacity * (0.6 + 0.4 * Math.sin(elapsed * 2 + p.driftPhase));
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isInView, reducedMotion, isMobile, nodes, hoveredNodeId]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative select-none w-full h-[480px] sm:h-[540px] lg:h-[580px] xl:h-[620px] flex items-center justify-center overflow-visible"
      aria-label="HackMatch Interactive Living Energy Globe and Match Field"
      role="region"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. PROCEDURAL WEBGL / 2D HIGH-PERFORMANCE ENERGY CANVAS
          Renders the central undulating plasma globe, escaping ribbons,
          filaments, and drifting particles.
          ───────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ willChange: 'transform' }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING INTERACTIVE SKILL NODES (DOM Layer)
          Positioned in 3D negative space along the energy ribbons.
          Uses HackMatch Liquid Glass tokens:
          - backdropFilter: blur(14px)
          - Subtle border highlight & tactile hover
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        {nodes.map((node) => {
          const isHovered = hoveredNodeId === node.id;
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              onPointerEnter={() => setHoveredNodeId(node.id)}
              onPointerLeave={() => setHoveredNodeId(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
              style={{
                left: `${node.baseX}%`,
                top: `${node.baseY}%`,
                transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease',
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.12 : 1})`,
              }}
            >
              {/* Canonical Liquid Glass Pill Container */}
              <div
                data-glass-panel
                className={`inline-flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full select-none transition-all duration-200 liquid-glass-floating ${
                  isHovered ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
                style={{
                  backgroundColor: isHovered
                    ? 'rgba(15, 23, 42, 0.88)'
                    : 'rgba(15, 23, 42, 0.68)',
                  backdropFilter: 'blur(14px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                  border: isHovered
                    ? `1.5px solid ${node.color}`
                    : '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: isHovered
                    ? `0 0 24px ${node.glowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.4)`
                    : '0 8px 24px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* Glowing Colored Icon Badge */}
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-transform duration-200"
                  style={{
                    backgroundColor: isHovered ? node.color : `${node.color}25`,
                    border: `1px solid ${node.color}`,
                    boxShadow: isHovered ? `0 0 12px ${node.color}` : 'none',
                  }}
                >
                  <Icon
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-200 ${
                      isHovered ? 'text-slate-950 font-bold' : 'text-white'
                    }`}
                  />
                </div>

                {/* Skill Label Typography */}
                <span
                  className="font-sans font-semibold tracking-tight text-xs sm:text-sm whitespace-nowrap transition-colors duration-200"
                  style={{
                    color: '#ffffff',
                    textShadow: isHovered ? `0 0 12px ${node.color}` : 'none',
                  }}
                >
                  {node.label}
                </span>

                {/* Micro Signal Dot on hover */}
                {isHovered && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping"
                    style={{ backgroundColor: node.color }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LivingEnergyGlobe;
