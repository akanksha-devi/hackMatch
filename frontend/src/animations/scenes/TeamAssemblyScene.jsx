import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleCluster } from '../components/ParticleCluster';

export const TeamAssemblyScene = ({ density = 1, reducedMotion = false }) => {
  const pointsRef = useRef();
  const count = Math.round(260 * density);

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
        speed: 0.2 + Math.random() * 0.3,
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
      <AmbientGlow color1="#6366f1" color2="#38bdf8" intensity={0.6} reducedMotion={reducedMotion} />
      {/* Converging Inward Particle Streams */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Central Team Assembly Nexus */}
      <ParticleCluster
        count={Math.round(140 * density)}
        radius={2.0}
        coreRadius={0.4}
        speed={0.2}
        color="#a855f7"
        position={[0, 0, -2]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
