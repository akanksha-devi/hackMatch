import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ParticleField } from '../components/ParticleField';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';

const OrbitRing = ({ radius = 6, particleCount = 120, speed = 0.1, color = '#38bdf8', tilt = [0.4, 0.2, 0], reducedMotion = false }) => {
  const ringRef = useRef();

  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.35;
      pos[i * 3] = Math.cos(angle) * (radius + jitter);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter);
    }
    return pos;
  }, [particleCount, radius]);

  useFrame((state) => {
    if (reducedMotion || !ringRef.current) return;
    ringRef.current.rotation.y = state.clock.getElapsedTime() * speed;
  });

  return (
    <group rotation={tilt} ref={ringRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color={color} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
};

export const EventOrbitScene = ({ density = 1, reducedMotion = false }) => {
  return (
    <group>
      <AmbientGlow color1="#0284c7" color2="#6366f1" intensity={0.55} reducedMotion={reducedMotion} />
      <ParticleField
        count={Math.round(300 * density)}
        spread={28}
        depth={20}
        speed={0.04}
        size={0.04}
        color="#38bdf8"
        secondaryColor="#818cf8"
        reducedMotion={reducedMotion}
      />
      <OrbitRing radius={5.5} particleCount={Math.round(140 * density)} speed={0.12} color="#06b6d4" tilt={[0.5, 0.2, 0.1]} reducedMotion={reducedMotion} />
      <OrbitRing radius={8.5} particleCount={Math.round(180 * density)} speed={-0.08} color="#818cf8" tilt={[-0.3, 0.4, -0.2]} reducedMotion={reducedMotion} />
      <OrbitRing radius={11.5} particleCount={Math.round(220 * density)} speed={0.06} color="#c084fc" tilt={[0.2, -0.5, 0.3]} reducedMotion={reducedMotion} />
      <ParticleCluster
        count={Math.round(120 * density)}
        radius={2.5}
        coreRadius={0.4}
        speed={0.18}
        color="#38bdf8"
        position={[0, 0, -4]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
