import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleField } from '../components/ParticleField';
import { ParticleCluster } from '../components/ParticleCluster';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { AmbientGlow } from '../components/AmbientGlow';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

/**
 * Majestic Cosmic Orbit Ring (Frames negative space around Hero)
 */
const CosmicRing = ({
  radius = 9,
  particleCount = 100,
  speed = 0.04,
  color = '#818cf8',
  tilt = [0.5, 0.3, 0],
  theme = 'dark',
  reducedMotion = false,
}) => {
  const ringRef = useRef();
  const isLight = theme === 'light';

  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.45;
      pos[i * 3] = Math.cos(angle) * (radius + jitter);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter) - 3;
    }
    return pos;
  }, [particleCount, radius]);

  useFrame((state) => {
    if (reducedMotion || !ringRef.current) return;
    ringRef.current.rotation.y = state.clock.getElapsedTime() * speed;
  });

  return (
    <group rotation={tilt} ref={ringRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.095 : 0.08}
          color={color}
          transparent
          opacity={isLight ? 0.85 : 0.75}
          sizeAttenuation
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export const ParticleUniverseScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.HOME, theme);

  return (
    <group>
      {/* 1. Volumetric Low-Frequency Environment Lighting */}
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.75}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 2. 4-Layer Spatial UI Particle Field (Distant, Midground, Foreground) */}
      <ParticleField
        count={Math.round(850 * density)}
        spread={28}
        depth={24}
        speed={0.07}
        color={palette.primary}
        secondaryColor={palette.secondary}
        accentColor={palette.accent}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 3. Slow Orbiting Structures in Negative Space around Hero */}
      <CosmicRing
        radius={11.5}
        particleCount={Math.round(110 * density)}
        speed={0.045}
        color={palette.primary}
        tilt={[0.55, 0.35, 0.1]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <CosmicRing
        radius={14.5}
        particleCount={Math.round(130 * density)}
        speed={-0.035}
        color={palette.secondary}
        tilt={[-0.45, 0.5, -0.2]}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 4. Central Cosmic Galaxy Cluster */}
      <ParticleCluster
        count={Math.round(240 * density)}
        radius={7.5}
        coreRadius={1.6}
        speed={0.08}
        color={palette.accent}
        position={[0, 0, -3]}
        theme={theme}
        reducedMotion={reducedMotion}
      />

      {/* 5. Deep Volumetric Atmospheric Orbs */}
      <FloatingOrbs
        orbs={[
          { position: [-9, 4.5, -9], scale: 3.4, color: palette.orb1, speed: 0.28, offset: 0 },
          { position: [10, -3.5, -11], scale: 3.8, color: palette.orb2, speed: 0.22, offset: 1.5 },
          { position: [0, -7, -13], scale: 4.8, color: palette.orb3, speed: 0.16, offset: 3.2 },
        ]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default ParticleUniverseScene;
