import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import { memo, useRef, useMemo } from 'react';
import type { Group, Mesh } from 'three';
import { cn } from '@/shared/lib/utils';

function BrainSphere() {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          speed={2.5}
          distort={0.35}
          roughness={0.15}
          metalness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

type OrbData = {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  size: number;
  yAmp: number;
};

function OrbitingOrbs() {
  const groupRef = useRef<Group>(null);
  const orbs = useMemo<OrbData[]>(
    () => [
      { radius: 2.4, speed: 0.5, offset: 0, color: '#60a5fa', size: 0.12, yAmp: 0.3 },
      { radius: 2.8, speed: 0.35, offset: Math.PI * 0.5, color: '#a78bfa', size: 0.1, yAmp: 0.5 },
      { radius: 2.2, speed: 0.65, offset: Math.PI, color: '#38bdf8', size: 0.09, yAmp: 0.2 },
      { radius: 2.6, speed: 0.45, offset: Math.PI * 1.5, color: '#c084fc', size: 0.14, yAmp: 0.4 },
      { radius: 3.0, speed: 0.3, offset: Math.PI * 0.75, color: '#93c5fd', size: 0.08, yAmp: 0.55 },
      { radius: 2.1, speed: 0.55, offset: Math.PI * 1.25, color: '#818cf8', size: 0.11, yAmp: 0.35 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const o = orbs[i];
      child.position.x = Math.cos(t * o.speed + o.offset) * o.radius;
      child.position.z = Math.sin(t * o.speed + o.offset) * o.radius;
      child.position.y = Math.sin(t * o.speed * 1.5 + o.offset) * o.yAmp;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((o, i) => (
        <mesh key={i} scale={o.size}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={o.color}
            emissive={o.color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowRing() {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI * 0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.15;
      ref.current.rotation.z = clock.elapsedTime * 0.08;
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI * 0.5, 0, 0]}>
      <torusGeometry args={[2, 0.02, 16, 64]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#7c3aed"
        emissiveIntensity={0.8}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

export const HeroScene = memo(function HeroScene({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none', className)} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 45, position: [0, 0, 6] }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 5]} intensity={30} color="#7c3aed" />
        <pointLight position={[-3, -2, 4]} intensity={25} color="#3b82f6" />
        <pointLight position={[0, 4, 2]} intensity={15} color="#c084fc" />
        <fog attach="fog" args={['#e8edff', 5, 14]} />
        <BrainSphere />
        <OrbitingOrbs />
        <GlowRing />
        <Sparkles count={40} scale={6} size={2.5} speed={0.3} color="#c4b5fd" opacity={0.35} />
      </Canvas>
    </div>
  );
});
