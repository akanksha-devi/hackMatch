import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ParticleCluster = ({
  count = 250,
  radius = 5,
  coreRadius = 1.2,
  speed = 0.12,
  size = 0.05,
  color = '#a855f7',
  position = [0, 0, 0],
  reducedMotion = false,
}) => {
  const clusterRef = useRef();

  const [positions, orbitalData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orbit = [];

    for (let i = 0; i < count; i++) {
      const dist = coreRadius + Math.random() * (radius - coreRadius);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (radius * 0.7);
      const orbitSpeed = (0.5 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1);

      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * dist;

      orbit.push({ dist, angle, height, orbitSpeed });
    }

    return [pos, orbit];
  }, [count, radius, coreRadius]);

  useFrame((state, delta) => {
    if (reducedMotion || !clusterRef.current) return;
    const time = state.clock.getElapsedTime();
    clusterRef.current.rotation.y = time * speed;
    clusterRef.current.rotation.z = Math.sin(time * speed * 0.5) * 0.15;
  });

  return (
    <group position={position} ref={clusterRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={color}
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
