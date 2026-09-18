import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { FloatingOrbs } from '../components/FloatingOrbs';

const BreathingAuraRing = ({ radius = 3.5, color = '#818cf8', speed = 0.8, reducedMotion = false }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    const s = 1 + Math.sin(t) * 0.08;
    meshRef.current.scale.set(s, s, s);
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 1.5, -4]}>
      <ringGeometry args={[radius, radius + 0.08, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
};

export const PersonalAuraScene = ({ density = 1, reducedMotion = false }) => {
  return (
    <group>
      <AmbientGlow color1="#6366f1" color2="#a855f7" intensity={0.65} reducedMotion={reducedMotion} />
      <BreathingAuraRing radius={3.2} color="#818cf8" speed={0.6} reducedMotion={reducedMotion} />
      <BreathingAuraRing radius={4.8} color="#c084fc" speed={0.4} reducedMotion={reducedMotion} />
      <ParticleCluster
        count={Math.round(180 * density)}
        radius={3.8}
        coreRadius={0.6}
        speed={0.1}
        color="#a78bfa"
        position={[0, 1.5, -4]}
        reducedMotion={reducedMotion}
      />
      <FloatingOrbs
        orbs={[
          { position: [0, 1.5, -5], scale: 3.5, color: '#4f46e5', speed: 0.3, offset: 0 },
        ]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
