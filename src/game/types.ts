import { Vector3 } from 'three';

export interface PlayerStats {
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  expToLevel: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
}

export interface MonsterData {
  id: string;
  type: 'slime' | 'strongSlime' | 'boss';
  position: Vector3;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  isAlive: boolean;
}

export interface GameState {
  player: PlayerStats;
  monsters: MonsterData[];
  killCount: number;
  isPaused: boolean;
  isGameOver: boolean;
}

export const MONSTER_CONFIGS = {
  slime: {
    name: '史萊姆',
    hp: 30,
    attack: 8,
    defense: 2,
    speed: 2,
    exp: 15,
    gold: 5,
    color: '#e74c3c',
    scale: 0.5
  },
  strongSlime: {
    name: '強化史萊姆',
    hp: 60,
    attack: 15,
    defense: 5,
    speed: 2.5,
    exp: 35,
    gold: 15,
    color: '#9b59b6',
    scale: 0.7
  },
  boss: {
    name: '史萊姆王',
    hp: 300,
    attack: 25,
    defense: 10,
    speed: 1.5,
    exp: 200,
    gold: 100,
    color: '#8b0000',
    scale: 1.5
  }
};

export const INITIAL_PLAYER_STATS: PlayerStats = {
  level: 1,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  exp: 0,
  expToLevel: 100,
  attack: 15,
  defense: 5,
  speed: 5,
  gold: 0
};
