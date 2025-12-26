import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Monster, MONSTER_TYPES, MonsterConfig } from '../entities/Monster';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private monsters!: Phaser.GameObjects.Group;
  private items!: Phaser.GameObjects.Group;
  private spawnTimer: number = 0;
  private maxMonsters: number = 8;
  private killCount: number = 0;
  private bossSpawned: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // 創建地圖背景
    this.createMap();

    // 創建玩家
    this.player = new Player(this, 400, 300);

    // 創建怪物群組
    this.monsters = this.add.group();
    this.items = this.add.group();

    // 生成初始怪物
    for (let i = 0; i < 5; i++) {
      this.spawnMonster();
    }

    // 設置碰撞檢測
    this.setupCollisions();

    // 監聽事件
    this.setupEventListeners();

    // 啟動 UI 場景
    this.scene.launch('UIScene', { player: this.player });

    // 顯示遊戲說明
    this.showInstructions();
  }

  private createMap() {
    // 創建地板
    for (let x = 0; x < 800; x += 32) {
      for (let y = 0; y < 600; y += 32) {
        this.add.image(x + 16, y + 16, 'floor');

        // 隨機添加草地裝飾
        if (Math.random() < 0.2) {
          this.add.image(x + 16, y + 16, 'grass').setAlpha(0.7);
        }
      }
    }

    // 添加邊界裝飾
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x2d4a2d, 1);
    graphics.strokeRect(2, 2, 796, 596);
  }

  private spawnMonster() {
    if (this.monsters.getLength() >= this.maxMonsters) return;

    // 選擇怪物類型
    let monsterType: MonsterConfig;
    const playerLevel = this.player?.stats.level || 1;

    // 根據玩家等級調整怪物類型
    if (!this.bossSpawned && this.killCount >= 20 && this.killCount % 20 === 0) {
      // 每殺20隻怪物生成 Boss
      monsterType = MONSTER_TYPES.bossSlime;
      this.bossSpawned = true;
    } else if (playerLevel >= 3 && Math.random() < 0.4) {
      monsterType = MONSTER_TYPES.strongSlime;
    } else {
      monsterType = MONSTER_TYPES.slime;
    }

    // 在玩家視野外生成
    let x: number, y: number;
    do {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
    } while (
      this.player &&
      Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 200
    );

    const monster = new Monster(this, x, y, monsterType);
    if (this.player) {
      monster.setTarget(this.player);
    }
    this.monsters.add(monster);

    // Boss 生成提示
    if (monsterType.isBoss) {
      this.showBossWarning();
    }
  }

  private showBossWarning() {
    const warningText = this.add.text(400, 300, '⚠ BOSS 出現！', {
      fontSize: '32px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: warningText,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      onComplete: () => warningText.destroy()
    });

    // 螢幕震動
    this.cameras.main.shake(500, 0.01);
  }

  private setupCollisions() {
    // 玩家與怪物碰撞
    this.physics.add.overlap(
      this.player,
      this.monsters,
      this.handlePlayerMonsterCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private handlePlayerMonsterCollision(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    monster: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    // 碰撞傷害由怪物的 AI 處理
  }

  private setupEventListeners() {
    // 物品掉落事件
    this.events.on('itemDropped', (item: Phaser.GameObjects.Sprite) => {
      this.items.add(item);
    });

    // 怪物死亡事件
    this.events.on('monsterKilled', (config: MonsterConfig) => {
      this.killCount++;

      if (config.isBoss) {
        this.bossSpawned = false;
      }

      // 更新 UI
      this.events.emit('updateKillCount', this.killCount);
    });

    // 玩家升級事件
    this.events.on('playerLevelUp', () => {
      // 增加最大怪物數量
      this.maxMonsters = Math.min(15, 8 + Math.floor(this.player.stats.level / 2));
    });
  }

  private showInstructions() {
    const instructions = this.add.text(400, 50,
      '【操作說明】WASD/方向鍵：移動 | 空白鍵：攻擊', {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: instructions,
      alpha: 0,
      delay: 5000,
      duration: 1000,
      onComplete: () => instructions.destroy()
    });
  }

  update(time: number, delta: number) {
    // 更新玩家
    this.player.update(time, delta);

    // 更新所有怪物
    this.monsters.getChildren().forEach((monster) => {
      (monster as Monster).update(time, delta);
    });

    // 處理玩家攻擊
    if (this.player.isAttacking) {
      this.handlePlayerAttack();
    }

    // 處理物品拾取
    this.handleItemPickup();

    // 定時生成怪物
    this.spawnTimer += delta;
    if (this.spawnTimer >= 3000) { // 每3秒嘗試生成
      this.spawnTimer = 0;
      this.spawnMonster();
    }

    // 更新 UI
    this.events.emit('updatePlayerStats', this.player.stats);
  }

  private handlePlayerAttack() {
    const attackArea = this.player.attack();

    this.monsters.getChildren().forEach((obj) => {
      const monster = obj as Monster;
      if (!monster.isAlive) return;

      const distance = Phaser.Math.Distance.Between(
        attackArea.x, attackArea.y,
        monster.x, monster.y
      );

      if (distance < attackArea.radius + 16) {
        const damage = this.player.stats.attack + Phaser.Math.Between(-3, 5);
        monster.takeDamage(damage, this.player);
      }
    });
  }

  private handleItemPickup() {
    this.items.getChildren().forEach((obj) => {
      const item = obj as Phaser.GameObjects.Sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        item.x, item.y
      );

      if (distance < 30) {
        const type = item.getData('type');
        const value = item.getData('value');

        if (type === 'healthPotion') {
          this.player.heal(value);
          this.showPickupText(item.x, item.y, `+${value} HP`);
        }

        item.destroy();
      }
    });
  }

  private showPickupText(x: number, y: number, text: string) {
    const pickupText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pickupText,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => pickupText.destroy()
    });
  }
}
