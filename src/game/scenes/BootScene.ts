import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 顯示載入進度
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, '載入中...', {
      font: '20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 生成遊戲素材（使用程式碼生成，不需要外部圖片）
    this.createGameAssets();
  }

  createGameAssets() {
    // 創建玩家圖片 (藍色騎士)
    const playerCanvas = this.textures.createCanvas('player', 32, 32);
    const playerCtx = playerCanvas!.getContext();
    // 身體
    playerCtx.fillStyle = '#4a90d9';
    playerCtx.fillRect(8, 8, 16, 20);
    // 頭部
    playerCtx.fillStyle = '#f5d0a9';
    playerCtx.fillRect(10, 2, 12, 10);
    // 頭盔
    playerCtx.fillStyle = '#silver';
    playerCtx.fillRect(8, 0, 16, 6);
    // 劍
    playerCtx.fillStyle = '#c0c0c0';
    playerCtx.fillRect(24, 10, 6, 2);
    playerCtx.fillRect(26, 6, 2, 12);
    playerCanvas!.refresh();

    // 創建怪物圖片 (紅色史萊姆)
    const monsterCanvas = this.textures.createCanvas('monster', 32, 32);
    const monsterCtx = monsterCanvas!.getContext();
    // 身體 (橢圓形史萊姆)
    monsterCtx.fillStyle = '#e74c3c';
    monsterCtx.beginPath();
    monsterCtx.ellipse(16, 20, 14, 10, 0, 0, Math.PI * 2);
    monsterCtx.fill();
    // 眼睛
    monsterCtx.fillStyle = '#ffffff';
    monsterCtx.fillRect(10, 16, 4, 4);
    monsterCtx.fillRect(18, 16, 4, 4);
    // 瞳孔
    monsterCtx.fillStyle = '#000000';
    monsterCtx.fillRect(12, 17, 2, 2);
    monsterCtx.fillRect(20, 17, 2, 2);
    monsterCanvas!.refresh();

    // 創建地板圖塊
    const floorCanvas = this.textures.createCanvas('floor', 32, 32);
    const floorCtx = floorCanvas!.getContext();
    floorCtx.fillStyle = '#3d5a3d';
    floorCtx.fillRect(0, 0, 32, 32);
    floorCtx.fillStyle = '#4a6b4a';
    floorCtx.fillRect(2, 2, 12, 12);
    floorCtx.fillRect(18, 18, 12, 12);
    floorCanvas!.refresh();

    // 創建草地裝飾
    const grassCanvas = this.textures.createCanvas('grass', 32, 32);
    const grassCtx = grassCanvas!.getContext();
    grassCtx.fillStyle = '#228b22';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 28 + 2;
      grassCtx.fillRect(x, 20, 2, 8);
      grassCtx.fillRect(x - 1, 22, 1, 4);
      grassCtx.fillRect(x + 2, 23, 1, 3);
    }
    grassCanvas!.refresh();

    // 創建攻擊特效
    const attackCanvas = this.textures.createCanvas('attack-effect', 48, 48);
    const attackCtx = attackCanvas!.getContext();
    attackCtx.strokeStyle = '#ffff00';
    attackCtx.lineWidth = 3;
    attackCtx.beginPath();
    attackCtx.arc(24, 24, 20, 0, Math.PI * 2);
    attackCtx.stroke();
    attackCtx.beginPath();
    attackCtx.moveTo(24, 4);
    attackCtx.lineTo(24, 14);
    attackCtx.moveTo(24, 34);
    attackCtx.lineTo(24, 44);
    attackCtx.moveTo(4, 24);
    attackCtx.lineTo(14, 24);
    attackCtx.moveTo(34, 24);
    attackCtx.lineTo(44, 24);
    attackCtx.stroke();
    attackCanvas!.refresh();

    // 創建藥水圖片
    const potionCanvas = this.textures.createCanvas('potion', 16, 16);
    const potionCtx = potionCanvas!.getContext();
    potionCtx.fillStyle = '#ff6b6b';
    potionCtx.fillRect(4, 6, 8, 8);
    potionCtx.fillStyle = '#8b4513';
    potionCtx.fillRect(5, 2, 6, 4);
    potionCanvas!.refresh();

    // 創建 Boss 怪物
    const bossCanvas = this.textures.createCanvas('boss', 64, 64);
    const bossCtx = bossCanvas!.getContext();
    // 身體
    bossCtx.fillStyle = '#8b0000';
    bossCtx.beginPath();
    bossCtx.ellipse(32, 40, 28, 20, 0, 0, Math.PI * 2);
    bossCtx.fill();
    // 角
    bossCtx.fillStyle = '#4a0000';
    bossCtx.beginPath();
    bossCtx.moveTo(12, 25);
    bossCtx.lineTo(8, 5);
    bossCtx.lineTo(20, 20);
    bossCtx.fill();
    bossCtx.beginPath();
    bossCtx.moveTo(52, 25);
    bossCtx.lineTo(56, 5);
    bossCtx.lineTo(44, 20);
    bossCtx.fill();
    // 眼睛
    bossCtx.fillStyle = '#ffff00';
    bossCtx.fillRect(20, 32, 8, 8);
    bossCtx.fillRect(36, 32, 8, 8);
    bossCtx.fillStyle = '#000000';
    bossCtx.fillRect(24, 34, 4, 4);
    bossCtx.fillRect(40, 34, 4, 4);
    bossCanvas!.refresh();
  }

  create() {
    this.scene.start('GameScene');
  }
}
