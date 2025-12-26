import React from 'react';
import { PlayerStats } from '../types';

interface GameUIProps {
  stats: PlayerStats;
  killCount: number;
  isPaused: boolean;
  isGameOver: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onBack?: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  stats,
  killCount,
  isPaused,
  isGameOver,
  onPause,
  onResume,
  onRestart,
  onBack
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 狀態面板 */}
      <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-4 pointer-events-auto">
        <div className="text-yellow-400 text-xl font-bold mb-2">
          Lv. {stats.level}
        </div>

        {/* HP 條 */}
        <div className="mb-2">
          <div className="flex items-center gap-2 text-sm text-red-400 mb-1">
            <span>HP</span>
            <span className="text-white">{stats.hp}/{stats.maxHp}</span>
          </div>
          <div className="w-40 h-3 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-200"
              style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
            />
          </div>
        </div>

        {/* MP 條 */}
        <div className="mb-2">
          <div className="flex items-center gap-2 text-sm text-blue-400 mb-1">
            <span>MP</span>
            <span className="text-white">{stats.mp}/{stats.maxMp}</span>
          </div>
          <div className="w-40 h-3 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${(stats.mp / stats.maxMp) * 100}%` }}
            />
          </div>
        </div>

        {/* EXP 條 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-green-400 mb-1">
            <span>EXP</span>
            <span className="text-white">{stats.exp}/{stats.expToLevel}</span>
          </div>
          <div className="w-40 h-3 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${(stats.exp / stats.expToLevel) * 100}%` }}
            />
          </div>
        </div>

        {/* 金幣和擊殺數 */}
        <div className="flex gap-4 text-sm">
          <div className="text-yellow-400">💰 {stats.gold}</div>
          <div className="text-white">⚔️ {killCount}</div>
        </div>
      </div>

      {/* 屬性面板 */}
      <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 pointer-events-auto text-sm">
        <div className="text-gray-300">
          <div>攻擊力: <span className="text-orange-400">{stats.attack}</span></div>
          <div>防禦力: <span className="text-blue-400">{stats.defense}</span></div>
          <div>速度: <span className="text-green-400">{stats.speed}</span></div>
        </div>
      </div>

      {/* 操作說明 */}
      <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg p-3 pointer-events-auto">
        <div className="text-white text-xs">
          <div className="mb-1">【操作說明】</div>
          <div className="text-gray-400">WASD / 方向鍵：移動</div>
          <div className="text-gray-400">空白鍵：攻擊</div>
          <div className="text-gray-400">ESC：暫停</div>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            ← 返回
          </button>
        )}
        <button
          onClick={isPaused ? onResume : onPause}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          {isPaused ? '▶ 繼續' : '⏸ 暫停'}
        </button>
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
        >
          🔄 重新開始
        </button>
      </div>

      {/* 暫停畫面 */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">遊戲暫停</h2>
            <button
              onClick={onResume}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg"
            >
              繼續遊戲
            </button>
          </div>
        </div>
      )}

      {/* 遊戲結束畫面 */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-500 mb-4">遊戲結束</h2>
            <div className="text-white mb-6">
              <p className="text-xl mb-2">最終等級: Lv.{stats.level}</p>
              <p className="text-lg">擊殺怪物: {killCount}</p>
              <p className="text-lg">獲得金幣: {stats.gold}</p>
            </div>
            <button
              onClick={onRestart}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg"
            >
              再玩一次
            </button>
          </div>
        </div>
      )}

      {/* 低血量警告 */}
      {stats.hp / stats.maxHp < 0.25 && !isGameOver && (
        <div className="absolute inset-0 border-4 border-red-500/50 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};
