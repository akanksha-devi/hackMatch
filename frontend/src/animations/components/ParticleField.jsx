import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ParticleField = ({
  count = 600,
  spread = 24,
  depth = 18,
  speed = 0.08,
  size = 0.045,
  color = '#818cf8',
  secondaryColor = '#38bdf8',
  reducedMotion = false,
}) => {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color(color);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count; i++) {
      // Cylindrical / volumetric distribution
      const theta = Math.random() * Math.PI * 2;
      const radius = (Math.random() ** 0.5) * spread;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.5) * spread * 0.8;
      const z = (Math.random() - 0.5) * depth;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Smooth color gradient mix
      const mixRatio = Math.random();
      const mixed = c1.clone().lerp(c2, mixRatio);
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }

    return [pos, col];
  }, [count, spread, depth, color, secondaryColor]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    // Gentle ambient drift and yaw rotation
    pointsRef.current.rotation.y = time * speed * 0.25;
    pointsRef.current.rotation.x = Math.sin(time * speed * 0.15) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
