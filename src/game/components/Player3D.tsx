import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh } from 'three';
import { PlayerStats } from '../types';

interface Player3DProps {
  stats: PlayerStats;
  onPositionChange: (position: Vector3) => void;
  onAttack: (position: Vector3, direction: Vector3) => void;
  isPaused: boolean;
}

export const Player3D: React.FC<Player3DProps> = ({
  stats,
  onPositionChange,
  onAttack,
  isPaused
}) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    attack: false
  });
  const [isAttacking, setIsAttacking] = useState(false);
  const attackCooldownRef = useRef(0);
  const lastDirection = useRef(new Vector3(0, 0, -1));
  const canAttackRef = useRef(true);

  // 執行攻擊
  const performAttack = useCallback(() => {
    if (!groupRef.current || !canAttackRef.current) return;

    canAttackRef.current = false;
    setIsAttacking(true);

    // 攻擊位置在玩家前方
    const attackPos = groupRef.current.position.clone().add(
      lastDirection.current.clone().multiplyScalar(2)
    );

    console.log('Attack!', attackPos); // Debug
    onAttack(attackPos, lastDirection.current.clone());

    // 冷卻
    setTimeout(() => {
      setIsAttacking(false);
      canAttackRef.current = true;
    }, 400);
  }, [onAttack]);

  // 鍵盤事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      // 防止空白鍵滾動頁面
      if (e.code === 'Space') {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = true;
          break;
        case 'Space':
          if (canAttackRef.current) {
            performAttack();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, performAttack]);

  useFrame((state, delta) => {
    if (!groupRef.current || isPaused) return;

    const keys = keysRef.current;
    const speed = stats.speed * delta;
    const direction = new Vector3();

    // 計算移動方向
    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      lastDirection.current.copy(direction);

      // 移動玩家
      groupRef.current.position.x += direction.x * speed;
      groupRef.current.position.z += direction.z * speed;

      // 限制在地圖範圍內
      groupRef.current.position.x = Math.max(-20, Math.min(20, groupRef.current.position.x));
      groupRef.current.position.z = Math.max(-20, Math.min(20, groupRef.current.position.z));

      // 旋轉面向移動方向
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;

      onPositionChange(groupRef.current.position.clone());
    }

    // 攻擊動畫
    if (meshRef.current) {
      if (isAttacking) {
        meshRef.current.scale.setScalar(1.3);
      } else {
        meshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.2);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.75, 0]}>
      {/* 身體 */}
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#4a90d9" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* 頭部 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#f5d0a9" />
      </mesh>

      {/* 頭盔 */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <coneGeometry args={[0.2, 0.3, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 劍 */}
      <group position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.8, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.08]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* 攻擊特效 - 環繞玩家的劍氣 */}
      {isAttacking && (
        <group>
          <mesh position={[0, 0.5, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 1.2, 16]} />
            <meshBasicMaterial color="#ffff00" transparent opacity={0.8} side={2} />
          </mesh>
          <mesh position={[0, 0.5, -2]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.8, 16]} />
            <meshBasicMaterial color="#ffa500" transparent opacity={0.6} side={2} />
          </mesh>
        </group>
      )}
    </group>
  );
};
