import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AmbientGlow } from '../components/AmbientGlow';
import { DataStreams } from '../components/DataStreams';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

export const DataUniverseScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const meshRef = useRef();
  const palette = getSceneThemePalette(SCENE_KEYS.DASHBOARD, theme);
  const isLight = theme === 'light';

  const cols = 30;
  const rows = 20;
  const count = cols * rows;

  const [positions, gridData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const data = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = i * rows + j;
        const x = (i - cols / 2) * 1.15;
        const z = (j - rows / 2) * 1.15 - 4;
        const y = -3;

        pos[idx * 3] = x;
        pos[idx * 3 + 1] = y;
        pos[idx * 3 + 2] = z;

        data.push({ x, z, origY: y });
      }
    }

    return [pos, data];
  }, [cols, rows, count]);

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const posArr = geo.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const d = gridData[i];
      const wave = Math.sin(d.x * 0.3 + time * 0.8) * Math.cos(d.z * 0.3 + time * 0.6) * 1.25;
      posArr[i * 3 + 1] = d.origY + wave;
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
      {/* Undulating Data Matrix Plane */}
      <points ref={meshRef} rotation={[0.22, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.07 : 0.075}
          color={palette.primary}
          transparent
          opacity={isLight ? 0.75 : 0.85}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Ascending Telemetry Streams */}
      <DataStreams
        streamCount={7}
        particlesPerStream={22}
        height={18}
        spread={15}
        speed={0.9}
        color={palette.secondary}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default DataUniverseScene;
