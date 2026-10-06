import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlusCircle, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { HeroTeamAssembly3D } from './HeroTeamAssembly3D';

gsap.registerPlugin(ScrollTrigger);

// ─── Inline hero CTA buttons
// Primary: yellow bg, ink text, 2px ink border, hard offset shadow (no gradient)
const HeroPrimaryBtn = ({ to, children, icon: Icon }) => (
  <Link
    to={to}
    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold rounded-sm select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    style={{
      backgroundColor: '#fbbf24',
      color: '#0f172a',
      border: '2px solid #0f172a',
      boxShadow: '4px 4px 0px #0f172a',
      transition: 'box-shadow 80ms ease, transform 80ms ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '2px 2px 0px #0f172a';
      e.currentTarget.style.transform = 'translate(2px, 2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '4px 4px 0px #0f172a';
      e.currentTarget.style.transform = '';
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.boxShadow = '0px 0px 0px #0f172a';
      e.currentTarget.style.transform = 'translate(4px, 4px)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.boxShadow = '4px 4px 0px #0f172a';
      e.currentTarget.style.transform = '';
    }}
  >
    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
    {children}
  </Link>
);

// Secondary: white outline for cobalt background
const HeroSecondaryBtn = ({ to, children, icon: Icon, isLight }) => (
  <Link
    to={to}
    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold rounded-sm select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors duration-150"
    style={{
      backgroundColor: 'transparent',
      color: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
      border: '2px solid rgba(255,255,255,0.4)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.65)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
    }}
  >
    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
    {children}
  </Link>
);

export const HomeHero = ({ activeHackathonsCount = 4 }) => {
  const { resolvedTheme, theme } = useTheme();
  const isLight = (resolvedTheme || theme) === 'light';

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const wrapperRef = useRef(null);
  const pinnedRef = useRef(null);
  const gridRef = useRef(null);
  const lineRefs = useRef([]);
  const subcopyRef = useRef(null);
  const ctaRef = useRef(null);

  const hasEnteredRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
      setReducedMotion(mq.matches);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    if (mq.addEventListener) mq.addEventListener('change', checkViewport);
    else mq.addListener(checkViewport);
    return () => {
      window.removeEventListener('resize', checkViewport);
      if (mq.removeEventListener) mq.removeEventListener('change', checkViewport);
      else mq.removeListener(checkViewport);
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ctx = gsap.context(() => {
      // 1. Entrance: headline lines rise from overflow mask
      if (!reducedMotion && !hasEnteredRef.current) {
        hasEnteredRef.current = true;
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const validLines = lineRefs.current.filter(Boolean);
        if (validLines.length > 0) {
          tl.from(validLines, { yPercent: 115, opacity: 0, duration: 0.75, stagger: 0.13 });
        }
        if (subcopyRef.current) {
          tl.from(subcopyRef.current, { opacity: 0, y: 20, duration: 0.5 }, '-=0.38');
        }
        if (ctaRef.current) {
          tl.from(ctaRef.current, { opacity: 0, y: 14, duration: 0.45 }, '-=0.28');
        }
      }

      // 2. ScrollTrigger pin + squad assembly (desktop only)
      if (!isMobile && !reducedMotion && wrapperRef.current && pinnedRef.current) {
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          pin: pinnedRef.current,
          pinSpacing: true,
          start: 'top 64px', // Navbar is h-16 = 64px
          end: '+=900px',
          scrub: 0.3,
          anticipatePin: 1,
          onUpdate: (self) => setScrollProgress(self.progress),
        });

        // Faint grid parallax travel during scroll
        if (gridRef.current) {
          gsap.to(gridRef.current, {
            backgroundPosition: '0px 36px',
            ease: 'none',
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top 64px',
              end: '+=900px',
              scrub: true,
            },
          });
        }
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, [isMobile, reducedMotion]);

  // Scroll-driven seat assembly progression
  const isBackendJoined = scrollProgress >= 0.25;
  const isMLJoined = scrollProgress >= 0.55;
  const isDesignerJoined = scrollProgress >= 0.85;
  const filledSeatsCount =
    1 + (isBackendJoined ? 1 : 0) + (isMLJoined ? 1 : 0) + (isDesignerJoined ? 1 : 0);

  // Poster background — dark cobalt in dark mode, rich blue in light mode
  const posterBg = isLight ? '#1e40af' : '#071528';

  // Faint structural grid lines
  const gridLineColor = isLight ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.055)';

  return (
    /*
     * Full-bleed breakout from StudentLayout's max-w-7xl main container.
     * marginTop: '-2rem' pulls hero flush against the 64px sticky navbar,
     * eliminating any gaps and preventing background particles from showing through.
     */
    <div
      ref={wrapperRef}
      className={`relative ${isMobile ? 'mb-12' : 'mb-8'}`}
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        maxWidth: '100vw',
        marginTop: '-2rem',
      }}
    >
      {/* Pinned viewport container */}
      <div ref={pinnedRef} className="w-full relative">

        {/*
         * HERO CANVAS — full-bleed, NO rounded corners, NO border card.
         * Sits flush below the navbar with solid background + isolation.
         */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            backgroundColor: posterBg,
            isolation: 'isolate',
            minHeight: isMobile ? 'auto' : 'calc(100vh - 64px)',
          }}
        >
          {/* Structural 72px grid — faint print-like architectural lines */}
          <div
            ref={gridRef}
            className="absolute inset-0 pointer-events-none select-none"
            aria-hidden="true"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${gridLineColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }}
          />

          {/* Vignette depth overlay */}
          <div
            className="absolute inset-0 pointer-events-none select-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)',
            }}
          />

          {/* Main Poster Grid — Left: Text. Right: 3D Assembly */}
          <div
            className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0"
            style={{
              padding: isMobile
                ? '32px 20px 48px'
                : 'clamp(56px, 8vh, 96px) clamp(32px, 5vw, 80px)',
              minHeight: isMobile ? 'auto' : 'calc(100vh - 64px)',
              alignItems: 'center',
            }}
          >

            {/* ── LEFT: EDITORIAL TEXT COLUMN ── */}
            <div
              className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-6 text-left"
              style={{ paddingRight: isMobile ? 0 : 'clamp(24px, 4vw, 64px)' }}
            >

              {/* Eyebrow — mono, ultra-quiet */}
              <div
                className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest select-none"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#fbbf24' }}
                />
                HackMatch — Campus Teammate Finder
              </div>

              {/* Primary Kinetic Headline — masked rise animation */}
              <h1
                className="font-black tracking-tight leading-[1.04] select-none"
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(2.4rem, 5.2vw, 4.6rem)',
                }}
              >
                {/* Line 1: white */}
                <div className="overflow-hidden pb-1">
                  <div
                    ref={(el) => (lineRefs.current[0] = el)}
                    className="block"
                    style={{ color: '#ffffff' }}
                  >
                    Four people.
                  </div>
                </div>

                {/* Line 2: white */}
                <div className="overflow-hidden pb-1">
                  <div
                    ref={(el) => (lineRefs.current[1] = el)}
                    className="block"
                    style={{ color: '#ffffff' }}
                  >
                    One idea.
                  </div>
                </div>

                {/* Line 3: amber — the single strategic accent */}
                <div className="overflow-hidden pb-1">
                  <div
                    ref={(el) => (lineRefs.current[2] = el)}
                    className="block"
                    style={{ color: '#fbbf24' }}
                  >
                    Three seats still empty.
                  </div>
                </div>
              </h1>

              {/* Supporting copy — plain language, max 18 words */}
              <p
                ref={subcopyRef}
                className="leading-relaxed max-w-md"
                style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                Find the teammates whose skills your hackathon idea is missing.
              </p>

              {/* CTA Row */}
              <div
                ref={ctaRef}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
              >
                <HeroPrimaryBtn to="/post-request" icon={PlusCircle}>
                  I need teammates
                </HeroPrimaryBtn>
                <HeroSecondaryBtn to="/hackathons" icon={Users} isLight={isLight}>
                  I want to join a team
                </HeroSecondaryBtn>
              </div>

              {/* Seat occupancy meter */}
              <div
                className="flex items-center gap-3 font-mono select-none"
                style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-7 rounded-full transition-all duration-400"
                      style={{
                        backgroundColor:
                          i < filledSeatsCount ? '#fbbf24' : 'rgba(255,255,255,0.18)',
                      }}
                    />
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {filledSeatsCount}/4 seats
                </span>
                {!isMobile && (
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {filledSeatsCount < 4 ? '— scroll to assemble' : '— squad complete'}
                  </span>
                )}
              </div>
            </div>

            {/* ── RIGHT: 3D TEAM ASSEMBLY ── */}
            <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center">
              {!isMobile && !reducedMotion ? (
                /* Three.js canvas assembly */
                <div className="relative w-full">
                  <HeroTeamAssembly3D progress={scrollProgress} isLight={isLight} />
                </div>
              ) : (
                /* Mobile / reduced-motion: flat CSS blocks — no card framing */
                <div
                  className="w-full max-w-sm grid grid-cols-2 gap-3 mt-4 lg:mt-0"
                  aria-label="Team seat grid"
                >
                  {/* YOU — filled, amber */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24"
                    style={{
                      backgroundColor: '#fbbf24',
                      border: '2px solid #0f172a',
                      boxShadow: '3px 3px 0 #0f172a',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: '#0f172a', opacity: 0.65 }}
                    >
                      Seat 01
                    </span>
                    <div>
                      <p className="text-base font-black leading-tight" style={{ color: '#0f172a' }}>
                        YOU
                      </p>
                      <p
                        className="text-[10px] font-mono font-bold uppercase"
                        style={{ color: '#0f172a', opacity: 0.75 }}
                      >
                        Team Lead
                      </p>
                    </div>
                  </div>

                  {/* BACKEND — empty seat outline */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px dashed rgba(52, 211, 153, 0.45)',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: 'rgba(52, 211, 153, 0.6)' }}
                    >
                      Seat 02
                    </span>
                    <div>
                      <p
                        className="text-sm font-black leading-tight uppercase"
                        style={{ color: 'rgba(52, 211, 153, 0.8)' }}
                      >
                        Backend
                      </p>
                      <p
                        className="text-[10px] font-mono font-bold"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        Open Seat
                      </p>
                    </div>
                  </div>

                  {/* ML ENGINEER — empty seat outline */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px dashed rgba(255, 255, 255, 0.35)',
                    }}
                  >
                    <span
                      className="text-[10px] font-mono font-extrabold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      Seat 03
                    </span>
                    <div>
                      <p
                        className="text-sm font-black leading-tight uppercase text-white/70"
                      >
                        ML Eng
                      </p>
                      <p
                        className="text-[10px] font-mono font-bold text-white/35"
                      >
                        Open Seat
                      </p>
                    </div>
                  </div>

                  {/* DESIGNER — empty seat outline */}
                  <div
                    className="p-3.5 flex flex-col justify-between h-24"
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
                        style={{ color: 'rgba(56, 189, 248, 0.8)' }}
                      >
                        Designer
                      </p>
                      <p
                        className="text-[10px] font-mono font-bold text-white/35"
                      >
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
