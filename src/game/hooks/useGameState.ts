import { useState, useCallback } from 'react';
import { Vector3 } from 'three';
import {
  PlayerStats,
  MonsterData,
  MONSTER_CONFIGS,
  INITIAL_PLAYER_STATS
} from '../types';

let monsterId = 0;

export function useGameState() {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [killCount, setKillCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<Array<{
    id: number;
    text: string;
    position: [number, number, number];
    color: string;
  }>>([]);

  // 生成怪物
  const spawnMonster = useCallback((playerPosition: Vector3) => {
    const type = killCount >= 20 && killCount % 20 === 0 && !monsters.some(m => m.type === 'boss')
      ? 'boss'
      : playerStats.level >= 3 && Math.random() < 0.4
        ? 'strongSlime'
        : 'slime';

    const config = MONSTER_CONFIGS[type];

    // 在玩家周圍生成，但不要太近
    let x: number, z: number;
    do {
      x = (Math.random() - 0.5) * 40;
      z = (Math.random() - 0.5) * 40;
    } while (
      Math.sqrt(
        Math.pow(x - playerPosition.x, 2) +
        Math.pow(z - playerPosition.z, 2)
      ) < 8
    );

    const newMonster: MonsterData = {
      id: `monster-${monsterId++}`,
      type,
      position: new Vector3(x, config.scale, z),
      hp: config.hp,
      maxHp: config.hp,
      attack: config.attack,
      defense: config.defense,
      speed: config.speed,
      exp: config.exp,
      gold: config.gold,
      isAlive: true
    };

    setMonsters(prev => [...prev, newMonster]);
    return newMonster;
  }, [killCount, playerStats.level, monsters]);

  // 玩家受傷
  const playerTakeDamage = useCallback((damage: number) => {
    setPlayerStats(prev => {
      const actualDamage = Math.max(1, damage - prev.defense);
      const newHp = Math.max(0, prev.hp - actualDamage);

      if (newHp <= 0) {
        setIsGameOver(true);
      }

      return { ...prev, hp: newHp };
    });
  }, []);

  // 玩家治療
  const playerHeal = useCallback((amount: number) => {
    setPlayerStats(prev => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + amount)
    }));
  }, []);

  // 怪物受傷
  const monsterTakeDamage = useCallback((monsterId: string, damage: number, attackerStats: PlayerStats) => {
    let killed = false;
    let monsterConfig: typeof MONSTER_CONFIGS.slime | null = null;

    setMonsters(prev => prev.map(monster => {
      if (monster.id !== monsterId || !monster.isAlive) return monster;

      const actualDamage = Math.max(1, damage - monster.defense);
      const newHp = monster.hp - actualDamage;

      if (newHp <= 0) {
        killed = true;
        monsterConfig = MONSTER_CONFIGS[monster.type];
        return { ...monster, hp: 0, isAlive: false };
      }

      return { ...monster, hp: newHp };
    }));

    if (killed && monsterConfig) {
      // 給予經驗和金幣
      setPlayerStats(prev => {
        let newExp = prev.exp + monsterConfig!.exp;
        let newLevel = prev.level;
        let newMaxHp = prev.maxHp;
        let newMaxMp = prev.maxMp;
        let newAttack = prev.attack;
        let newDefense = prev.defense;
        let expToLevel = prev.expToLevel;

        // 檢查升級
        while (newExp >= expToLevel) {
          newExp -= expToLevel;
          newLevel++;
          expToLevel = Math.floor(expToLevel * 1.5);
          newMaxHp += 20;
          newMaxMp += 10;
          newAttack += 5;
          newDefense += 2;
        }

        return {
          ...prev,
          level: newLevel,
          exp: newExp,
          expToLevel,
          maxHp: newMaxHp,
          hp: newLevel > prev.level ? newMaxHp : prev.hp, // 升級時回滿血
          maxMp: newMaxMp,
          mp: newLevel > prev.level ? newMaxMp : prev.mp,
          attack: newAttack,
          defense: newDefense,
          gold: prev.gold + monsterConfig!.gold
        };
      });

      setKillCount(prev => prev + 1);

      // 移除死亡怪物
      setTimeout(() => {
        setMonsters(prev => prev.filter(m => m.id !== monsterId));
      }, 500);
    }

    return killed;
  }, []);

  // 添加浮動文字
  const addFloatingText = useCallback((text: string, position: [number, number, number], color: string) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, position, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  }, []);

  // 重置遊戲
  const resetGame = useCallback(() => {
    setPlayerStats(INITIAL_PLAYER_STATS);
    setMonsters([]);
    setKillCount(0);
    setIsGameOver(false);
    setIsPaused(false);
    monsterId = 0;
  }, []);

  return {
    playerStats,
    monsters,
    killCount,
    isPaused,
    isGameOver,
    floatingTexts,
    setIsPaused,
    spawnMonster,
    playerTakeDamage,
    playerHeal,
    monsterTakeDamage,
    addFloatingText,
    resetGame,
    setPlayerStats
  };
}
