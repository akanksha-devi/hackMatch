import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AmbientGlow } from '../components/AmbientGlow';
import { DataStreams } from '../components/DataStreams';

const TacticalGrid = ({ size = 26, divisions = 26, color = '#312e81', reducedMotion = false }) => {
  const gridRef = useRef();

  useFrame((state) => {
    if (reducedMotion || !gridRef.current) return;
    const t = state.clock.getElapsedTime() * 0.1;
    gridRef.current.position.z = (t * 2) % (size / divisions);
  });

  return (
    <group position={[0, -4, -6]} rotation={[0.4, 0, 0]}>
      <gridHelper ref={gridRef} args={[size, divisions, '#6366f1', color]} />
    </group>
  );
};

export const DataGridScene = ({ density = 1, reducedMotion = false }) => {
  return (
    <group>
      <AmbientGlow color1="#312e81" color2="#0369a1" intensity={0.5} reducedMotion={reducedMotion} />
      <TacticalGrid size={28} divisions={28} color="#1e1b4b" reducedMotion={reducedMotion} />
      <DataStreams streamCount={8} particlesPerStream={24} height={18} spread={16} speed={1.1} color="#06b6d4" reducedMotion={reducedMotion} />
    </group>
  );
};
