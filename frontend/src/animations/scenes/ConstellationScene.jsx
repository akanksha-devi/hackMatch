import React from 'react';
import { ParticleNetwork } from '../components/ParticleNetwork';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

export const ConstellationScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.HACKATHON_DETAIL, theme);

  return (
    <group>
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.65}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <ParticleNetwork
        nodeCount={Math.round(55 * density)}
        connectionDistance={4.4}
        spread={16}
        nodeColor={palette.primary}
        lineColor={palette.accent}
        speed={0.04}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(180 * density)}
        radius={4.0}
        coreRadius={0.8}
        speed={0.14}
        color={palette.secondary}
        position={[0, 0, -3]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <FloatingOrbs
        orbs={[
          { position: [0, 1, -6], scale: 3.4, color: palette.glow1, speed: 0.3, offset: 0 },
        ]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default ConstellationScene;
