import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ⚡ AmbientGlow — Low-Frequency Volumetric 3D Environment Lighting
 * Creates a slow-moving, large-scale atmospheric field that breathes depth into both Dark and Light modes.
 */
export const AmbientGlow = ({
  color1 = '#4338ca',
  color2 = '#0284c7',
  intensity = 0.7,
  theme = 'dark',
  reducedMotion = false,
}) => {
  const lightRef1 = useRef();
  const lightRef2 = useRef();
  const auraPlaneRef = useRef();

  const isLight = theme === 'light';

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();

    // Slow low-frequency atmospheric illumination drift
    if (lightRef1.current) {
      lightRef1.current.position.x = Math.sin(t * 0.25) * 7;
      lightRef1.current.position.y = Math.cos(t * 0.18) * 4.5;
    }
    if (lightRef2.current) {
      lightRef2.current.position.x = Math.cos(t * 0.22) * -8;
      lightRef2.current.position.y = Math.sin(t * 0.16) * -4.5;
    }
    if (auraPlaneRef.current) {
      const breath = 1 + Math.sin(t * 0.15) * 0.05;
      auraPlaneRef.current.scale.set(breath, breath, 1);
    }
  });

  return (
    <group>
      {/* Base Global Light Field */}
      <ambientLight intensity={isLight ? 0.95 : 0.45} />

      {/* Atmospheric Point Light 1: Primary Hue (Indigo / Azure) */}
      <pointLight
        ref={lightRef1}
        position={[-8, 5, -2]}
        color={color1}
        intensity={isLight ? intensity * 12 : intensity * 16}
        distance={35}
        decay={2}
      />

      {/* Atmospheric Point Light 2: Secondary Harmonic (Sky / Violet) */}
      <pointLight
        ref={lightRef2}
        position={[8, -5, -3]}
        color={color2}
        intensity={isLight ? intensity * 10 : intensity * 14}
        distance={35}
        decay={2}
      />

      {/* Soft Volumetric Background Atmosphere Quad (Layer 1 far depth at Z: -18) */}
      <mesh ref={auraPlaneRef} position={[0, 0, -18]}>
        <planeGeometry args={[65, 45]} />
        <meshBasicMaterial
          color={isLight ? '#e0f2fe' : '#0a0e1a'}
          transparent
          opacity={isLight ? 0.35 : 0.55}
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default AmbientGlow;
