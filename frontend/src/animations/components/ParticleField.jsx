import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ⚡ Multi-Layered Cinematic Particle Field
 * Employs a 3-tier depth architecture (70% ambient micro-dust, 20% medium drifters, 10% luminous accents)
 * for true spatial depth and cinema-grade visual presence.
 */
export const ParticleField = ({
  count = 700,
  spread = 26,
  depth = 20,
  speed = 0.08,
  color = '#818cf8',
  secondaryColor = '#38bdf8',
  accentColor = '#c084fc',
  theme = 'dark',
  reducedMotion = false,
}) => {
  const tier1Ref = useRef();
  const tier2Ref = useRef();
  const tier3Ref = useRef();

  const isLight = theme === 'light';

  // 1. Tier 1: 70% Micro Ambient Particles (Distant Stars / Nebula Dust)
  const count1 = Math.round(count * 0.7);
  const [pos1, col1] = useMemo(() => {
    const p = new Float32Array(count1 * 3);
    const c = new Float32Array(count1 * 3);
    const c1 = new THREE.Color(color);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count1; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.5) * spread * 1.2;
      p[i * 3] = Math.cos(theta) * radius;
      p[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.9;
      p[i * 3 + 2] = (Math.random() - 0.5) * depth * 1.3;

      const mixed = c1.clone().lerp(c2, Math.random());
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c];
  }, [count1, spread, depth, color, secondaryColor]);

  // 2. Tier 2: 20% Medium Drifters (Clearly Visible Mid-Plane Nodes)
  const count2 = Math.round(count * 0.2);
  const [pos2, col2] = useMemo(() => {
    const p = new Float32Array(count2 * 3);
    const c = new Float32Array(count2 * 3);
    const c1 = new THREE.Color(secondaryColor);
    const c2 = new THREE.Color(accentColor);

    for (let i = 0; i < count2; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.6) * spread;
      p[i * 3] = Math.cos(theta) * radius;
      p[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.75;
      p[i * 3 + 2] = (Math.random() - 0.5) * depth;

      const mixed = c1.clone().lerp(c2, Math.random());
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c];
  }, [count2, spread, depth, secondaryColor, accentColor]);

  // 3. Tier 3: 10% Luminous Accent Nodes (Foreground Halos with Prominent Presence)
  const count3 = Math.round(count * 0.1);
  const [pos3, col3] = useMemo(() => {
    const p = new Float32Array(count3 * 3);
    const c = new Float32Array(count3 * 3);
    const c1 = new THREE.Color(accentColor);
    const c2 = new THREE.Color(color);

    for (let i = 0; i < count3; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.7) * (spread * 0.8);
      p[i * 3] = Math.cos(theta) * radius;
      p[i * 3 + 1] = (Math.random() - 0.5) * (spread * 0.6);
      p[i * 3 + 2] = (Math.random() - 0.5) * (depth * 0.75);

      const mixed = c1.clone().lerp(c2, Math.random() * 0.5);
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c];
  }, [count3, spread, depth, accentColor, color]);

  // Parallax rotation across tiers at varying speeds for depth perception
  useFrame((state) => {
    if (reducedMotion) return;
    const time = state.clock.getElapsedTime();

    if (tier1Ref.current) {
      tier1Ref.current.rotation.y = time * speed * 0.15;
      tier1Ref.current.rotation.x = Math.sin(time * speed * 0.08) * 0.04;
    }
    if (tier2Ref.current) {
      tier2Ref.current.rotation.y = -time * speed * 0.28;
      tier2Ref.current.rotation.z = Math.cos(time * speed * 0.12) * 0.06;
    }
    if (tier3Ref.current) {
      tier3Ref.current.rotation.y = time * speed * 0.42;
      tier3Ref.current.rotation.x = Math.sin(time * speed * 0.2) * 0.08;
    }
  });

  const blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <group>
      {/* Tier 1: Micro Ambient Dust */}
      <points ref={tier1Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count1} array={pos1} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count1} array={col1} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.04 : 0.038}
          vertexColors
          transparent
          opacity={isLight ? 0.55 : 0.75}
          sizeAttenuation
          blending={blending}
          depthWrite={false}
        />
      </points>

      {/* Tier 2: Medium Visible Nodes */}
      <points ref={tier2Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count2} array={pos2} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count2} array={col2} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.085 : 0.08}
          vertexColors
          transparent
          opacity={isLight ? 0.7 : 0.88}
          sizeAttenuation
          blending={blending}
          depthWrite={false}
        />
      </points>

      {/* Tier 3: Luminous Accent Foreground Points */}
      <points ref={tier3Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count3} array={pos3} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count3} array={col3} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.13 : 0.14}
          vertexColors
          transparent
          opacity={isLight ? 0.8 : 0.95}
          sizeAttenuation
          blending={blending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default ParticleField;
