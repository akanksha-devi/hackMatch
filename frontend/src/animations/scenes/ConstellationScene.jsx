import React from 'react';
import { ParticleNetwork } from '../components/ParticleNetwork';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { FloatingOrbs } from '../components/FloatingOrbs';

export const ConstellationScene = ({ density = 1, reducedMotion = false }) => {
  return (
    <group>
      <AmbientGlow color1="#4f46e5" color2="#7c3aed" intensity={0.6} reducedMotion={reducedMotion} />
      <ParticleNetwork
        nodeCount={Math.round(45 * density)}
        connectionDistance={4.2}
        spread={15}
        nodeColor="#a78bfa"
        lineColor="#6366f1"
        speed={0.04}
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(160 * density)}
        radius={3.8}
        coreRadius={0.8}
        speed={0.14}
        color="#38bdf8"
        position={[0, 0, -3]}
        reducedMotion={reducedMotion}
      />
      <FloatingOrbs
        orbs={[
          { position: [0, 1, -6], scale: 3.2, color: '#4338ca', speed: 0.3, offset: 0 },
        ]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
