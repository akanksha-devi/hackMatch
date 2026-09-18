import React from 'react';
import { ParticleField } from '../components/ParticleField';
import { ParticleCluster } from '../components/ParticleCluster';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { AmbientGlow } from '../components/AmbientGlow';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

export const ParticleUniverseScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.HOME, theme);

  return (
    <group>
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.6}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <ParticleField
        count={Math.round(650 * density)}
        spread={26}
        depth={20}
        speed={0.06}
        color={palette.primary}
        secondaryColor={palette.secondary}
        accentColor={palette.accent}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(220 * density)}
        radius={7}
        coreRadius={1.5}
        speed={0.09}
        color={palette.accent}
        position={[0, 0, -2]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <FloatingOrbs
        orbs={[
          { position: [-7, 4, -8], scale: 2.8, color: palette.orb1, speed: 0.35, offset: 0 },
          { position: [8, -3, -9], scale: 3.2, color: palette.orb2, speed: 0.28, offset: 1.5 },
          { position: [0, -6, -11], scale: 4.0, color: palette.orb3, speed: 0.2, offset: 3.2 },
        ]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default ParticleUniverseScene;
