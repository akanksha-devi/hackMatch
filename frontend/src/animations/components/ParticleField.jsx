import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeTransition } from '../../context/ThemeTransitionContext';

/**
 * ⚡ Multi-Layered Cinematic Particle Field
 * Employs a 3-tier depth architecture (70% ambient micro-dust, 20% medium drifters, 10% luminous accents)
 * with organic central collapse & expansion during theme transitions.
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
  const { transitionRef } = useThemeTransition();

  const tier1Ref = useRef();
  const tier2Ref = useRef();
  const tier3Ref = useRef();
  const hasCollapsedRef = useRef(false);

  const isLight = theme === 'light';

  // 1. Tier 1: 70% Micro Ambient Particles (Distant Stars / Nebula Dust)
  const count1 = Math.round(count * 0.7);
  const [pos1, col1, origPos1] = useMemo(() => {
    const p = new Float32Array(count1 * 3);
    const c = new Float32Array(count1 * 3);
    const orig = new Float32Array(count1 * 3);
    const c1 = new THREE.Color(color);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count1; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.5) * spread * 1.2;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * spread * 0.9;
      const z = (Math.random() - 0.5) * depth * 1.3;

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      const mixed = c1.clone().lerp(c2, Math.random());
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c, orig];
  }, [count1, spread, depth, color, secondaryColor]);

  // 2. Tier 2: 20% Medium Drifters (Clearly Visible Mid-Plane Nodes)
  const count2 = Math.round(count * 0.2);
  const [pos2, col2, origPos2] = useMemo(() => {
    const p = new Float32Array(count2 * 3);
    const c = new Float32Array(count2 * 3);
    const orig = new Float32Array(count2 * 3);
    const c1 = new THREE.Color(secondaryColor);
    const c2 = new THREE.Color(accentColor);

    for (let i = 0; i < count2; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.6) * spread;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * spread * 0.75;
      const z = (Math.random() - 0.5) * depth;

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      const mixed = c1.clone().lerp(c2, Math.random());
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c, orig];
  }, [count2, spread, depth, secondaryColor, accentColor]);

  // 3. Tier 3: 10% Luminous Accent Nodes (Foreground Halos with Prominent Presence)
  const count3 = Math.round(count * 0.1);
  const [pos3, col3, origPos3] = useMemo(() => {
    const p = new Float32Array(count3 * 3);
    const c = new Float32Array(count3 * 3);
    const orig = new Float32Array(count3 * 3);
    const c1 = new THREE.Color(accentColor);
    const c2 = new THREE.Color(color);

    for (let i = 0; i < count3; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.7) * (spread * 0.8);
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * (spread * 0.6);
      const z = (Math.random() - 0.5) * (depth * 0.75);

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      const mixed = c1.clone().lerp(c2, Math.random() * 0.5);
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c, orig];
  }, [count3, spread, depth, accentColor, color]);

  // Parallax rotation & organic collapse/expansion handling
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const meta = transitionRef?.current;
    const isTransitionActive = meta && meta.active && meta.collapseAmount > 0.001;

    // Normal ambient rotations
    if (!reducedMotion) {
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
    }

    // Organic Particle Collapse toward EnergyCore [0, 0, -2]
    if (isTransitionActive) {
      hasCollapsedRef.current = true;
      const collapse = meta.collapseAmount; // 0 to 1 and back to 0

      // Helper function for organic swirling convergence
      const applyCollapse = (posArr, origArr, countN, tierSpeedMult) => {
        for (let i = 0; i < countN; i++) {
          const origX = origArr[i * 3];
          const origY = origArr[i * 3 + 1];
          const origZ = origArr[i * 3 + 2];

          // Organic variation so movement is not mechanically synchronized
          const seed = ((i * 17) % 100) / 100;
          const organicFactor = 0.8 + 0.35 * Math.sin(i * 1.3 + time * 3.5);
          const pull = Math.min(0.95, collapse * organicFactor);

          // Vortex swirl around center nexus [0, 0, -2]
          const baseAngle = Math.atan2(origY, origX);
          const swirlAngle = baseAngle + time * 2.8 * tierSpeedMult + i * 0.05;
          const swirlRadius = 0.5 + 1.4 * seed;

          const swirlX = Math.cos(swirlAngle) * swirlRadius;
          const swirlY = Math.sin(swirlAngle) * swirlRadius;
          const swirlZ = -2 + Math.sin(i + time * 2) * 0.6;

          // Outward spring burst during expansion (meta.progress > 0.6)
          let springMult = 1;
          if (meta.progress > 0.6 && meta.progress < 0.95) {
            const p = (meta.progress - 0.6) / 0.35;
            springMult = 1 + Math.sin(p * Math.PI) * 0.18;
          }

          posArr[i * 3]     = (origX * (1 - pull) + swirlX * pull) * springMult;
          posArr[i * 3 + 1] = (origY * (1 - pull) + swirlY * pull) * springMult;
          posArr[i * 3 + 2] = origZ * (1 - pull) + swirlZ * pull;
        }
      };

      if (tier1Ref.current) {
        applyCollapse(pos1, origPos1, count1, 0.8);
        tier1Ref.current.geometry.attributes.position.needsUpdate = true;
      }
      if (tier2Ref.current) {
        applyCollapse(pos2, origPos2, count2, 1.2);
        tier2Ref.current.geometry.attributes.position.needsUpdate = true;
      }
      if (tier3Ref.current) {
        applyCollapse(pos3, origPos3, count3, 1.5);
        tier3Ref.current.geometry.attributes.position.needsUpdate = true;
      }
    } else if (hasCollapsedRef.current) {
      // Transition complete: smoothly restore original base coordinates
      pos1.set(origPos1);
      pos2.set(origPos2);
      pos3.set(origPos3);

      if (tier1Ref.current) tier1Ref.current.geometry.attributes.position.needsUpdate = true;
      if (tier2Ref.current) tier2Ref.current.geometry.attributes.position.needsUpdate = true;
      if (tier3Ref.current) tier3Ref.current.geometry.attributes.position.needsUpdate = true;

      hasCollapsedRef.current = false;
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
