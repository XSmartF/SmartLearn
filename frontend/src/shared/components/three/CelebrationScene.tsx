import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { memo, useRef, useMemo } from 'react';
import type { Group } from 'three';
import { cn } from '@/shared/lib/utils';

const CONFETTI_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

function Trophy() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* Base */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 0.2, 32]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Cup */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.15, 0.8, 32]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.15} metalness={0.75} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.82, 0]}>
          <torusGeometry args={[0.55, 0.04, 16, 32]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Star crown */}
        <mesh position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Confetti() {
  const groupRef = useRef<Group>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 3 + 1,
        z: (Math.random() - 0.5) * 3,
        speed: 0.3 + Math.random() * 0.5,
        rotSpeed: 1 + Math.random() * 3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        scale: 0.04 + Math.random() * 0.06,
        offset: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.x = p.x + Math.sin(t * p.speed + p.offset) * 0.5;
      child.position.y = p.y + Math.sin(t * p.speed * 0.5 + p.offset) * 0.8;
      child.position.z = p.z + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3;
      child.rotation.x = t * p.rotSpeed;
      child.rotation.z = t * p.rotSpeed * 0.7;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.scale}>
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial color={p.color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export const CelebrationScene = memo(function CelebrationScene({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('pointer-events-none', className)} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 40, position: [0, 0.8, 5.5] }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 4, 4]} intensity={25} color="#fbbf24" />
        <pointLight position={[-2, 2, 3]} intensity={20} color="#f59e0b" />
        <pointLight position={[0, -1, 5]} intensity={10} color="#fde68a" />
        <Trophy />
        <Confetti />
        <Sparkles count={50} scale={5} size={3} speed={0.5} color="#fde68a" opacity={0.5} />
      </Canvas>
    </div>
  );
});
