import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Orb = ({ position = [0, 0, 0], scale = 1, color = '#6366f1', speed = 0.5, offset = 0, reducedMotion = false }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.4;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.3;
    const pulse = 1 + Math.sin(t * 1.2) * 0.08;
    meshRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        wireframe={false}
      />
    </mesh>
  );
};

export const FloatingOrbs = ({
  orbs = [
    { position: [-6, 3, -6], scale: 2.2, color: '#4f46e5', speed: 0.4, offset: 0 },
    { position: [7, -2, -8], scale: 2.8, color: '#06b6d4', speed: 0.3, offset: 2 },
    { position: [0, 5, -10], scale: 3.5, color: '#8b5cf6', speed: 0.25, offset: 4 },
  ],
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
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
};
