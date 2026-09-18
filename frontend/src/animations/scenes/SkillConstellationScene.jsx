import React from 'react';
import { ParticleNetwork } from '../components/ParticleNetwork';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleField } from '../components/ParticleField';

export const SkillConstellationScene = ({ density = 1, reducedMotion = false }) => {
  return (
    <group>
      <AmbientGlow color1="#0891b2" color2="#4f46e5" intensity={0.5} reducedMotion={reducedMotion} />
      <ParticleField
        count={Math.round(250 * density)}
        spread={25}
        depth={18}
        speed={0.03}
        size={0.035}
        color="#38bdf8"
        secondaryColor="#818cf8"
        reducedMotion={reducedMotion}
      />
      {/* Dynamic Skill Synapses */}
      <ParticleNetwork
        nodeCount={Math.round(55 * density)}
        connectionDistance={3.6}
        spread={18}
        nodeColor="#38bdf8"
        lineColor="#818cf8"
        speed={0.05}
        reducedMotion={reducedMotion}
      />
      {/* 3 Skill Clusters representing disciplines: Web, AI, Design */}
      <ParticleCluster
        count={Math.round(80 * density)}
        radius={2.2}
        coreRadius={0.4}
        speed={0.16}
        color="#60a5fa"
        position={[-6, 2, -4]}
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(80 * density)}
        radius={2.2}
        coreRadius={0.4}
        speed={-0.14}
        color="#a855f7"
        position={[6, -2, -5]}
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(70 * density)}
        radius={2.0}
        coreRadius={0.3}
        speed={0.12}
        color="#34d399"
        position={[0, 4, -6]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
