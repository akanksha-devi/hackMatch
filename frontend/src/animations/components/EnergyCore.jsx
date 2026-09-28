import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeTransition } from '../../context/ThemeTransitionContext';

/**
 * ⚡ EnergyCore — 3D Luminous Core Nexus
 * Forms at the center of the 3D WebGL scene during theme transitions.
 * Pulses with volumetric glow, swirling micro-sparks, and casts dynamic environmental light.
 */
export const EnergyCore = ({ position = [0, 0, -2] }) => {
  const { isTransitioning, transitionRef } = useThemeTransition();

  const groupRef = useRef();
  const innerMeshRef = useRef();
  const outerMeshRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const lightRef = useRef();
  const sparkPointsRef = useRef();

  // 48 micro-spark particles orbiting the core
  const sparkCount = 48;
  const [sparkPositions, sparkOrbits] = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const orbits = [];

    for (let i = 0; i < sparkCount; i++) {
      const radius = 1.2 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = (1.5 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      orbits.push({ radius, theta, phi, speed });
    }

    return [pos, orbits];
  }, [sparkCount]);

  useFrame((state) => {
    const meta = transitionRef?.current;
    if (!meta || !meta.active || !groupRef.current) {
      if (groupRef.current) {
        groupRef.current.scale.set(0, 0, 0);
      }
      if (lightRef.current) {
        lightRef.current.intensity = 0;
      }
      return;
    }

    const t = state.clock.getElapsedTime();
    const p = meta.progress; // 0 to 1
    const isToLight = meta.targetTheme === 'light';

    // Core scale & opacity lifecycle curve:
    // 0.0 - 0.20: fast smooth growth (0 -> 0.8)
    // 0.20 - 0.55: swell to peak (0.8 -> 1.25) with heartbeat pulse
    // 0.55 - 0.70: peak intensity & environmental lighting flare
    // 0.70 - 1.00: smooth contraction and fade (1.25 -> 0)
    let coreScale = 0;
    let coreOpacity = 0;
    let lightIntensity = 0;

    if (p < 0.2) {
      const u = p / 0.2;
      coreScale = Math.sin((u * Math.PI) / 2) * 0.85;
      coreOpacity = u * 0.85;
      lightIntensity = u * 8;
    } else if (p < 0.55) {
      const u = (p - 0.2) / 0.35;
      const pulse = 1 + Math.sin(t * 14) * 0.08;
      coreScale = (0.85 + u * 0.4) * pulse;
      coreOpacity = 0.85 + u * 0.15;
      lightIntensity = 8 + u * 18;
    } else if (p < 0.7) {
      // Peak illumination zone
      const u = (p - 0.55) / 0.15;
      const pulse = 1 + Math.sin(t * 16) * 0.1;
      coreScale = 1.25 * pulse;
      coreOpacity = 1.0;
      lightIntensity = 26 - u * 4;
    } else {
      // Outward release & contraction
      const u = (p - 0.7) / 0.3;
      const ease = 1 - Math.sin((u * Math.PI) / 2);
      coreScale = ease * 1.2;
      coreOpacity = ease * 0.9;
      lightIntensity = ease * 22;
    }

    groupRef.current.scale.set(coreScale, coreScale, coreScale);

    // Dynamic color transition at peak
    const colorStart = isToLight ? new THREE.Color('#8b5cf6') : new THREE.Color('#38bdf8');
    const colorMid = isToLight ? new THREE.Color('#38bdf8') : new THREE.Color('#a855f7');
    const colorEnd = isToLight ? new THREE.Color('#ffffff') : new THREE.Color('#6366f1');

    let activeColor;
    if (p < 0.5) {
      activeColor = colorStart.clone().lerp(colorMid, p / 0.5);
    } else {
      activeColor = colorMid.clone().lerp(colorEnd, (p - 0.5) / 0.5);
    }

    // Apply colors & opacities to materials
    if (innerMeshRef.current) {
      innerMeshRef.current.material.color = activeColor;
      innerMeshRef.current.material.opacity = coreOpacity * 0.95;
    }
    if (outerMeshRef.current) {
      outerMeshRef.current.material.color = colorMid;
      outerMeshRef.current.material.opacity = coreOpacity * 0.35;
      outerMeshRef.current.rotation.y = t * 0.5;
      outerMeshRef.current.rotation.z = t * 0.3;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 1.2;
      ring1Ref.current.rotation.x = 0.4 + Math.sin(t * 2) * 0.1;
      ring1Ref.current.material.color = colorStart;
      ring1Ref.current.material.opacity = coreOpacity * 0.6;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.9;
      ring2Ref.current.rotation.y = -0.3 + Math.cos(t * 1.8) * 0.1;
      ring2Ref.current.material.color = colorEnd;
      ring2Ref.current.material.opacity = coreOpacity * 0.5;
    }

    // Environmental Point Light
    if (lightRef.current) {
      lightRef.current.color = activeColor;
      lightRef.current.intensity = lightIntensity;
    }

    // Orbiting micro-sparks
    if (sparkPointsRef.current) {
      const geo = sparkPointsRef.current.geometry;
      const posArr = geo.attributes.position.array;
      const speedMultiplier = 1 + meta.collapseAmount * 2.5;

      for (let i = 0; i < sparkCount; i++) {
        const s = sparkOrbits[i];
        s.theta += s.speed * 0.02 * speedMultiplier;

        posArr[i * 3] = s.radius * Math.cos(s.theta) * Math.cos(s.phi);
        posArr[i * 3 + 1] = s.radius * Math.sin(s.phi);
        posArr[i * 3 + 2] = s.radius * Math.sin(s.theta) * Math.cos(s.phi);
      }
      geo.attributes.position.needsUpdate = true;
      sparkPointsRef.current.material.opacity = coreOpacity * 0.9;
    }
  });

  if (!isTransitioning) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Dynamic Environmental Point Light illuminating the surrounding 3D world */}
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={0} distance={32} decay={2} />

      {/* Inner Luminous Nucleus */}
      <mesh ref={innerMeshRef}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Volumetric Corona Halo */}
      <mesh ref={outerMeshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* Corona Rings */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.4, 1.48, 64]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[0.5, 0.4, 0]}>
        <ringGeometry args={[1.7, 1.76, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Swirling Micro-Sparks */}
      <points ref={sparkPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparkCount}
            array={sparkPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default EnergyCore;
