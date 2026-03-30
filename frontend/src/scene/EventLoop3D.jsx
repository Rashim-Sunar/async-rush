import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * EventLoop3D — Rotating torus ring representing the event loop
 * Spins slowly idle, faster during execution, emits glow on task transfer
 */
export default function EventLoop3D({ position, phase }) {
  const ringRef = useRef();
  const innerRingRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      // Base rotation speed, faster during execution
      const speed = phase === 'execute' ? 3.0 : phase === 'animating' ? 4.0 : 0.5;
      ringRef.current.rotation.z += delta * speed;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (innerRingRef.current) {
      const speed = phase === 'execute' ? 2.0 : 0.3;
      innerRingRef.current.rotation.z -= delta * speed;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      glowRef.current.material.emissiveIntensity = phase === 'execute' ? pulse * 1.5 : pulse * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.9, 0.08, 16, 48]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={phase === 'execute' ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.6, 0.05, 16, 32]} />
        <meshStandardMaterial
          color="#f472b6"
          emissive="#f472b6"
          emissiveIntensity={phase === 'execute' ? 0.6 : 0.15}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>

      {/* Center glow orb */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Glow halo */}
      <mesh>
        <ringGeometry args={[0.85, 1.1, 32]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={phase === 'execute' ? 0.15 : 0.05}
          side={2}
        />
      </mesh>
    </group>
  );
}
