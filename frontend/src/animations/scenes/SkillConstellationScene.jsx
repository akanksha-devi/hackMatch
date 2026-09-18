import React from 'react';
import { ParticleNetwork } from '../components/ParticleNetwork';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleField } from '../components/ParticleField';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

export const SkillConstellationScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.USERS, theme);

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
        count={Math.round(320 * density)}
        spread={26}
        depth={18}
        speed={0.03}
        color={palette.primary}
        secondaryColor={palette.secondary}
        accentColor={palette.accent}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* Dynamic Skill Synapses */}
      <ParticleNetwork
        nodeCount={Math.round(65 * density)}
        connectionDistance={3.8}
        spread={18}
        nodeColor={palette.primary}
        lineColor={palette.secondary}
        speed={0.05}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* 5 Distinct Skill Constellation Clusters */}
      {/* 1. Web / Frontend */}
      <ParticleCluster
        count={Math.round(90 * density)}
        radius={2.4}
        coreRadius={0.4}
        speed={0.16}
        color={palette.cluster1}
        position={[-6, 2.5, -4]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* 2. AI / Machine Learning */}
      <ParticleCluster
        count={Math.round(90 * density)}
        radius={2.4}
        coreRadius={0.4}
        speed={-0.14}
        color={palette.cluster2}
        position={[6, -2, -5]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* 3. UI/UX Design */}
      <ParticleCluster
        count={Math.round(80 * density)}
        radius={2.2}
        coreRadius={0.3}
        speed={0.12}
        color={palette.cluster3}
        position={[0, 4.5, -6]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* 4. Backend Systems */}
      <ParticleCluster
        count={Math.round(75 * density)}
        radius={2.0}
        coreRadius={0.3}
        speed={-0.11}
        color={theme === 'light' ? '#d97706' : '#fbbf24'}
        position={[-5, -4, -5]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* 5. Cloud / Security */}
      <ParticleCluster
        count={Math.round(75 * density)}
        radius={2.0}
        coreRadius={0.3}
        speed={0.13}
        color={theme === 'light' ? '#e11d48' : '#f43f5e'}
        position={[5, 3.5, -5]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default SkillConstellationScene;
