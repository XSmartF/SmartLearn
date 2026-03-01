import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { memo, useRef } from 'react';
import type { Mesh } from 'three';
import { cn } from '@/shared/lib/utils';

function FloatingDie() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * 0.3;
      ref.current.rotation.y = clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={[-1.8, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#f0fdf4" roughness={0.3} metalness={0.05} />
      </mesh>
    </Float>
  );
}

function PuzzleKnot() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.2;
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={[0, 0.5, 0]}>
        <torusKnotGeometry args={[0.5, 0.15, 64, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={0.25}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function GameStar() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.6;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.4}>
      <mesh ref={ref} position={[1.8, -0.2, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </Float>
  );
}

function BrainGem() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.35;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.45}>
      <mesh ref={ref} position={[0.8, 0.8, -0.5]}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color="#ec4899"
          roughness={0.2}
          metalness={0.35}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

function TargetRing() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.5;
      ref.current.rotation.z = clock.elapsedTime * 0.4;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.5}>
      <mesh ref={ref} position={[-0.8, -0.5, 0.3]}>
        <torusGeometry args={[0.4, 0.06, 16, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.3}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
    </Float>
  );
}

export const GamesScene = memo(function GamesScene({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none', className)} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 42, position: [0, 0, 5.5] }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 4]} intensity={20} color="#8b5cf6" />
        <pointLight position={[-3, -1, 3]} intensity={15} color="#10b981" />
        <pointLight position={[0, -2, 5]} intensity={10} color="#f59e0b" />
        <FloatingDie />
        <PuzzleKnot />
        <GameStar />
        <BrainGem />
        <TargetRing />
        <Sparkles count={30} scale={5} size={2} speed={0.4} color="#c4b5fd" opacity={0.3} />
      </Canvas>
    </div>
  );
});
