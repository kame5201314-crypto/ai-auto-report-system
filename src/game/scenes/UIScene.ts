import Phaser from 'phaser';
import { PlayerStats } from '../entities/Player';

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private mpText!: Phaser.GameObjects.Text;
  private expText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private statsPanel!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // 創建主 UI 面板背景
    this.statsPanel = this.add.graphics();
    this.statsPanel.fillStyle(0x000000, 0.7);
    this.statsPanel.fillRoundedRect(10, 10, 200, 130, 8);

    // 等級顯示
    this.levelText = this.add.text(20, 20, 'Lv. 1', {
      fontSize: '20px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    });

    // HP 條
    this.add.text(20, 50, 'HP', {
      fontSize: '12px',
      color: '#ff6b6b'
    });
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(180, 50, '100/100', {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // MP 條
    this.add.text(20, 75, 'MP', {
      fontSize: '12px',
      color: '#4dabf7'
    });
    this.mpBar = this.add.graphics();
    this.mpText = this.add.text(180, 75, '50/50', {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // EXP 條
    this.add.text(20, 100, 'EXP', {
      fontSize: '12px',
      color: '#69db7c'
    });
    this.expBar = this.add.graphics();
    this.expText = this.add.text(180, 100, '0/100', {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // 金幣顯示
    this.goldText = this.add.text(20, 125, '💰 0', {
      fontSize: '14px',
      color: '#ffd700'
    });

    // 擊殺數顯示
    this.killText = this.add.text(110, 125, '⚔️ 0', {
      fontSize: '14px',
      color: '#ffffff'
    });

    // 右下角技能提示
    this.createSkillHints();

    // 監聽遊戲事件
    const gameScene = this.scene.get('GameScene');

    gameScene.events.on('updatePlayerStats', (stats: PlayerStats) => {
      this.updateStats(stats);
    });

    gameScene.events.on('updateKillCount', (count: number) => {
      this.killText.setText(`⚔️ ${count}`);
    });
  }

  private createSkillHints() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(650, 550, 140, 40, 8);

    this.add.text(660, 560, '空白鍵 - 攻擊', {
      fontSize: '12px',
      color: '#ffffff'
    });
  }

  private updateStats(stats: PlayerStats) {
    // 更新等級
    this.levelText.setText(`Lv. ${stats.level}`);

    // 更新 HP 條
    this.hpBar.clear();
    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(45, 52, 130, 12);
    this.hpBar.fillStyle(0xff6b6b, 1);
    this.hpBar.fillRect(45, 52, 130 * (stats.hp / stats.maxHp), 12);
    this.hpText.setText(`${stats.hp}/${stats.maxHp}`);

    // 更新 MP 條
    this.mpBar.clear();
    this.mpBar.fillStyle(0x333333, 1);
    this.mpBar.fillRect(45, 77, 130, 12);
    this.mpBar.fillStyle(0x4dabf7, 1);
    this.mpBar.fillRect(45, 77, 130 * (stats.mp / stats.maxMp), 12);
    this.mpText.setText(`${stats.mp}/${stats.maxMp}`);

    // 更新 EXP 條
    this.expBar.clear();
    this.expBar.fillStyle(0x333333, 1);
    this.expBar.fillRect(45, 102, 130, 12);
    this.expBar.fillStyle(0x69db7c, 1);
    this.expBar.fillRect(45, 102, 130 * (stats.exp / stats.expToLevel), 12);
    this.expText.setText(`${stats.exp}/${stats.expToLevel}`);

    // 更新金幣
    this.goldText.setText(`💰 ${stats.gold}`);

    // HP 低時閃爍警告
    if (stats.hp / stats.maxHp < 0.25) {
      this.flashLowHpWarning();
    }
  }

  private flashLowHpWarning() {
    if (!this.hpText.getData('flashing')) {
      this.hpText.setData('flashing', true);
      this.tweens.add({
        targets: this.hpText,
        alpha: 0.3,
        duration: 300,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.hpText.setAlpha(1);
          this.hpText.setData('flashing', false);
        }
      });
    }
  }
}
