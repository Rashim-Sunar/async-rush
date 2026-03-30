import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

/**
 * WebAPI3D — Floating zone representing the Web API area
 */
export default function WebAPI3D({ position }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + 1) * 0.06;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main box */}
      <RoundedBox args={[1.6, 1.2, 0.8]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.1}
          transparent
          opacity={0.25}
          roughness={0.4}
          metalness={0.2}
        />
      </RoundedBox>

      {/* Wireframe overlay */}
      <RoundedBox args={[1.65, 1.25, 0.85]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#fbbf24"
          transparent
          opacity={0.12}
          wireframe
        />
      </RoundedBox>

      {/* Center icon sphere */}
      <mesh position={[0, 0, 0.45]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
