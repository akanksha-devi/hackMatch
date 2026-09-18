import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleCluster } from '../components/ParticleCluster';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

export const TeamAssemblyScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const pointsRef = useRef();
  const palette = getSceneThemePalette(SCENE_KEYS.POST_REQUEST, theme);
  const isLight = theme === 'light';

  const count = Math.round(300 * density);

  const [positions, targets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tgts = [];

    for (let i = 0; i < count; i++) {
      // Outer spherical origin
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 8 + Math.random() * 10;

      pos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = dist * Math.cos(phi);

      // Target convergence nexus
      tgts.push({
        origX: pos[i * 3],
        origY: pos[i * 3 + 1],
        origZ: pos[i * 3 + 2],
        speed: 0.2 + Math.random() * 0.35,
        progress: Math.random(),
      });
    }

    return [pos, tgts];
  }, [count]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posArr = geo.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const p = targets[i];
      p.progress += p.speed * delta * 0.35;
      if (p.progress >= 1) p.progress = 0;

      // Inward convergence interpolation
      const factor = 1 - p.progress;
      posArr[i * 3] = p.origX * factor;
      posArr[i * 3 + 1] = p.origY * factor;
      posArr[i * 3 + 2] = p.origZ * factor - 2;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.65}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* Converging Inward Particle Streams */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.075 : 0.08}
          color={palette.primary}
          transparent
          opacity={isLight ? 0.75 : 0.88}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Central Team Assembly Nexus */}
      <ParticleCluster
        count={Math.round(180 * density)}
        radius={2.4}
        coreRadius={0.4}
        speed={0.2}
        color={palette.secondary}
        position={[0, 0, -2]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default TeamAssemblyScene;
