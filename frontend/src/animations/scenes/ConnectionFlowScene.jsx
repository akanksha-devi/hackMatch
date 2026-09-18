import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientGlow } from '../components/AmbientGlow';
import { ParticleNetwork } from '../components/ParticleNetwork';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

export const ConnectionFlowScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const flowRef = useRef();
  const palette = getSceneThemePalette(SCENE_KEYS.MY_REQUESTS, theme);
  const isLight = theme === 'light';

  const count = Math.round(220 * density);

  const [positions, flowData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const flows = [];

    for (let i = 0; i < count; i++) {
      const u = (i / count) * 22 - 11;
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
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.6}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <ParticleNetwork
        nodeCount={Math.round(50 * density)}
        connectionDistance={4.2}
        spread={17}
        nodeColor={palette.primary}
        lineColor={palette.secondary}
        speed={0.03}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      {/* Dynamic Sinuous Flow Stream */}
      <points ref={flowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.08 : 0.085}
          color={palette.primary}
          transparent
          opacity={isLight ? 0.75 : 0.88}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default ConnectionFlowScene;
