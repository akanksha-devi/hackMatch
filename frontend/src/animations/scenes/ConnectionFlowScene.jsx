import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleNetwork } from '../components/ParticleNetwork';

export const ConnectionFlowScene = ({ density = 1, reducedMotion = false }) => {
  const flowRef = useRef();
  const count = Math.round(180 * density);

  const [positions, flowData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const flows = [];

    for (let i = 0; i < count; i++) {
      const u = (i / count) * 20 - 10;
      pos[i * 3] = u;
      pos[i * 3 + 1] = Math.sin(u * 0.5) * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 3;

      flows.push({
        u,
        vSpeed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return [pos, flows];
  }, [count]);

  useFrame((state, delta) => {
    if (reducedMotion || !flowRef.current) return;
    const geo = flowRef.current.geometry;
    const posArr = geo.attributes.position.array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const f = flowData[i];
      f.u += delta * f.vSpeed * 2.5;
      if (f.u > 12) f.u = -12;

      posArr[i * 3] = f.u;
      posArr[i * 3 + 1] = Math.sin(f.u * 0.4 + time * 0.8) * 2.2;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <AmbientGlow color1="#0284c7" color2="#7c3aed" intensity={0.55} reducedMotion={reducedMotion} />
      <ParticleNetwork
        nodeCount={Math.round(40 * density)}
        connectionDistance={4.0}
        spread={16}
        nodeColor="#38bdf8"
        lineColor="#818cf8"
        speed={0.03}
        reducedMotion={reducedMotion}
      />
      {/* Dynamic Sinuous Flow Stream */}
      <points ref={flowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
