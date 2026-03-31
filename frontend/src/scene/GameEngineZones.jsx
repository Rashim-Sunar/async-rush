import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';

import CallStack3D from './CallStack3D';
import WebAPI3D from './WebAPI3D';
import QueuePlatform3D from './QueuePlatform3D';
import EventLoop3D from './EventLoop3D';
import FloatingParticles from './FloatingParticles';
import EventLoopWidget from '../components/EventLoopWidget';
import zoneRegistry from './zoneRegistry';

// Zone layout — positions spread to align with the 2×2 EngineComponent overlay grid
const ZONES = [
  {
    id: 'callstack',
    position: [-4.2, 2.9, 0],
    Component: CallStack3D,
    extraProps: {},
  },
  {
    id: 'webapi',
    position: [4.2, 2.9, 0],
    Component: WebAPI3D,
    extraProps: {},
  },
  {
    id: 'microtask',
    position: [-4.2, -2.9, 0],
    Component: QueuePlatform3D,
    extraProps: { label: 'micro', color: '#a855f7' },
  },
  {
    id: 'macrotask',
    position: [4.2, -2.9, 0],
    Component: QueuePlatform3D,
    extraProps: { label: 'macro', color: '#60a5fa' },
  },
];

// Pure 3D zone — no dnd-kit, no game context; registers to zoneRegistry for cross-fiber API calls
function ZoneGroup({ id, position, Component, extraProps, phase }) {
  const objRef = useRef();

  useEffect(() => {
    zoneRegistry.register(id, {
      pulse:    () => objRef.current?.pulse(),
      flash:    () => objRef.current?.flash(),
      setHover: (v) => objRef.current?.setHover(v),
    });
    return () => zoneRegistry.unregister(id);
  }, [id]);

  return (
    <group position={position}>
      <Component ref={objRef} phase={phase} balls={[]} {...extraProps} />
    </group>
  );
}

export default function GameEngineZones({ phase }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 420, position: 'relative', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 1, 12], fov: 52 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} color="#d0c0ff" />
        <directionalLight position={[4, 8, 5]} intensity={0.7} color="#ffeedd" />
        <directionalLight position={[-3, 4, -2]} intensity={0.25} color="#c0a0ff" />

        {ZONES.map(cfg => (
          <ZoneGroup key={cfg.id} phase={phase} {...cfg} />
        ))}

        <EventLoop3D position={[0, 0, 0.5]} phase={phase} />
        <FloatingParticles />

        <Html
          center
          position={[0, 0, 1]}
          occlude={false}
          zIndexRange={[15, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <EventLoopWidget />
        </Html>
      </Canvas>
    </div>
  );
}
