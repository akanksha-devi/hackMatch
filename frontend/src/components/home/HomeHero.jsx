import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlusCircle, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAnimation } from '../../animations/AnimationContext';
import { HeroTeamAssembly3D } from './HeroTeamAssembly3D';

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

  // User initial from authentic authentication data
  const userInitial = useMemo(() => {
    if (user?.name && typeof user.name === 'string') {
      return user.name.trim().charAt(0).toUpperCase();
    }
    return null;
  }, [user]);

  // Responsive & Accessibility States
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [navHeight, setNavHeight] = useState(64);

  // Element Refs
  const wrapperRef = useRef(null);
  const pinnedRef = useRef(null);
  const gridRef = useRef(null);
  const cobaltLightRef = useRef(null);
  const mintLightRef = useRef(null);
  const yellowLightRef = useRef(null);

  // Headline Word Refs for Kinetic Reveal
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3EmptyRef = useRef(null);
  const line3CompleteRef = useRef(null);
  const subcopyRef = useRef(null);
  const ctaRef = useRef(null);
  const glassPanelRef = useRef(null);

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

  // ── 3. GSAP Kinetic Entrance & ScrollTrigger Choreography
  useEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // A. Initial Load Entrance Reveal (word-by-word rising masks)
      if (!reducedMotion && !hasEnteredRef.current) {
        hasEnteredRef.current = true;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        const lines = [line1Ref.current, line2Ref.current, line3EmptyRef.current].filter(Boolean);
        if (lines.length > 0) {
          tl.from(lines, {
            yPercent: 120,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
          });
        }

        if (subcopyRef.current) {
          tl.from(subcopyRef.current, {
            opacity: 0,
            y: 22,
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
      }

      // B. ScrollTrigger Scrub Timeline (Desktop & Tablet >= 860px)
      if (!isMobile && !reducedMotion && wrapperRef.current && pinnedRef.current) {
        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            pin: pinnedRef.current,
            pinSpacing: true,
            start: `top ${navHeight}px`,
            end: '+=1100px', // ~220-250vh equivalent scroll range
            scrub: 1,       // Precise physical momentum scrub
            anticipatePin: 1,
            onUpdate: (self) => {
              setScrollProgress(self.progress);
            },
            onLeave: () => {
              // Smoothly fade global background canvas back in as user passes hero
              if (animCtx?.setOpacity) animCtx.setOpacity(0.9);
            },
            onEnterBack: () => {
              // Mute background again when returning to hero
              if (animCtx?.setOpacity) animCtx.setOpacity(0);
            },
          },
        });

        // 1. Atmospheric Light Movement (transform only, zero layout shift)
        if (cobaltLightRef.current) {
          heroTimeline.to(cobaltLightRef.current, {
            x: -120,
            y: 90,
            ease: 'none',
          }, 0);
        }

        if (mintLightRef.current) {
          heroTimeline.to(mintLightRef.current, {
            x: -90,
            y: -110,
            ease: 'none',
          }, 0);
        }

        if (yellowLightRef.current) {
          heroTimeline.to(yellowLightRef.current, {
            x: 70,
            y: -60,
            ease: 'none',
          }, 0);
        }

        // 2. Faint Structural Grid Parallax (72px alignment)
        if (gridRef.current) {
          heroTimeline.to(gridRef.current, {
            backgroundPosition: '0px 48px',
            ease: 'none',
          }, 0);
        }

        // 3. Headline End-State Transformation (at 80-90% scroll progress)
        // "Three seats still empty." rises up & fades -> "Squad complete." enters cleanly
        if (line3EmptyRef.current && line3CompleteRef.current) {
          gsap.set(line3CompleteRef.current, { yPercent: 120, opacity: 0 });

          heroTimeline.to(line3EmptyRef.current, {
            yPercent: -130,
            opacity: 0,
            ease: 'power2.in',
            duration: 0.07,
          }, 0.80);

          heroTimeline.to(line3CompleteRef.current, {
            yPercent: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.08,
          }, 0.85);
        }
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, [isMobile, reducedMotion, navHeight, animCtx]);

  // Derived Squad Assembly Status
  const isBackendJoined = scrollProgress >= 0.20;
  const isMLJoined = scrollProgress >= 0.45;
  const isDesignerJoined = scrollProgress >= 0.70;
  const isFullyAssembled = scrollProgress >= 0.90;

  const filledSeatsCount = isMobile
    ? 1
    : 1 + (isBackendJoined ? 1 : 0) + (isMLJoined ? 1 : 0) + (isDesignerJoined ? 1 : 0);

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
      {/* Accessible Screen Reader State Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`${filledSeatsCount} of 4 seats filled`}
      </div>

      {/* Pinned Stage Container */}
      <div ref={pinnedRef} className="w-full relative">

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

            {/* Ambient Light 1: Deep Cobalt (Drifts with scroll) */}
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

            {/* Ambient Light 2: Fresh Mint (Drifts upward with scroll) */}
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

            {/* Ambient Light 3: Solar Yellow Accent (Grounds the YOU block) */}
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
              Left: Headline + Copy + Tactile Buttons (z-index 3)
              Right: 3D Team Canvas (z-index 1) + Liquid Glass Panel (z-index 2)
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center"
            style={{
              padding: isMobile
                ? '32px 20px 48px'
                : 'clamp(48px, 7vh, 88px) clamp(32px, 5vw, 84px)',
              minHeight: isMobile ? 'auto' : `calc(100svh - ${navHeight}px)`,
            }}
          >

            {/* ─── LEFT COLUMN: EDITORIAL HEADLINE & ACTIONS (Z-INDEX 3) ─── */}
            <div
              className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-6 text-left relative z-[3]"
              style={{ paddingRight: isMobile ? 0 : 'clamp(24px, 4vw, 56px)' }}
            >
              {/* Eyebrow Label */}
              <div
                className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest select-none"
                style={{ color: 'rgba(255, 255, 255, 0.55)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  style={{ backgroundColor: '#fbbf24' }}
                />
                HackMatch — Campus Teammate Finder
              </div>

              {/* Primary Headline with Kinetic Masks */}
              <h1
                className="font-black tracking-tight leading-[1.04] select-none text-white"
                style={{
                  fontSize: 'clamp(2.4rem, 5.2vw, 4.6rem)',
                }}
              >
                {/* Line 1 */}
                <div className="overflow-hidden pb-1">
                  <div ref={line1Ref} className="block text-white">
                    Four people.
                  </div>
                </div>

                {/* Line 2 */}
                <div className="overflow-hidden pb-1">
                  <div ref={line2Ref} className="block text-white">
                    One idea.
                  </div>
                </div>

                {/* Line 3: Transformable Phrase ("Three seats still empty." -> "Squad complete.") */}
                <div className="overflow-hidden pb-1 relative min-h-[1.15em]">
                  {/* Initial Phrase */}
                  <div
                    ref={line3EmptyRef}
                    className="block"
                    style={{ color: '#fbbf24' }}
                  >
                    Three seats still empty.
                  </div>

                  {/* End-State Transformed Phrase */}
                  <div
                    ref={line3CompleteRef}
                    className="absolute inset-0 block font-black"
                    style={{
                      color: '#34d399',
                    }}
                  >
                    Squad complete.
                  </div>
                </div>
              </h1>

              {/* Supporting Copy (Clear, Plain Language, Max 18 Words) */}
              <p
                ref={subcopyRef}
                className="leading-relaxed max-w-md font-normal"
                style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                  color: 'rgba(255, 255, 255, 0.8)',
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

              {/* Kinetic Scroll Cue / Team Progress Indicator */}
              <div
                className="flex items-center gap-3 font-mono select-none pt-1"
                style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)' }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-7 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          i < filledSeatsCount
                            ? (isFullyAssembled ? '#34d399' : '#fbbf24')
                            : 'rgba(255, 255, 255, 0.16)',
                        boxShadow:
                          i < filledSeatsCount
                            ? (isFullyAssembled ? '0 0 8px rgba(52, 211, 153, 0.4)' : '0 0 8px rgba(251, 191, 36, 0.4)')
                            : 'none',
                      }}
                    />
                  ))}
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                  {filledSeatsCount}/4 seats
                </span>
                {!isMobile && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                    {isFullyAssembled ? '— squad fully assembled' : '— scroll down to assemble'}
                  </span>
                )}
              </div>
            </div>

            {/* ─── RIGHT COLUMN: SPATIAL STAGE (CANVAS UNDERNEATH, GLASS OVERLAY) ─── */}
            <div className="lg:col-span-6 xl:col-span-5 relative w-full flex items-center justify-center">

              {!isMobile && !reducedMotion && !hasWebGLError ? (
                /* Desktop/Tablet 3D Spatial Stacking Context */
                <div
                  className="relative w-full h-[480px] sm:h-[520px] lg:h-[540px] xl:h-[560px] flex items-center justify-center"
                  style={{ isolation: 'isolate' }}
                >
                  {/* ─────────────────────────────────────────────────────────────
                      LAYER 1: Three.js Physical 3D Canvas (z-index 1)
                      Sits UNDERNEATH the glass squad panel.
                      Tops of blocks (YOU, BACKEND) are exposed in sharp open space!
                      Lower portions pass behind the glass panel and visibly blur!
                      ───────────────────────────────────────────────────────────── */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none"
                    style={{ zIndex: 1 }}
                  >
                    <HeroTeamAssembly3D
                      progress={scrollProgress}
                      userInitial={userInitial}
                      onContextLost={() => setHasWebGLError(true)}
                    />
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      LAYER 2: Real Frosted Liquid Glass Squad Panel (z-index 2)
                      Direct SIBLING of the canvas. No intervening backdrop root!
                      Positioned over the LOWER ~40% of the team cluster.
                      Visible human difference:
                        Outside glass: 3D block is completely sharp.
                        Inside glass: 3D block is visibly softer/blurred!
                      ───────────────────────────────────────────────────────────── */}
                  <div
                    className="absolute bottom-2 right-0 sm:right-2 w-full sm:w-[330px] md:w-[340px]"
                    style={{ zIndex: 2 }}
                  >
                    <div
                      ref={glassPanelRef}
                      data-glass-panel
                      className="liquid-glass-floating rounded-2xl p-4 sm:p-5 text-white select-none transition-[backdrop-filter] duration-200"
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.44)',
                        backdropFilter: 'blur(20px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      {/* Glass Panel Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                          Example Team
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {filledSeatsCount} of 4 seats filled
                        </span>
                      </div>

                      {/* 4 Compact Role Rows (Clear 14px Typography, No Fake Telemetry) */}
                      <div className="space-y-2 text-sm font-sans">
                        {/* Seat 1: YOU */}
                        <div className="flex items-center justify-between py-1">
                          <span className="font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                            {userInitial ? `YOU (${userInitial})` : 'YOU'}
                          </span>
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            FILLED
                          </span>
                        </div>

                        {/* Seat 2: BACKEND */}
                        <div className="flex items-center justify-between py-1">
                          <span className="font-medium text-white/85 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                isBackendJoined ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-white/20'
                              }`}
                            />
                            BACKEND
                          </span>
                          <span
                            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded transition-all duration-300 ${
                              isBackendJoined
                                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            {isBackendJoined ? 'FILLED' : 'OPEN'}
                          </span>
                        </div>

                        {/* Seat 3: ML ENGINEER */}
                        <div className="flex items-center justify-between py-1">
                          <span className="font-medium text-white/85 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                isMLJoined ? 'bg-slate-200 shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'bg-white/20'
                              }`}
                            />
                            ML ENGINEER
                          </span>
                          <span
                            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded transition-all duration-300 ${
                              isMLJoined
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            {isMLJoined ? 'FILLED' : 'OPEN'}
                          </span>
                        </div>

                        {/* Seat 4: DESIGNER */}
                        <div className="flex items-center justify-between py-1">
                          <span className="font-medium text-white/85 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                isDesignerJoined ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]' : 'bg-white/20'
                              }`}
                            />
                            DESIGNER
                          </span>
                          <span
                            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded transition-all duration-300 ${
                              isDesignerJoined
                                ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            {isDesignerJoined ? 'FILLED' : 'OPEN'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── MOBILE / REDUCED-MOTION / WEBGL-LOST ACCESSIBLE FALLBACK ─── */
                <div
                  className="w-full max-w-sm grid grid-cols-2 gap-3 mt-4 lg:mt-0"
                  aria-label="Team member positions"
                >
                  {/* Block 1: YOU (Filled Amber) */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24 rounded-xl"
                    style={{
                      backgroundColor: '#f59e0b',
                      border: '2px solid #0f172a',
                      boxShadow: '3px 3px 0 #0f172a',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: '#0f172a', opacity: 0.7 }}
                    >
                      Seat 01
                    </span>
                    <div>
                      <p className="text-base font-black leading-tight" style={{ color: '#0f172a' }}>
                        {userInitial ? `YOU (${userInitial})` : 'YOU'}
                      </p>
                      <p
                        className="text-[10px] font-mono font-bold uppercase"
                        style={{ color: '#0f172a', opacity: 0.75 }}
                      >
                        Team Lead
                      </p>
                    </div>
                  </div>

                  {/* Block 2: BACKEND (Open Dashed Slot) */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24 rounded-xl"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px dashed rgba(16, 185, 129, 0.45)',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: 'rgba(16, 185, 129, 0.6)' }}
                    >
                      Seat 02
                    </span>
                    <div>
                      <p
                        className="text-sm font-black leading-tight uppercase"
                        style={{ color: 'rgba(16, 185, 129, 0.85)' }}
                      >
                        Backend
                      </p>
                      <p
                        className="text-[10px] font-mono font-bold"
                        style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                      >
                        Open Seat
                      </p>
                    </div>
                  </div>

                  {/* Block 3: ML ENGINEER (Open Dashed Slot) */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24 rounded-xl"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px dashed rgba(255, 255, 255, 0.35)',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                      Seat 03
                    </span>
                    <div>
                      <p className="text-sm font-black leading-tight uppercase text-white/70">
                        ML Eng
                      </p>
                      <p className="text-[10px] font-mono font-bold text-white/35">
                        Open Seat
                      </p>
                    </div>
                  </div>

                  {/* Block 4: DESIGNER (Open Dashed Slot) */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24 rounded-xl"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px dashed rgba(56, 189, 248, 0.45)',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: 'rgba(56, 189, 248, 0.6)' }}
                    >
                      Seat 04
                    </span>
                    <div>
                      <p
                        className="text-sm font-black leading-tight uppercase"
                        style={{ color: 'rgba(56, 189, 248, 0.85)' }}
                      >
                        Designer
                      </p>
                      <p className="text-[10px] font-mono font-bold text-white/35">
                        Open Seat
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
