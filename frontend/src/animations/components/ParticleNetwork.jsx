import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ParticleNetwork = ({
  nodeCount = 60,
  maxConnections = 4,
  connectionDistance = 3.8,
  spread = 16,
  nodeColor = '#38bdf8',
  lineColor = '#6366f1',
  speed = 0.05,
  reducedMotion = false,
}) => {
  const groupRef = useRef();
  const linesRef = useRef();

  // Generate node anchors and velocities
  const nodes = useMemo(() => {
    const list = [];
    for (let i = 0; i < nodeCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread * 0.7,
        z: (Math.random() - 0.5) * (spread * 0.5),
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.015,
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
    if (reducedMotion || !groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * speed * 0.4;
    groupRef.current.rotation.x = Math.sin(time * speed * 0.2) * 0.05;
  });

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
          size={0.09}
          color={nodeColor}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
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
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
};
