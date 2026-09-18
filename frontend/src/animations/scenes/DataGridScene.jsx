import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AmbientGlow } from '../components/AmbientGlow';
import { DataStreams } from '../components/DataStreams';
import { SCENE_KEYS, getSceneThemePalette } from '../animationConfig';

const TacticalGrid = ({ size = 28, divisions = 28, centerColor = '#6366f1', gridColor = '#1e1b4b', reducedMotion = false }) => {
  const gridRef = useRef();

  useFrame((state) => {
    if (reducedMotion || !gridRef.current) return;
    const t = state.clock.getElapsedTime() * 0.1;
    gridRef.current.position.z = (t * 2) % (size / divisions);
  });

  return (
    <group position={[0, -4, -6]} rotation={[0.4, 0, 0]}>
      <gridHelper ref={gridRef} args={[size, divisions, centerColor, gridColor]} />
    </group>
  );
};

export const DataGridScene = ({ density = 1, theme = 'dark', reducedMotion = false }) => {
  const palette = getSceneThemePalette(SCENE_KEYS.ADMIN, theme);

  return (
    <group>
      <AmbientGlow
        color1={palette.glow1}
        color2={palette.glow2}
        intensity={0.6}
        theme={theme}
        reducedMotion={reducedMotion}
      />
      <TacticalGrid
        size={28}
        divisions={28}
        centerColor={palette.primary}
        gridColor={palette.gridColor}
        reducedMotion={reducedMotion}
      />
      <DataStreams
        streamCount={8}
        particlesPerStream={25}
        height={18}
        spread={16}
        speed={1.1}
        color={palette.secondary}
        theme={theme}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

export default DataGridScene;
