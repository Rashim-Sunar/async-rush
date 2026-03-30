import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

/**
 * CallStack3D — Vertical glowing tower made of stacked rounded boxes
 * Represents the JavaScript Call Stack
 */
export default function CallStack3D({ position, phase }) {
  const groupRef = useRef();

  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  const boxCount = 4;
  const boxHeight = 0.4;
  const gap = 0.08;

  return (
    <group ref={groupRef} position={position}>
      {/* Stack of rounded boxes */}
      {Array.from({ length: boxCount }).map((_, i) => {
        const y = i * (boxHeight + gap) - (boxCount * (boxHeight + gap)) / 2;
        const brightness = 0.3 + (i / boxCount) * 0.5;

        return (
          <group key={i} position={[0, y, 0]}>
            <RoundedBox
              args={[1.4, boxHeight, 0.8]}
              radius={0.08}
              smoothness={4}
            >
              <meshStandardMaterial
                color={`hsl(145, 70%, ${20 + brightness * 30}%)`}
                emissive="#4ade80"
                emissiveIntensity={phase === 'execute' ? 0.4 : 0.1}
                transparent
                opacity={0.7 + brightness * 0.3}
                roughness={0.3}
                metalness={0.1}
              />
            </RoundedBox>

            {/* Edge glow */}
            <RoundedBox
              args={[1.45, boxHeight + 0.02, 0.85]}
              radius={0.08}
              smoothness={4}
            >
              <meshStandardMaterial
                color="#4ade80"
                transparent
                opacity={0.08}
                wireframe
              />
            </RoundedBox>
          </group>
        );
      })}

      {/* Top glow orb */}
      <mesh position={[0, boxCount * (boxHeight + gap) / 2 + 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#4ade80"
          emissiveIntensity={phase === 'execute' ? 1.5 : 0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
