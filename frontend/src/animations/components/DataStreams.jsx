import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const DataStreams = ({
  streamCount = 8,
  particlesPerStream = 26,
  height = 20,
  spread = 15,
  speed = 1.2,
  color = '#06b6d4',
  theme = 'dark',
  reducedMotion = false,
}) => {
  const pointsRef = useRef();
  const isLight = theme === 'light';

  const totalParticles = streamCount * particlesPerStream;

  // Stream trajectory origins
  const streams = useMemo(() => {
    const list = [];
    for (let i = 0; i < streamCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * (spread * 0.7),
        speedMult: 0.8 + Math.random() * 0.5,
      });
    }
    return list;
  }, [streamCount, spread]);

  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(totalParticles * 3);
    const offs = new Float32Array(totalParticles);

    for (let s = 0; s < streamCount; s++) {
      const stream = streams[s];
      for (let p = 0; p < particlesPerStream; p++) {
        const idx = s * particlesPerStream + p;
        const initialY = ((p / particlesPerStream) * height) - height / 2;

        pos[idx * 3] = stream.x + (Math.random() - 0.5) * 0.4;
        pos[idx * 3 + 1] = initialY;
        pos[idx * 3 + 2] = stream.z + (Math.random() - 0.5) * 0.4;

        offs[idx] = Math.random() * height;
      }
    }

    return [pos, offs];
  }, [totalParticles, streamCount, particlesPerStream, height, streams]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posArr = geo.attributes.position.array;

    for (let s = 0; s < streamCount; s++) {
      const spd = speed * streams[s].speedMult * delta * 4;
      for (let p = 0; p < particlesPerStream; p++) {
        const idx = s * particlesPerStream + p;
        posArr[idx * 3 + 1] += spd;
        if (posArr[idx * 3 + 1] > height / 2) {
          posArr[idx * 3 + 1] = -height / 2;
        }
      }
    }

    geo.attributes.position.needsUpdate = true;
  });

  const blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={totalParticles}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isLight ? 0.075 : 0.085}
        color={color}
        transparent
        opacity={isLight ? 0.7 : 0.85}
        sizeAttenuation
        blending={blending}
        depthWrite={false}
      />
    </points>
  );
};

export default DataStreams;
