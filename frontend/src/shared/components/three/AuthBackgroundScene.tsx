import { Canvas, useFrame } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { cn } from '@/shared/lib/utils';

type Orb = {
  color: string;
  speed: number;
  offset: number;
  position: [number, number, number];
  scale: number;
};

const ORB_COLORS = ['#60a5fa', '#a78bfa', '#38bdf8', '#93c5fd', '#c4b5fd'];
const ORB_COUNT = 12;

function buildOrbs(): Orb[] {
  return Array.from({ length: ORB_COUNT }, (_, index) => {
    const ring = Math.floor(index / 4);
    const angle = (index % 4) * (Math.PI / 2) + ring * 0.35;
    const radius = 1.8 + ring * 1.3;

    return {
      color: ORB_COLORS[index % ORB_COLORS.length],
      speed: 0.45 + (index % 5) * 0.08,
      offset: index * 0.45,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.55),
        ring * -0.9 + (index % 2 === 0 ? 0.55 : -0.55),
      ],
      scale: 0.75 + (index % 3) * 0.22,
    };
  });
}

function OrbField() {
  const groupRef = useRef<Group>(null);
  const orbs = useMemo(buildOrbs, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const elapsed = clock.elapsedTime;
    group.rotation.y = elapsed * 0.08;
    group.rotation.x = Math.sin(elapsed * 0.12) * 0.07;

    group.children.forEach((child, index) => {
      const orb = orbs[index];
      child.position.y = orb.position[1] + Math.sin(elapsed * orb.speed + orb.offset) * 0.22;
      child.position.x = orb.position[0] + Math.cos(elapsed * (orb.speed * 0.7) + orb.offset) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, index) => (
        <mesh key={index} position={orb.position} scale={orb.scale}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial
            color={orb.color}
            roughness={0.28}
            metalness={0.35}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

interface AuthBackgroundSceneProps {
  className?: string;
}

export const AuthBackgroundScene = memo(function AuthBackgroundScene({
  className,
}: AuthBackgroundSceneProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 50, position: [0, 0, 8] }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 4, 6]} intensity={35} color="#60a5fa" />
        <pointLight position={[-4, -2, 5]} intensity={30} color="#a78bfa" />
        <fog attach="fog" args={['#e8edff', 6, 18]} />
        <OrbField />
      </Canvas>
    </div>
  );
});
