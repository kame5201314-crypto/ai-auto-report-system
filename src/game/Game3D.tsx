import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import { GameWorld } from './components/GameWorld';
import { Player3D } from './components/Player3D';
import { Monster3D } from './components/Monster3D';
import { AttackEffect, LevelUpEffect } from './components/AttackEffect';
import { GameUI } from './components/GameUI';
import { useGameState } from './hooks/useGameState';

interface Game3DProps {
  onBack?: () => void;
}

export const Game3D: React.FC<Game3DProps> = ({ onBack }) => {
  const {
    playerStats,
    monsters,
    killCount,
    isPaused,
    isGameOver,
    setIsPaused,
    spawnMonster,
    playerTakeDamage,
    monsterTakeDamage,
    resetGame
  } = useGameState();

  const [playerPosition, setPlayerPosition] = useState(new Vector3(0, 0.75, 0));
  const [attackEffects, setAttackEffects] = useState<Array<{ id: number; position: Vector3 }>>([]);
  const [levelUpEffect, setLevelUpEffect] = useState<Vector3 | null>(null);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 15, 15]);
  const prevLevel = useRef(playerStats.level);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 使用 ref 來保存最新的狀態，避免 stale closure
  const monstersRef = useRef(monsters);
  const playerStatsRef = useRef(playerStats);

  useEffect(() => {
    monstersRef.current = monsters;
  }, [monsters]);

  useEffect(() => {
    playerStatsRef.current = playerStats;
  }, [playerStats]);

  // 怪物生成
  useEffect(() => {
    if (isPaused || isGameOver) return;

    // 初始生成
    if (monsters.length === 0) {
      for (let i = 0; i < 5; i++) {
        spawnMonster(playerPosition);
      }
    }

    // 定時生成
    spawnTimerRef.current = setInterval(() => {
      if (monstersRef.current.length < 8 + Math.floor(playerStatsRef.current.level / 2)) {
        spawnMonster(playerPosition);
      }
    }, 3000);

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, [isPaused, isGameOver, spawnMonster, playerPosition, monsters.length]);

  // 升級特效
  useEffect(() => {
    if (playerStats.level > prevLevel.current) {
      setLevelUpEffect(playerPosition.clone());
      prevLevel.current = playerStats.level;
    }
  }, [playerStats.level, playerPosition]);

  // 鍵盤暫停
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPaused]);

  // 玩家位置變化
  const handlePlayerPositionChange = useCallback((position: Vector3) => {
    setPlayerPosition(position);
    setCameraPosition([position.x, 15, position.z + 15]);
  }, []);

  // 玩家攻擊 - 使用 ref 獲取最新的 monsters
  const handlePlayerAttack = useCallback((attackPosition: Vector3, direction: Vector3) => {
    console.log('handlePlayerAttack called', attackPosition);

    // 添加攻擊特效
    const effectId = Date.now();
    setAttackEffects(prev => [...prev, { id: effectId, position: attackPosition }]);

    // 使用 ref 獲取最新的 monsters
    const currentMonsters = monstersRef.current;
    const currentStats = playerStatsRef.current;

    console.log('Checking monsters:', currentMonsters.length);

    // 檢測攻擊範圍內的怪物 - 增加攻擊範圍
    currentMonsters.forEach(monster => {
      if (!monster.isAlive) return;

      const monsterPos = new Vector3(monster.position.x, monster.position.y, monster.position.z);
      const distance = attackPosition.distanceTo(monsterPos);

      console.log(`Monster ${monster.id} distance: ${distance}`);

      // 增加攻擊範圍到 4
      if (distance < 4) {
        const damage = currentStats.attack + Math.floor(Math.random() * 6) - 2;
        console.log(`Hit monster ${monster.id} for ${damage} damage`);
        monsterTakeDamage(monster.id, damage, currentStats);
      }
    });
  }, [monsterTakeDamage]);

  // 怪物攻擊玩家
  const handleMonsterAttackPlayer = useCallback((damage: number) => {
    playerTakeDamage(damage);
  }, [playerTakeDamage]);

  // 移除攻擊特效
  const removeAttackEffect = useCallback((id: number) => {
    setAttackEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      <Canvas shadows>
        {/* 相機 */}
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={60}
        />
        <OrbitControls
          target={[playerPosition.x, 0, playerPosition.z]}
          enablePan={false}
          enableZoom={true}
          minDistance={10}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.5}
        />

        {/* 遊戲世界 */}
        <GameWorld />

        {/* 玩家 */}
        {!isGameOver && (
          <Player3D
            stats={playerStats}
            onPositionChange={handlePlayerPositionChange}
            onAttack={handlePlayerAttack}
            isPaused={isPaused}
          />
        )}

        {/* 怪物 */}
        {monsters.map(monster => (
          <Monster3D
            key={monster.id}
            data={monster}
            playerPosition={playerPosition}
            onAttackPlayer={handleMonsterAttackPlayer}
            onTakeDamage={monsterTakeDamage}
          />
        ))}

        {/* 攻擊特效 */}
        {attackEffects.map(effect => (
          <AttackEffect
            key={effect.id}
            position={effect.position}
            onComplete={() => removeAttackEffect(effect.id)}
          />
        ))}

        {/* 升級特效 */}
        {levelUpEffect && (
          <LevelUpEffect
            position={levelUpEffect}
            onComplete={() => setLevelUpEffect(null)}
          />
        )}
      </Canvas>

      {/* UI */}
      <GameUI
        stats={playerStats}
        killCount={killCount}
        isPaused={isPaused}
        isGameOver={isGameOver}
        onPause={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onRestart={resetGame}
        onBack={onBack}
      />

      {/* 標題 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-2xl font-bold text-yellow-400 drop-shadow-lg">
          ⚔️ 天堂 3D RPG ⚔️
        </h1>
      </div>
    </div>
  );
};

export default Game3D;
