import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CallStack3D from './CallStack3D';
import EventLoop3D from './EventLoop3D';
import QueuePlatform3D from './QueuePlatform3D';
import WebAPI3D from './WebAPI3D';
import FloatingParticles from './FloatingParticles';

/**
 * EngineScene — Main 3D canvas with cartoon-style JS engine visualization
 * Renders behind the 2D UI overlay
 */
export default function EngineScene({ phase }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 3, 10], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lighting — soft cartoon feel */}
        <ambientLight intensity={0.6} color="#e0d0ff" />
        <directionalLight position={[5, 8, 5]} intensity={0.8} color="#ffeedd" />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#c0a0ff" />
        <pointLight position={[0, 0, 3]} intensity={0.4} color="#fbbf24" distance={12} />

        {/* Grid floor with subtle glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial
            color="#1a0e3e"
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Engine Components */}
        <CallStack3D position={[-3, 0, 0]} phase={phase} />
        <WebAPI3D position={[3, 0.5, 0]} />
        <QueuePlatform3D position={[-2, -1.8, 1]} label="micro" color="#c084fc" />
        <QueuePlatform3D position={[2, -1.8, 1]} label="macro" color="#60a5fa" />
        <EventLoop3D position={[0, -0.5, 2]} phase={phase} />

        {/* Floating particles for atmosphere */}
        <FloatingParticles />

        {/* Subtle camera controls (disabled for game, but keeps scene alive) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.12}
        />
      </Canvas>
    </div>
  );
}
