import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeTransition } from '../../context/ThemeTransitionContext';

/**
 * ⚡ Spatial UI Multi-Layered Particle Field
 * Implements the Spatial UI 4-layer depth hierarchy:
 * - Layer 1 (Distant): Micro-particles, deep Z-depth, subtle drift, low parallax (0.25x)
 * - Layer 2 (Midground): Medium visible nodes, active orbital motion, standard parallax (0.65x)
 * - Layer 4 (Foreground): Luminous floating accent motes, positive Z-depth, pronounced parallax (1.35x)
 * Fully responsive to Dark and Light modes with deep, high-contrast pigments and organic motion.
 */
export const ParticleField = ({
  count = 750,
  spread = 26,
  depth = 22,
  speed = 0.08,
  color = '#818cf8',
  secondaryColor = '#38bdf8',
  accentColor = '#c084fc',
  theme = 'dark',
  reducedMotion = false,
}) => {
  const { transitionRef } = useThemeTransition();

  const tier1GroupRef = useRef();
  const tier2GroupRef = useRef();
  const tier3GroupRef = useRef();

  const tier1PointsRef = useRef();
  const tier2PointsRef = useRef();
  const tier3PointsRef = useRef();

  const hasCollapsedRef = useRef(false);
  const isLight = theme === 'light';

  // =========================================================================
  // 1. LAYER 1 (Distant Environment): 68% Micro Particles (Z: -16 to -6)
  // =========================================================================
  const count1 = Math.round(count * 0.68);
  const [pos1, col1, origPos1] = useMemo(() => {
    const p = new Float32Array(count1 * 3);
    const c = new Float32Array(count1 * 3);
    const orig = new Float32Array(count1 * 3);
    const c1 = new THREE.Color(color);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count1; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.5) * spread * 1.25;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * spread * 0.95;
      const z = -6 - Math.random() * 10; // Distant negative Z plane

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
  }, [count1, spread, color, secondaryColor]);

  // =========================================================================
  // 2. LAYER 2 (Midground Structures): 22% Medium Visible Particles (Z: -5 to 2)
  // =========================================================================
  const count2 = Math.round(count * 0.22);
  const [pos2, col2, origPos2] = useMemo(() => {
    const p = new Float32Array(count2 * 3);
    const c = new Float32Array(count2 * 3);
    const orig = new Float32Array(count2 * 3);
    const c1 = new THREE.Color(secondaryColor);
    const c2 = new THREE.Color(accentColor);

    for (let i = 0; i < count2; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.6) * (spread * 0.9);
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * spread * 0.75;
      const z = -5 + Math.random() * 7; // Screen depth midground

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
  }, [count2, spread, secondaryColor, accentColor]);

  // =========================================================================
  // 3. LAYER 4 (Foreground Micro-Particles): 10% Luminous Floating Accents (Z: 2 to 6.5)
  // =========================================================================
  const count3 = Math.round(count * 0.1);
  const [pos3, col3, origPos3] = useMemo(() => {
    const p = new Float32Array(count3 * 3);
    const c = new Float32Array(count3 * 3);
    const orig = new Float32Array(count3 * 3);
    const c1 = new THREE.Color(accentColor);
    const c2 = new THREE.Color(color);

    for (let i = 0; i < count3; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.7) * (spread * 0.75);
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * (spread * 0.6);
      const z = 2.0 + Math.random() * 4.5; // Foreground plane floating in front of UI!

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      const mixed = c1.clone().lerp(c2, Math.random() * 0.6);
      c[i * 3] = mixed.r;
      c[i * 3 + 1] = mixed.g;
      c[i * 3 + 2] = mixed.b;
    }
    return [p, c, orig];
  }, [count3, spread, accentColor, color]);

  // Smooth lerp values for cursor parallax
  const targetCursorRef = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const meta = transitionRef?.current;
    const isTransitionActive = meta && meta.active && meta.collapseAmount > 0.001;

    // Track cursor coordinates (fallback to window if pointer is uninitialized)
    const cursor = (typeof window !== 'undefined' && window.__hackmatchCursor) || state.pointer;
    const cx = cursor ? cursor.x : 0;
    const cy = cursor ? cursor.y : 0;

    // Smooth lerp cursor tracking
    targetCursorRef.current.x += (cx - targetCursorRef.current.x) * 0.05;
    targetCursorRef.current.y += (cy - targetCursorRef.current.y) * 0.05;

    const lerpedX = targetCursorRef.current.x;
    const lerpedY = targetCursorRef.current.y;

    // Multi-Layer Spatial Parallax (cursor moves right -> particles shift left)
    if (!reducedMotion) {
      if (tier1GroupRef.current) {
        tier1GroupRef.current.position.x = -lerpedX * 0.35;
        tier1GroupRef.current.position.y = -lerpedY * 0.2;
        tier1GroupRef.current.rotation.y = time * speed * 0.14;
        tier1GroupRef.current.rotation.x = Math.sin(time * speed * 0.08) * 0.035;
      }
      if (tier2GroupRef.current) {
        tier2GroupRef.current.position.x = -lerpedX * 0.75;
        tier2GroupRef.current.position.y = -lerpedY * 0.45;
        tier2GroupRef.current.rotation.y = -time * speed * 0.26;
        tier2GroupRef.current.rotation.z = Math.cos(time * speed * 0.1) * 0.05;
      }
      if (tier3GroupRef.current) {
        tier3GroupRef.current.position.x = -lerpedX * 1.45;
        tier3GroupRef.current.position.y = -lerpedY * 0.85;
        tier3GroupRef.current.rotation.y = time * speed * 0.38;
        tier3GroupRef.current.rotation.x = Math.sin(time * speed * 0.18) * 0.07;
      }
    }

    // =========================================================================
    // Theme Transition: Organic Particle Collapse & Elastic Outward Burst
    // =========================================================================
    if (isTransitionActive) {
      hasCollapsedRef.current = true;
      const collapse = meta.collapseAmount; // 0 to 1 and back to 0

      const applyCollapse = (posArr, origArr, countN, tierSpeedMult) => {
        for (let i = 0; i < countN; i++) {
          const origX = origArr[i * 3];
          const origY = origArr[i * 3 + 1];
          const origZ = origArr[i * 3 + 2];

          // Organic variation
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

      if (tier1PointsRef.current) {
        applyCollapse(pos1, origPos1, count1, 0.8);
        tier1PointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
      if (tier2PointsRef.current) {
        applyCollapse(pos2, origPos2, count2, 1.2);
        tier2PointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
      if (tier3PointsRef.current) {
        applyCollapse(pos3, origPos3, count3, 1.5);
        tier3PointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    } else if (hasCollapsedRef.current) {
      // Transition complete: smoothly restore original base coordinates
      pos1.set(origPos1);
      pos2.set(origPos2);
      pos3.set(origPos3);

      if (tier1PointsRef.current) tier1PointsRef.current.geometry.attributes.position.needsUpdate = true;
      if (tier2PointsRef.current) tier2PointsRef.current.geometry.attributes.position.needsUpdate = true;
      if (tier3PointsRef.current) tier3PointsRef.current.geometry.attributes.position.needsUpdate = true;

      hasCollapsedRef.current = false;
    }
  });

  const blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <group>
      {/* LAYER 1: Distant Environment (Small + Faint + Slow Parallax) */}
      <group ref={tier1GroupRef}>
        <points ref={tier1PointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={count1} array={pos1} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={count1} array={col1} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={isLight ? 0.052 : 0.042}
            vertexColors
            transparent
            opacity={isLight ? 0.68 : 0.75}
            sizeAttenuation
            blending={blending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* LAYER 2: Midground Particles (Medium + Clearly Visible + Moderate Motion) */}
      <group ref={tier2GroupRef}>
        <points ref={tier2PointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={count2} array={pos2} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={count2} array={col2} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={isLight ? 0.115 : 0.095}
            vertexColors
            transparent
            opacity={isLight ? 0.88 : 0.9}
            sizeAttenuation
            blending={blending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* LAYER 4: Foreground Micro-Particles (Larger + Floating in Front of UI + Slow Parallax) */}
      <group ref={tier3GroupRef}>
        <points ref={tier3PointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={count3} array={pos3} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={count3} array={col3} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={isLight ? 0.175 : 0.155}
            vertexColors
            transparent
            opacity={isLight ? 0.92 : 0.95}
            sizeAttenuation
            blending={blending}
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
};

export default ParticleField;
