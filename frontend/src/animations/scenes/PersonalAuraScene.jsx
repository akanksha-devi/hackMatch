import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

const BreathingAuraRing = ({
  radius = 3.5,
  color = '#818cf8',
  speed = 0.8,
  theme = 'dark',
  reducedMotion = false,
}) => {
  const meshRef = useRef();
  const isLight = theme === 'light';

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    const s = 1 + Math.sin(t) * 0.08;
    meshRef.current.scale.set(s, s, s);
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 1.2, -4]}>
      <ringGeometry args={[radius, radius + 0.1, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isLight ? 0.45 : 0.4}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export const PersonalAuraScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.PROFILE, theme);

  return (
    <group>
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.7}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <BreathingAuraRing radius={3.2} color={palette.primary} speed={0.6} theme={theme} reducedMotion={reducedMotion} />
      <BreathingAuraRing radius={4.8} color={palette.secondary} speed={0.4} theme={theme} reducedMotion={reducedMotion} />
      <BreathingAuraRing radius={6.4} color={palette.accent} speed={0.3} theme={theme} reducedMotion={reducedMotion} />
      <ParticleCluster
        count={Math.round(220 * density)}
        radius={4.2}
        coreRadius={0.6}
        speed={0.1}
        color={palette.primary}
        position={[0, 1.2, -4]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <FloatingOrbs
        orbs={[
          { position: [0, 1.2, -5], scale: 3.8, color: palette.glow1, speed: 0.3, offset: 0 },
        ]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default PersonalAuraScene;
