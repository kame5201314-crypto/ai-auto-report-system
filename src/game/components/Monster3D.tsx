import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { Text } from '@react-three/drei';
import { MonsterData, MONSTER_CONFIGS } from '../types';

interface Monster3DProps {
  data: MonsterData;
  playerPosition: Vector3;
  onAttackPlayer: (damage: number) => void;
  onPositionUpdate?: (id: string, position: Vector3) => void;
}

export const Monster3D: React.FC<Monster3DProps> = ({
  data,
  playerPosition,
  onAttackPlayer,
  onPositionUpdate
}) => {
  const groupRef = useRef<Group>(null);
  const [attackCooldown, setAttackCooldown] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const config = MONSTER_CONFIGS[data.type];
  const attackCooldownRef = useRef(0);
  const positionRef = useRef(new Vector3(data.position.x, config.scale, data.position.z));

  // 初始化位置
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(data.position.x, config.scale, data.position.z);
      positionRef.current.set(data.position.x, config.scale, data.position.z);
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !data.isAlive) return;

    const position = groupRef.current.position;
    const distance = position.distanceTo(playerPosition);

    // 減少攻擊冷卻
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current -= delta;
    }

    // AI 行為
    if (distance < 15) {
      // 追蹤玩家
      if (distance > 1.8) {
        const direction = new Vector3()
          .subVectors(playerPosition, position)
          .normalize();

        position.x += direction.x * data.speed * delta;
        position.z += direction.z * data.speed * delta;

        // 面向玩家
        const angle = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = angle;
      } else if (attackCooldownRef.current <= 0) {
        // 攻擊玩家
        attackCooldownRef.current = data.type === 'boss' ? 1.5 : 1;
        onAttackPlayer(data.attack);

        // 攻擊動畫
        groupRef.current.scale.setScalar(config.scale * 1.3);
        setTimeout(() => {
          if (groupRef.current) {
            groupRef.current.scale.setScalar(config.scale);
          }
        }, 200);
      }
    } else {
      // 隨機漫遊
      const time = state.clock.elapsedTime + parseInt(data.id.split('-')[1] || '0') * 100;
      position.x += Math.sin(time * 0.5) * delta * 0.5;
      position.z += Math.cos(time * 0.3) * delta * 0.5;

      // 限制在地圖範圍內
      position.x = Math.max(-20, Math.min(20, position.x));
      position.z = Math.max(-20, Math.min(20, position.z));
    }

    // 彈跳動畫
    const bounce = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    position.y = config.scale + bounce;

    // 更新位置引用 - 用於攻擊判定
    positionRef.current.copy(position);

    // 同步位置到父組件
    if (onPositionUpdate) {
      onPositionUpdate(data.id, position.clone());
    }

    // 更新 data.position (直接修改引用)
    data.position.x = position.x;
    data.position.y = position.y;
    data.position.z = position.z;
  });

  // 受傷效果
  useEffect(() => {
    if (data.hp < data.maxHp) {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 200);
    }
  }, [data.hp, data.maxHp]);

  if (!data.isAlive) {
    return null;
  }

  const hpPercent = data.hp / data.maxHp;

  return (
    <group ref={groupRef} position={[data.position.x, config.scale, data.position.z]} scale={config.scale}>
      {/* 怪物身體 - 史萊姆造型 */}
      <mesh castShadow>
        <sphereGeometry args={[1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial
          color={isHit ? '#ffffff' : config.color}
          transparent
          opacity={isHit ? 0.5 : 1}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* 眼睛 */}
      <group position={[0, 0.3, 0.5]}>
        <mesh position={[-0.25, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        {/* 瞳孔 */}
        <mesh position={[-0.25, 0, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.25, 0, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>

      {/* Boss 角 */}
      {data.type === 'boss' && (
        <>
          <mesh position={[-0.5, 1.2, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial color="#4a0000" />
          </mesh>
          <mesh position={[0.5, 1.2, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial color="#4a0000" />
          </mesh>
        </>
      )}

      {/* 名稱 */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.4}
        color={data.type === 'boss' ? '#ff0000' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {config.name}
      </Text>

      {/* 血條背景 */}
      <mesh position={[0, 1.8, 0]}>
        <planeGeometry args={[data.type === 'boss' ? 1.5 : 1, 0.12]} />
        <meshBasicMaterial color="#333333" />
      </mesh>

      {/* 血條 */}
      <mesh position={[(hpPercent - 1) * (data.type === 'boss' ? 0.75 : 0.5), 1.8, 0.01]}>
        <planeGeometry args={[(data.type === 'boss' ? 1.5 : 1) * hpPercent, 0.1]} />
        <meshBasicMaterial
          color={hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000'}
        />
      </mesh>
    </group>
  );
};
