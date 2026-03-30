import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

/**
 * QueuePlatform3D — Floating platform for micro/macro task queues
 */
export default function QueuePlatform3D({ position, label, color }) {
  const groupRef = useRef();

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const offset = label === 'micro' ? 0 : Math.PI;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + offset) * 0.1;
    }
  });

  const isMicro = label === 'micro';

  return (
    <group ref={groupRef} position={position}>
      {/* Main platform */}
      <RoundedBox args={[2, 0.2, 1]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.4}
          roughness={0.4}
          metalness={0.2}
        />
      </RoundedBox>

      {/* Platform edge glow */}
      <RoundedBox args={[2.05, 0.22, 1.05]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.1}
          wireframe
        />
      </RoundedBox>

      {/* Small indicator orbs on corners */}
      {[[-0.8, 0.2, 0.35], [0.8, 0.2, 0.35], [-0.8, 0.2, -0.35], [0.8, 0.2, -0.35]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
