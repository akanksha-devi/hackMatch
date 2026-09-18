import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const AmbientGlow = ({
  color1 = '#312e81',
  color2 = '#0e7490',
  intensity = 0.6,
  reducedMotion = false,
}) => {
  const lightRef1 = useRef();
  const lightRef2 = useRef();

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime() * 0.4;
    if (lightRef1.current) {
      lightRef1.current.position.x = Math.sin(t) * 4;
      lightRef1.current.position.y = Math.cos(t * 0.7) * 3;
    }
    if (lightRef2.current) {
      lightRef2.current.position.x = Math.cos(t * 0.8) * -5;
      lightRef2.current.position.y = Math.sin(t * 0.6) * -3;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight
        ref={lightRef1}
        position={[-6, 4, -4]}
        color={color1}
        intensity={intensity * 12}
        distance={25}
        decay={2}
      />
      <pointLight
        ref={lightRef2}
        position={[6, -4, -4]}
        color={color2}
        intensity={intensity * 10}
        distance={25}
        decay={2}
      />
    </group>
  );
};
