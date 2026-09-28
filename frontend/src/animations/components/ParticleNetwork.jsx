import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeTransition } from '../../context/ThemeTransitionContext';

export const ParticleNetwork = ({
  nodeCount = 65,
  maxConnections = 4,
  connectionDistance = 4.0,
  spread = 17,
  nodeColor = '#38bdf8',
  lineColor = '#6366f1',
  speed = 0.05,
  theme = 'dark',
  reducedMotion = false,
}) => {
  const groupRef = useRef();
  const linesRef = useRef();
  const { transitionRef } = useThemeTransition();
  const isLight = theme === 'light';

  // Generate node anchors and velocities
  const nodes = useMemo(() => {
    const list = [];
    for (let i = 0; i < nodeCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread * 0.75,
        z: (Math.random() - 0.5) * (spread * 0.55),
      });
    }
    return list;
  }, [nodeCount, spread]);

  const [nodePositions, linePositions] = useMemo(() => {
    const nodePos = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      nodePos[i * 3] = nodes[i].x;
      nodePos[i * 3 + 1] = nodes[i].y;
      nodePos[i * 3 + 2] = nodes[i].z;
    }

    // Build initial connecting line segments
    const lines = [];
    for (let i = 0; i < nodeCount; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance && connections < maxConnections) {
          lines.push(nodes[i].x, nodes[i].y, nodes[i].z);
          lines.push(nodes[j].x, nodes[j].y, nodes[j].z);
          connections++;
        }
      }
    }

    return [nodePos, new Float32Array(lines)];
  }, [nodes, nodeCount, connectionDistance, maxConnections]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const meta = transitionRef?.current;
    const isTransitionActive = meta && meta.active && meta.collapseAmount > 0.001;

    if (!reducedMotion) {
      groupRef.current.rotation.y = time * speed * 0.45;
      groupRef.current.rotation.x = Math.sin(time * speed * 0.22) * 0.06;
    }

    if (isTransitionActive) {
      const c = meta.collapseAmount;
      let s = 1 - c * 0.45;
      if (meta.progress > 0.6 && meta.progress < 0.95) {
        const p = (meta.progress - 0.6) / 0.35;
        s += Math.sin(p * Math.PI) * 0.22;
      }
      groupRef.current.scale.set(s, s, s);
      groupRef.current.position.z = -c * 2;
    } else {
      groupRef.current.scale.set(1, 1, 1);
      groupRef.current.position.set(0, 0, 0);
    }
  });

  const blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <group ref={groupRef}>
      {/* Node Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodePositions.length / 3}
            array={nodePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isLight ? 0.10 : 0.11}
          color={nodeColor}
          transparent
          opacity={isLight ? 0.8 : 0.95}
          sizeAttenuation
          blending={blending}
          depthWrite={false}
        />
      </points>

      {/* Synaptic Lines */}
      {linePositions.length > 0 && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={lineColor}
            transparent
            opacity={isLight ? 0.35 : 0.3}
            blending={blending}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
};

export default ParticleNetwork;
