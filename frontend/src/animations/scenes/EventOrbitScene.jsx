import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleField } from '../components/ParticleField';
import { ParticleCluster } from '../components/ParticleCluster';
import { AmbientGlow } from '../components/AmbientGlow';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

const OrbitRing = ({
  radius = 6,
  particleCount = 140,
  speed = 0.1,
  color = '#38bdf8',
  tilt = [0.4, 0.2, 0],
  theme = 'dark',
  reducedMotion = false,
}) => {
  const ringRef = useRef();
  const isLight = theme === 'light';

  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.4;
      pos[i * 3] = Math.cos(angle) * (radius + jitter);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter);
    }
    return pos;
  }, [particleCount, radius]);

  useFrame((state) => {
    if (reducedMotion || !ringRef.current) return;
    ringRef.current.rotation.y = state.clock.getElapsedTime() * speed;
  });

  return (
    <group rotation={tilt} ref={ringRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.065 : 0.075}
          color={color}
          transparent
          opacity={isLight ? 0.75 : 0.85}
          sizeAttenuation
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export const EventOrbitScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.HACKATHONS, theme);

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
        count={Math.round(380 * density)}
        spread={28}
        depth={20}
        speed={0.04}
        color={palette.primary}
        secondaryColor={palette.secondary}
        accentColor={palette.accent}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <OrbitRing
        radius={5.5}
        particleCount={Math.round(150 * density)}
        speed={0.12}
        color={palette.ring1}
        tilt={[0.5, 0.2, 0.1]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <OrbitRing
        radius={8.5}
        particleCount={Math.round(200 * density)}
        speed={-0.08}
        color={palette.ring2}
        tilt={[-0.3, 0.4, -0.2]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <OrbitRing
        radius={11.5}
        particleCount={Math.round(250 * density)}
        speed={0.06}
        color={palette.ring3}
        tilt={[0.2, -0.5, 0.3]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <ParticleCluster
        count={Math.round(140 * density)}
        radius={2.8}
        coreRadius={0.4}
        speed={0.18}
        color={palette.primary}
        position={[0, 0, -4]}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default EventOrbitScene;
