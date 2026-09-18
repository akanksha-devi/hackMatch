import React from 'react';
import { ParticleField } from '../components/ParticleField';
import { ParticleCluster } from '../components/ParticleCluster';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { AmbientGlow } from '../components/AmbientGlow';

export const ParticleUniverseScene = ({ density = 1, reducedMotion = false }) => {
  return (
    <group>
      <AmbientGlow color1="#4338ca" color2="#0284c7" intensity={0.5} reducedMotion={reducedMotion} />
      <ParticleField
        count={Math.round(550 * density)}
        spread={26}
        depth={20}
        speed={0.06}
        size={0.045}
        color="#818cf8"
        secondaryColor="#38bdf8"
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(200 * density)}
        radius={7}
        coreRadius={1.5}
        speed={0.09}
        color="#c084fc"
        position={[0, 0, -2]}
        reducedMotion={reducedMotion}
      />
      <FloatingOrbs
        orbs={[
          { position: [-7, 4, -8], scale: 2.8, color: '#4f46e5', speed: 0.35, offset: 0 },
          { position: [8, -3, -9], scale: 3.2, color: '#06b6d4', speed: 0.28, offset: 1.5 },
          { position: [0, -6, -11], scale: 4.0, color: '#9333ea', speed: 0.2, offset: 3.2 },
        ]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};
