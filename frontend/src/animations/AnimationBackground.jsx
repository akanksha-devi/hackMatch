import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { SCENE_KEYS, PAGE_SCENE_MAP, getSceneForRoute, getDeviceProfile } from './animationConfig';

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
 * CSS 2D Fallback for environments lacking WebGL or in emergency error states
 */
const CSSAmbientFallback = ({ opacity = 0.8 }) => (
  <div
    className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-1000"
    style={{ opacity }}
    aria-hidden="true"
  >
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
    <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-3xl animate-pulse delay-700" />
    <div className="absolute inset-0 bg-radial-gradient from-transparent via-gray-950/60 to-gray-950/90" />
  </div>
);

/**
 * Scene Resolver Component
 */
const SceneRenderer = ({ activeSceneKey, density, reducedMotion }) => {
  switch (activeSceneKey) {
    case SCENE_KEYS.HOME:
      return <ParticleUniverseScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.HACKATHONS:
      return <EventOrbitScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.HACKATHON_DETAIL:
      return <ConstellationScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.USERS:
      return <SkillConstellationScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.PROFILE:
      return <PersonalAuraScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.POST_REQUEST:
      return <TeamAssemblyScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.MY_REQUESTS:
      return <ConnectionFlowScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.DASHBOARD:
      return <DataUniverseScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.ADMIN:
      return <DataGridScene density={density} reducedMotion={reducedMotion} />;
    case SCENE_KEYS.AUTH:
      return <PortalScene density={density} reducedMotion={reducedMotion} />;
    default:
      return <ParticleUniverseScene density={density} reducedMotion={reducedMotion} />;
  }
};

/**
 * Master Animation Background Component
 * Renders a full-screen, non-blocking 3D WebGL ambient background behind all page content.
 */
export const AnimationBackground = ({
  scene,
  opacity = 0.75,
  reducedMotion: forcedReducedMotion,
  className = '',
  isRoot = false,
}) => {
  const location = useLocation();
  const animCtx = useAnimation();
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

  // Fallback to CSS animation if WebGL is unavailable or encountered an error
  if (!webGLSupported || hasError) {
    return <CSSAmbientFallback opacity={opacity} />;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-1000 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
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
        <Suspense fallback={null}>
          <SceneRenderer
            activeSceneKey={activeSceneKey}
            density={deviceProfile.particleMultiplier}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AnimationBackground;
