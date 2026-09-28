import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeTransition } from '../../context/ThemeTransitionContext';

export const ParticleCluster = ({
  count = 260,
  radius = 5.2,
  coreRadius = 1.2,
  speed = 0.12,
  size = 0.07,
  color = '#a855f7',
  position = [0, 0, 0],
  theme = 'dark',
  reducedMotion = false,
}) => {
  const clusterRef = useRef();
  const { transitionRef } = useThemeTransition();
  const isLight = theme === 'light';

  const [positions, orbitalData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orbit = [];

    for (let i = 0; i < count; i++) {
      const dist = coreRadius + Math.random() * (radius - coreRadius);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (radius * 0.75);
      const orbitSpeed = (0.5 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1);

      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * dist;

      orbit.push({ dist, angle, height, orbitSpeed });
    }

    return [pos, orbit];
  }, [count, radius, coreRadius]);

  useFrame((state) => {
    if (!clusterRef.current) return;
    const time = state.clock.getElapsedTime();
    const meta = transitionRef?.current;
    const isTransitionActive = meta && meta.active && meta.collapseAmount > 0.001;

    if (!reducedMotion) {
      clusterRef.current.rotation.y = time * speed;
      clusterRef.current.rotation.z = Math.sin(time * speed * 0.5) * 0.16;
    }

    if (isTransitionActive) {
      const c = meta.collapseAmount; // 0 to 1
      // Organic pull toward center nexus
      clusterRef.current.position.x = position[0] * (1 - c * 0.85);
      clusterRef.current.position.y = position[1] * (1 - c * 0.85);
      clusterRef.current.position.z = position[2] * (1 - c * 0.85) - c * 2;

      let s = 1 - c * 0.45;
      if (meta.progress > 0.6 && meta.progress < 0.95) {
        const p = (meta.progress - 0.6) / 0.35;
        s += Math.sin(p * Math.PI) * 0.22;
      }
      clusterRef.current.scale.set(s, s, s);
    } else {
      clusterRef.current.position.set(position[0], position[1], position[2]);
      clusterRef.current.scale.set(1, 1, 1);
    }
  });

  const blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

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
          size={isLight ? size * 0.95 : size}
          color={color}
          transparent
          opacity={isLight ? 0.75 : 0.9}
          sizeAttenuation
          blending={blending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default ParticleCluster;
