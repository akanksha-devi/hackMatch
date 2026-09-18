import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * ⚡ Dynamic Volumetric Ambient Glow
 * Provides multi-directional point illumination with gentle breathing oscillation.
 */
export const AmbientGlow = ({
  color1 = '#4338ca',
  color2 = '#0284c7',
  intensity = 0.65,
  theme = 'dark',
  reducedMotion = false,
}) => {
  const lightRef1 = useRef();
  const lightRef2 = useRef();

  const isLight = theme === 'light';

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime() * 0.45;
    if (lightRef1.current) {
      lightRef1.current.position.x = Math.sin(t) * 5;
      lightRef1.current.position.y = Math.cos(t * 0.7) * 3.5;
    }
    if (lightRef2.current) {
      lightRef2.current.position.x = Math.cos(t * 0.8) * -6;
      lightRef2.current.position.y = Math.sin(t * 0.6) * -3.5;
    }
  });

  return (
    <group>
      <ambientLight intensity={isLight ? 0.85 : 0.45} />
      <pointLight
        ref={lightRef1}
        position={[-7, 5, -3]}
        color={color1}
        intensity={isLight ? intensity * 8 : intensity * 14}
        distance={28}
        decay={2}
      />
      <pointLight
        ref={lightRef2}
        position={[7, -4, -3]}
        color={color2}
        intensity={isLight ? intensity * 7 : intensity * 12}
        distance={28}
        decay={2}
      />
    </group>
  );
};

export default AmbientGlow;
