import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface AttackEffectProps {
  position: Vector3;
  onComplete: () => void;
}

export const AttackEffect: React.FC<AttackEffectProps> = ({ position, onComplete }) => {
  const meshRef = useRef<Mesh>(null);
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);

  useFrame((state, delta) => {
    if (meshRef.current) {
      setScale(prev => Math.min(prev + delta * 8, 2));
      setOpacity(prev => Math.max(prev - delta * 4, 0));

      if (opacity <= 0) {
        onComplete();
      }
    }
  });

  return (
    <group position={[position.x, position.y + 0.5, position.z]}>
      {/* 主環 */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
        <ringGeometry args={[0.8, 1, 16]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={opacity} />
      </mesh>

      {/* 內環 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={scale * 0.7}>
        <ringGeometry args={[0.4, 0.6, 16]} />
        <meshBasicMaterial color="#ffa500" transparent opacity={opacity * 0.8} />
      </mesh>

      {/* 光芒線條 */}
      {[0, 1, 2, 3].map(i => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, (Math.PI / 2) * i]}
          scale={scale}
        >
          <planeGeometry args={[0.1, 1.5]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={opacity * 0.6} />
        </mesh>
      ))}
    </group>
  );
};

// 傷害數字
interface DamageNumberProps {
  value: number;
  position: Vector3;
  color: string;
  onComplete: () => void;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({
  value,
  position,
  color,
  onComplete
}) => {
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useFrame((state, delta) => {
    setOffset(prev => prev + delta * 2);
    setOpacity(prev => Math.max(prev - delta, 0));
  });

  return (
    <group position={[position.x, position.y + 1.5 + offset, position.z]}>
      <sprite scale={[1, 0.5, 1]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={opacity}
        />
      </sprite>
    </group>
  );
};

// 升級特效
interface LevelUpEffectProps {
  position: Vector3;
  onComplete: () => void;
}

export const LevelUpEffect: React.FC<LevelUpEffectProps> = ({ position, onComplete }) => {
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useFrame((state, delta) => {
    setScale(prev => Math.min(prev + delta * 2, 3));
    setRotation(prev => prev + delta * 2);
    if (scale >= 2) {
      setOpacity(prev => Math.max(prev - delta, 0));
    }
  });

  return (
    <group position={[position.x, position.y + 2, position.z]}>
      {/* 旋轉光環 */}
      <mesh rotation={[0, rotation, 0]} scale={scale}>
        <torusGeometry args={[1, 0.1, 8, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={opacity} />
      </mesh>
      <mesh rotation={[Math.PI / 2, rotation * 1.5, 0]} scale={scale * 0.8}>
        <torusGeometry args={[0.8, 0.08, 8, 32]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={opacity * 0.8} />
      </mesh>

      {/* 上升粒子 */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 8) * Math.PI * 2 + rotation) * scale * 0.5,
            (scale * 0.3) % 2,
            Math.cos((i / 8) * Math.PI * 2 + rotation) * scale * 0.5
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
};
