import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Orb = ({
  position = [0, 0, 0],
  scale = 1,
  color = '#6366f1',
  speed = 0.5,
  offset = 0,
  theme = 'dark',
  reducedMotion = false,
}) => {
  const meshRef = useRef();
  const isLight = theme === 'light';

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.4;
    const pulse = 1 + Math.sin(t * 1.3) * 0.1;
    meshRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isLight ? 0.12 : 0.22}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export const FloatingOrbs = ({
  orbs = [
    { position: [-7, 4, -7], scale: 2.8, color: '#4f46e5', speed: 0.35, offset: 0 },
    { position: [8, -3, -9], scale: 3.4, color: '#06b6d4', speed: 0.28, offset: 2 },
    { position: [0, 6, -11], scale: 4.2, color: '#8b5cf6', speed: 0.22, offset: 4 },
  ],
  theme = 'dark',
  reducedMotion = false,
}) => {
  return (
    <group>
      {orbs.map((orb, index) => (
        <Orb
          key={index}
          position={orb.position}
          scale={orb.scale}
          color={orb.color}
          speed={orb.speed}
          offset={orb.offset}
          theme={theme}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
};

export default FloatingOrbs;
