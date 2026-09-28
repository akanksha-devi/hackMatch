import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { SCENE_KEYS, PAGE_SCENE_MAP, getSceneForRoute, getDeviceProfile } from './animationConfig';
import { useTheme } from '../context/ThemeContext';
import { useThemeTransition } from '../context/ThemeTransitionContext';

// Import all 10 scenes
import { ParticleUniverseScene } from './scenes/ParticleUniverseScene';
import { EventOrbitScene } from './scenes/EventOrbitScene';
import { ConstellationScene } from './scenes/ConstellationScene';
import { SkillConstellationScene } from './scenes/SkillConstellationScene';
import { PersonalAuraScene } from './scenes/PersonalAuraScene';
import { TeamAssemblyScene } from './scenes/TeamAssemblyScene';
import { ConnectionFlowScene } from './scenes/ConnectionFlowScene';
import { DataUniverseScene } from './scenes/DataUniverseScene';
import { DataGridScene } from './scenes/DataGridScene';
import { PortalScene } from './scenes/PortalScene';

// Energy Core Component
import { EnergyCore } from './components/EnergyCore';

import { useAnimation } from './AnimationContext';

/**
 * Robust WebGL availability detector
 */
const checkWebGLSupport = () => {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/**
 * Error boundary for Canvas and 3D scenes to prevent app white screens
 */
class AnimationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[AnimationBackground] WebGL caught render error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Cinematic 3D Camera Drift & Spatial Cursor Parallax
 * Gently pans and pitches camera for natural spatial depth and multi-plane parallax
 */
const CameraDrift = ({ reducedMotion }) => {
  const { transitionRef } = useThemeTransition();
  const cameraPosRef = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    const meta = transitionRef?.current;
    const isTransitionActive = meta && meta.active && meta.collapseAmount > 0.001;

    // During transition peak, damp camera movement to focus smoothly on Energy Core
    const damp = isTransitionActive ? Math.max(0.2, 1 - meta.collapseAmount * 0.75) : 1;

    // Normalized cursor coordinates (-1 to 1)
    const cursor = (typeof window !== 'undefined' && window.__hackmatchCursor) || state.pointer;
    const cx = cursor ? cursor.x : 0;
    const cy = cursor ? cursor.y : 0;

    // Subtle spatial cursor parallax (cursor right -> camera shifts slightly left)
    const parallaxX = -cx * 0.85;
    const parallaxY = -cy * 0.55;

    // Ambient low-frequency drift
    const driftX = Math.sin(t * 0.1) * 0.65;
    const driftY = Math.cos(t * 0.07) * 0.4;

    const targetX = (driftX + parallaxX) * damp;
    const targetY = (driftY + parallaxY) * damp;

    cameraPosRef.current.x += (targetX - cameraPosRef.current.x) * 0.045;
    cameraPosRef.current.y += (targetY - cameraPosRef.current.y) * 0.045;

    state.camera.position.x = cameraPosRef.current.x;
    state.camera.position.y = cameraPosRef.current.y;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

/**
 * CSS 2D Fallback for environments lacking WebGL or in emergency error states
 */
const CSSAmbientFallback = ({ opacity = 0.8, theme = 'dark' }) => {
  const isLight = theme === 'light';
  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-700 ${
        isLight ? 'bg-[#f8fafc]' : 'bg-[#07090e]'
      }`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isLight ? 'bg-indigo-300/30' : 'bg-indigo-600/15'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          isLight ? 'bg-sky-300/30' : 'bg-cyan-500/10'
        }`}
      />
      <div
        className={`absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full blur-3xl animate-pulse delay-700 ${
          isLight ? 'bg-purple-300/25' : 'bg-purple-600/15'
        }`}
      />
      <div
        className={`absolute inset-0 ${
          isLight
            ? 'bg-radial-gradient from-transparent via-slate-100/40 to-slate-100/70'
            : 'bg-radial-gradient from-transparent via-gray-950/60 to-gray-950/90'
        }`}
      />
    </div>
  );
};

/**
 * Scene Resolver Component
 */
const SceneRenderer = ({ activeSceneKey, density, theme, reducedMotion }) => {
  switch (activeSceneKey) {
    case SCENE_KEYS.HOME:
      return <ParticleUniverseScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.HACKATHONS:
      return <EventOrbitScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.HACKATHON_DETAIL:
      return <ConstellationScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.USERS:
      return <SkillConstellationScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.PROFILE:
      return <PersonalAuraScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.POST_REQUEST:
      return <TeamAssemblyScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.MY_REQUESTS:
      return <ConnectionFlowScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.DASHBOARD:
      return <DataUniverseScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.ADMIN:
      return <DataGridScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.AUTH:
      return <PortalScene density={density} theme={theme} reducedMotion={reducedMotion} />;
    default:
      return <ParticleUniverseScene density={density} theme={theme} reducedMotion={reducedMotion} />;
  }
};

/**
 * Master Animation Background Component
 * Renders a full-screen, non-blocking 3D WebGL ambient background behind all page content.
 */
export const AnimationBackground = ({
  scene,
  opacity,
  reducedMotion: forcedReducedMotion,
  className = '',
  isRoot = false,
}) => {
  const location = useLocation();
  const animCtx = useAnimation();
  const { resolvedTheme = 'dark' } = useTheme();

  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [deviceProfile, setDeviceProfile] = useState(getDeviceProfile);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  // If used inside a page while an AnimationProvider is active, delegate scene to the root canvas
  useEffect(() => {
    if (scene && animCtx?.setScene && !isRoot) {
      animCtx.setScene(PAGE_SCENE_MAP[scene] || scene);
    }
  }, [scene, animCtx, isRoot]);

  // If this is a child call inside an existing provider, return null so no duplicate canvas is mounted
  if (!isRoot && animCtx?.isRegistered && scene) {
    return null;
  }

  // 1. Detect WebGL support on mount
  useEffect(() => {
    setWebGLSupported(checkWebGLSupport());
  }, []);

  // 2. Detect Reduced Motion preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(mediaQuery.matches);

    const handler = (e) => setSystemReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 3. Responsive resize handler for device profile scaling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setDeviceProfile(getDeviceProfile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. Global window pointer tracking for seamless spatial parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePointerMove = (e) => {
      window.__hackmatchCursor = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const reducedMotion = forcedReducedMotion !== undefined ? forcedReducedMotion : systemReducedMotion;

  // Resolve target scene
  const activeSceneKey = useMemo(() => {
    if (animCtx?.scene) {
      return animCtx.scene;
    }
    if (scene) {
      return PAGE_SCENE_MAP[scene] || scene;
    }
    return getSceneForRoute(location?.pathname || '/');
  }, [animCtx?.scene, scene, location?.pathname]);

  // Dynamic opacity based on theme: keep both Dark and Light modes clearly visible and luminous
  const effectiveOpacity = opacity !== undefined ? opacity : (resolvedTheme === 'light' ? 0.9 : 0.9);

  // Fallback to CSS animation if WebGL is unavailable or encountered an error
  if (!webGLSupported || hasError) {
    return <CSSAmbientFallback opacity={effectiveOpacity} theme={resolvedTheme} />;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-1000 ${className}`}
      style={{ opacity: effectiveOpacity }}
      aria-hidden="true"
    >
      <AnimationErrorBoundary
        fallback={<CSSAmbientFallback opacity={effectiveOpacity} theme={resolvedTheme} />}
        onError={() => setHasError(true)}
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          dpr={deviceProfile.dpr}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          onError={() => setHasError(true)}
        >
          <CameraDrift reducedMotion={reducedMotion} />
          <Suspense fallback={null}>
            <SceneRenderer
              activeSceneKey={activeSceneKey}
              density={deviceProfile.particleMultiplier}
              theme={resolvedTheme}
              reducedMotion={reducedMotion}
            />
            <EnergyCore position={[0, 0, -2]} />
          </Suspense>
        </Canvas>
      </AnimationErrorBoundary>
    </div>
  );
};

export default AnimationBackground;
