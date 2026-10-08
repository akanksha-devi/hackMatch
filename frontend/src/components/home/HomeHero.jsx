import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlusCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAnimation } from '../../animations/AnimationContext';
import { LivingEnergyGlobe } from './LivingEnergyGlobe';

gsap.registerPlugin(ScrollTrigger);

// ─── Canonical Primary CTA Button (Tactile Yellow with Hard Offset Shadow)
const HeroPrimaryBtn = ({ to, children, icon: Icon }) => (
  <Link
    to={to}
    className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-extrabold rounded-md select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f]"
    style={{
      backgroundColor: '#fbbf24',
      color: '#0f172a',
      border: '2px solid #0f172a',
      boxShadow: '4px 4px 0px #0f172a',
      transition: 'box-shadow 120ms cubic-bezier(0.23, 1, 0.32, 1), transform 120ms cubic-bezier(0.23, 1, 0.32, 1)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '6px 6px 0px #0f172a';
      e.currentTarget.style.transform = 'translate(-2px, -2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '4px 4px 0px #0f172a';
      e.currentTarget.style.transform = '';
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.boxShadow = '1px 1px 0px #0f172a';
      e.currentTarget.style.transform = 'translate(3px, 3px)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.boxShadow = '6px 6px 0px #0f172a';
      e.currentTarget.style.transform = 'translate(-2px, -2px)';
    }}
  >
    {Icon && <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />}
    <span className="relative z-10">{children}</span>
  </Link>
);

// ─── Canonical Secondary CTA Button (Translucent Glass Pill)
const HeroSecondaryBtn = ({ to, children, icon: Icon }) => (
  <Link
    to={to}
    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f] transition-all duration-200"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.22)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
      e.currentTarget.style.transform = 'translate(-2px, -2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.35)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)';
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = 'translate(1px, 1px)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = 'translate(-2px, -2px)';
    }}
  >
    {Icon && <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 text-white/80" />}
    <span>{children}</span>
  </Link>
);

export const HomeHero = ({ activeHackathonsCount = 4 }) => {
  const { user } = useAuth();
  const animCtx = useAnimation();

  // Responsive & Accessibility States
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [navHeight, setNavHeight] = useState(64);

  // Element Refs
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const cobaltLightRef = useRef(null);
  const mintLightRef = useRef(null);
  const yellowLightRef = useRef(null);

  // Headline Word Refs for Kinetic Reveal
  const eyebrowRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const subcopyRef = useRef(null);
  const ctaRef = useRef(null);
  const socialProofRef = useRef(null);
  const globeWrapperRef = useRef(null);

  const hasEnteredRef = useRef(false);

  // ── 1. Measure Actual Navbar Height & Device Capabilities
  useEffect(() => {
    const updateMetrics = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        setNavHeight(nav.offsetHeight);
      }
      setIsMobile(window.innerWidth < 860);
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  // ── 2. Mute Global Background Confetti/Particles while Hero is Active
  useEffect(() => {
    if (animCtx?.setOpacity) {
      animCtx.setOpacity(0);
    }
    return () => {
      if (animCtx?.setOpacity) {
        animCtx.setOpacity(0.9);
      }
    };
  }, [animCtx]);

  // ── 3. GSAP Kinetic Entrance & Scroll Parallax (Native Scroll, NO Pinning)
  useEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // A. Initial Load Entrance Reveal (word-by-word rising masks)
      if (!reducedMotion && !hasEnteredRef.current) {
        hasEnteredRef.current = true;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (eyebrowRef.current) {
          tl.from(eyebrowRef.current, {
            opacity: 0,
            y: -12,
            duration: 0.5,
          });
        }

        const lines = [line1Ref.current, line2Ref.current, line3Ref.current].filter(Boolean);
        if (lines.length > 0) {
          tl.from(lines, {
            yPercent: 120,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
          }, '-=0.25');
        }

        if (subcopyRef.current) {
          tl.from(subcopyRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.55,
          }, '-=0.4');
        }

        if (ctaRef.current) {
          tl.from(ctaRef.current, {
            opacity: 0,
            y: 18,
            duration: 0.45,
          }, '-=0.3');
        }

        if (socialProofRef.current) {
          tl.from(socialProofRef.current, {
            opacity: 0,
            y: 12,
            duration: 0.4,
          }, '-=0.2');
        }

        if (globeWrapperRef.current) {
          tl.from(globeWrapperRef.current, {
            opacity: 0,
            scale: 0.94,
            duration: 0.85,
            ease: 'power2.out',
          }, '-=0.55');
        }
      }

      // B. Native Scroll Subtle Parallax (Desktop & Tablet >= 860px) - NO Pinning!
      if (!isMobile && !reducedMotion && wrapperRef.current) {
        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
            onLeave: () => {
              if (animCtx?.setOpacity) animCtx.setOpacity(0.9);
            },
            onEnterBack: () => {
              if (animCtx?.setOpacity) animCtx.setOpacity(0);
            },
          },
        });

        // 1. Atmospheric Ambient Lights Drift (Transform only)
        if (cobaltLightRef.current) {
          heroTimeline.to(cobaltLightRef.current, {
            y: 120,
            x: -50,
            ease: 'none',
          }, 0);
        }

        if (mintLightRef.current) {
          heroTimeline.to(mintLightRef.current, {
            y: -90,
            x: -30,
            ease: 'none',
          }, 0);
        }

        if (yellowLightRef.current) {
          heroTimeline.to(yellowLightRef.current, {
            y: 60,
            ease: 'none',
          }, 0);
        }

        // 2. Faint Structural Grid Parallax (72px alignment)
        if (gridRef.current) {
          heroTimeline.to(gridRef.current, {
            backgroundPosition: '0px 36px',
            ease: 'none',
          }, 0);
        }

        // 3. Living Energy Globe subtle vertical drift
        if (globeWrapperRef.current) {
          heroTimeline.to(globeWrapperRef.current, {
            y: 40,
            ease: 'none',
          }, 0);
        }
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, [isMobile, reducedMotion, animCtx]);

  // Deep Ink Environmental Base Color
  const deepInkBg = '#06080f';

  return (
    <div
      ref={wrapperRef}
      className={`relative ${isMobile ? 'mb-10' : 'mb-8'}`}
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        maxWidth: '100vw',
        marginTop: '-2rem', // Cancels main container's py-8 top padding to sit flush under navbar
      }}
    >
      {/* ─── Hero Canvas Stage (Full-bleed, Deep Ink Base, Stacking Context Root) ─── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: deepInkBg,
          isolation: 'isolate',
          minHeight: isMobile ? 'auto' : `calc(100svh - ${navHeight}px)`,
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
            LAYER 0: ATMOSPHERIC ENVIRONMENT & MOVING AMBIENT LIGHT SOURCES
            Three primary lights: Cobalt, Mint, Solar Yellow
            ══════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
          {/* Ambient Light 1: Deep Cobalt */}
          <div
            ref={cobaltLightRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '780px',
              height: '780px',
              top: '-10%',
              left: '12%',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.34) 0%, rgba(30, 64, 175, 0.16) 48%, transparent 72%)',
              filter: 'blur(100px)',
              willChange: 'transform',
            }}
          />

          {/* Ambient Light 2: Fresh Mint */}
          <div
            ref={mintLightRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '680px',
              height: '680px',
              top: '20%',
              right: '4%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.12) 52%, transparent 72%)',
              filter: 'blur(95px)',
              willChange: 'transform',
            }}
          />

          {/* Ambient Light 3: Solar Yellow Accent */}
          <div
            ref={yellowLightRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '400px',
              height: '400px',
              top: '32%',
              left: '44%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.24) 0%, rgba(251, 191, 36, 0.08) 55%, transparent 75%)',
              filter: 'blur(75px)',
              willChange: 'transform',
            }}
          />

          {/* Faint Structural 72px Architectural Grid */}
          <div
            ref={gridRef}
            className="absolute inset-0 pointer-events-none select-none opacity-60"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }}
          />

          {/* Vignette Edge Depth Falloff */}
          <div
            className="absolute inset-0 pointer-events-none select-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(6, 8, 15, 0.6) 100%)',
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MAIN HERO SPATIAL STAGE (Split Desktop Composition)
            Left: Editorial Headline + Copy + Tactile Actions (z-index 3)
            Right: Interactive Living Energy Globe / Match Field (z-index 2)
            ══════════════════════════════════════════════════════════════════ */}
        <div
          className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center"
          style={{
            padding: isMobile
              ? '36px 20px 48px'
              : 'clamp(44px, 7vh, 88px) clamp(24px, 4vw, 72px)',
            minHeight: isMobile ? 'auto' : `calc(100svh - ${navHeight}px)`,
          }}
        >
          {/* ─── LEFT COLUMN: EDITORIAL HEADLINE & ACTIONS (Z-INDEX 3) ─── */}
          <div
            className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center space-y-6 text-left relative z-[3]"
            style={{ paddingRight: isMobile ? 0 : 'clamp(16px, 2.5vw, 40px)' }}
          >
            {/* Eyebrow Label */}
            <div
              ref={eyebrowRef}
              className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest select-none"
              style={{ color: 'rgba(255, 255, 255, 0.65)' }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                style={{ backgroundColor: '#fbbf24' }}
              />
              HackMatch — Campus Teammate Finder
            </div>

            {/* Primary Headline with Kinetic Reveal Masks */}
            <h1
              className="font-black tracking-tight leading-[1.04] select-none"
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 4.4rem)',
                color: '#ffffff',
              }}
            >
              {/* Line 1 */}
              <div className="overflow-hidden pb-1">
                <div ref={line1Ref} className="block" style={{ color: '#ffffff' }}>
                  Four people.
                </div>
              </div>

              {/* Line 2 */}
              <div className="overflow-hidden pb-1">
                <div ref={line2Ref} className="block" style={{ color: '#ffffff' }}>
                  One idea.
                </div>
              </div>

              {/* Line 3: Canonical Amber Accent Phrase */}
              <div className="overflow-hidden pb-1">
                <div
                  ref={line3Ref}
                  className="block font-black"
                  style={{ color: '#fbbf24' }}
                >
                  Three seats still empty.
                </div>
              </div>
            </h1>

            {/* Supporting Copy (Clear, Plain Language, Max 18 Words) */}
            <p
              ref={subcopyRef}
              className="leading-relaxed max-w-md font-normal"
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Find the teammates whose skills your hackathon idea is missing.
            </p>

            {/* Primary & Secondary Actions */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <HeroPrimaryBtn to="/post-request" icon={PlusCircle}>
                I need teammates
              </HeroPrimaryBtn>
              <HeroSecondaryBtn to="/hackathons" icon={Users}>
                I want to join a team
              </HeroSecondaryBtn>
            </div>

            {/* Subtle Social Proof (Reference Image Pattern: "2,000+ students already building") */}
            <div
              ref={socialProofRef}
              className="flex items-center gap-3 pt-2 select-none"
            >
              <div className="flex -space-x-2 overflow-hidden">
                {['bg-amber-500', 'bg-sky-500', 'bg-emerald-500', 'bg-purple-500'].map((color, i) => (
                  <div
                    key={i}
                    className={`inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-[#06080f] ${color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                  >
                    {['JD', 'AL', 'SK', 'MR'][i]}
                  </div>
                ))}
              </div>
              <div className="text-xs font-medium text-slate-300">
                <span className="font-bold text-white">2,000+ students</span> already building
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: LIVING ENERGY GLOBE / MATCH FIELD (Z-INDEX 2) ─── */}
          <div
            ref={globeWrapperRef}
            className="lg:col-span-7 xl:col-span-7 relative w-full flex items-center justify-center relative z-[2] overflow-visible"
          >
            <LivingEnergyGlobe isMobile={isMobile} reducedMotion={reducedMotion} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
