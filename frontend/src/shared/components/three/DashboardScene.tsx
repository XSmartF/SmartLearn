import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { memo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { cn } from '@/shared/lib/utils';

function Book({
  position,
  rotation,
  color,
  width = 1.2,
  height = 0.16,
  depth = 0.9,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  width?: number;
  height?: number;
  depth?: number;
}) {
  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.35}>
      <group position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[width * 0.04, 0, 0]}>
          <boxGeometry args={[width * 0.85, height * 0.75, depth * 0.92]} />
          <meshStandardMaterial color="#faf7f0" roughness={0.85} />
        </mesh>
      </group>
    </Float>
  );
}

function KnowledgeOrb() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = 1.4 + Math.sin(t * 0.9) * 0.1;
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.15;
  });

  return (
    <mesh ref={ref} position={[0, 1.4, 0]}>
      <icosahedronGeometry args={[0.28, 1]} />
      <meshStandardMaterial
        color="#c4b5fd"
        emissive="#7c3aed"
        emissiveIntensity={0.6}
        transparent
        opacity={0.8}
        roughness={0.2}
        metalness={0.3}
      />
    </mesh>
  );
}

function BooksScene() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      <Book position={[0, -0.35, 0]} rotation={[0, 0.15, 0]} color="#7c3aed" />
      <Book
        position={[0.1, -0.05, 0.05]}
        rotation={[0, -0.1, 0.03]}
        color="#3b82f6"
        width={1.08}
        depth={0.82}
      />
      <Book
        position={[-0.06, 0.25, -0.04]}
        rotation={[0, 0.25, -0.02]}
        color="#06b6d4"
        width={0.95}
        depth={0.76}
      />
      <KnowledgeOrb />
      <Sparkles count={20} scale={3.5} size={1.8} speed={0.3} color="#a78bfa" opacity={0.35} />
    </group>
  );
}

export const DashboardScene = memo(function DashboardScene({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('pointer-events-none', className)} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 38, position: [0, 0.5, 4.8] }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 4]} intensity={18} color="#7c3aed" />
        <pointLight position={[-2, -1, 3]} intensity={12} color="#3b82f6" />
        <BooksScene />
      </Canvas>
    </div>
  );
});
