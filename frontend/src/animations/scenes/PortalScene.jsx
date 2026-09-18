import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleCluster } from '../components/ParticleCluster';

export const PortalScene = ({ density = 1, reducedMotion = false }) => {
  const portalRef = useRef();
  const count = Math.round(240 * density);

  const [positions, portalData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const data = [];

    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const depth = (Math.random() - 0.5) * 6 - 4;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = depth;

      data.push({ radius, angle, depth, speed: 0.3 + (10 / radius) * 0.1 });
    }

    return [pos, data];
  }, [count]);

  useFrame((state, delta) => {
    if (reducedMotion || !portalRef.current) return;
    const geo = portalRef.current.geometry;
    const posArr = geo.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const p = portalData[i];
      p.angle += delta * p.speed * 0.8;
      posArr[i * 3] = Math.cos(p.angle) * p.radius;
      posArr[i * 3 + 1] = Math.sin(p.angle) * p.radius;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <AmbientGlow color1="#6366f1" color2="#a855f7" intensity={0.7} reducedMotion={reducedMotion} />
      {/* Vortex Spiral Rings */}
      <points ref={portalRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#c084fc"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Dimensional Gateway Core */}
      <ParticleCluster
        count={Math.round(150 * density)}
        radius={2.5}
        coreRadius={0.5}
        speed={0.25}
        color="#818cf8"
        position={[0, 0, -4]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
