import Phaser from 'phaser';

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

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats;
  isAttacking: boolean = false;
  attackCooldown: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private attackKey!: Phaser.Input.Keyboard.Key;
  private lastDirection: string = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    // 初始化玩家屬性
    this.stats = {
      level: 1,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      exp: 0,
      expToLevel: 100,
      attack: 15,
      defense: 5,
      speed: 150,
      gold: 0
    };

    // 添加到場景
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 設置物理屬性
    this.setCollideWorldBounds(true);
    this.setScale(1.5);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 24);
    body.setOffset(6, 4);

    // 設置輸入控制
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
      this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  update(time: number, delta: number) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    this.handleMovement();
    this.handleAttack();
  }

  private handleMovement() {
    const speed = this.stats.speed;
    let velocityX = 0;
    let velocityY = 0;

    // WASD 或方向鍵控制
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      velocityX = -speed;
      this.lastDirection = 'left';
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      velocityX = speed;
      this.lastDirection = 'right';
      this.setFlipX(false);
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      velocityY = -speed;
      this.lastDirection = 'up';
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      velocityY = speed;
      this.lastDirection = 'down';
    }

    // 對角線移動時保持速度一致
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.setVelocity(velocityX, velocityY);
  }

  private handleAttack() {
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.attackCooldown <= 0) {
      this.attack();
    }
  }

  attack(): Phaser.Geom.Circle {
    this.isAttacking = true;
    this.attackCooldown = 500; // 0.5秒冷卻

    // 計算攻擊範圍位置
    let attackX = this.x;
    let attackY = this.y;
    const attackRange = 40;

    switch (this.lastDirection) {
      case 'left':
        attackX -= attackRange;
        break;
      case 'right':
        attackX += attackRange;
        break;
      case 'up':
        attackY -= attackRange;
        break;
      case 'down':
        attackY += attackRange;
        break;
    }

    // 創建攻擊特效
    const attackEffect = this.scene.add.sprite(attackX, attackY, 'attack-effect');
    attackEffect.setScale(0.8);
    attackEffect.setAlpha(0.8);

    // 攻擊動畫
    this.scene.tweens.add({
      targets: attackEffect,
      scale: 1.2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        attackEffect.destroy();
        this.isAttacking = false;
      }
    });

    // 返回攻擊範圍
    return new Phaser.Geom.Circle(attackX, attackY, 30);
  }

  takeDamage(damage: number): boolean {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.stats.hp -= actualDamage;

    // 受傷閃爍效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // 顯示傷害數字
    this.showDamageNumber(actualDamage, '#ff0000');

    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      return true; // 玩家死亡
    }
    return false;
  }

  heal(amount: number) {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    this.showDamageNumber(amount, '#00ff00');
  }

  gainExp(exp: number) {
    this.stats.exp += exp;
    this.showDamageNumber(exp, '#ffff00', '+EXP');

    // 檢查升級
    while (this.stats.exp >= this.stats.expToLevel) {
      this.levelUp();
    }
  }

  gainGold(gold: number) {
    this.stats.gold += gold;
  }

  private levelUp() {
    this.stats.exp -= this.stats.expToLevel;
    this.stats.level++;
    this.stats.expToLevel = Math.floor(this.stats.expToLevel * 1.5);

    // 提升屬性
    this.stats.maxHp += 20;
    this.stats.hp = this.stats.maxHp;
    this.stats.maxMp += 10;
    this.stats.mp = this.stats.maxMp;
    this.stats.attack += 5;
    this.stats.defense += 2;

    // 升級特效
    const levelUpText = this.scene.add.text(this.x, this.y - 50, 'LEVEL UP!', {
      fontSize: '20px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: levelUpText,
      y: this.y - 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => levelUpText.destroy()
    });

    // 發送升級事件
    this.scene.events.emit('playerLevelUp', this.stats);
  }

  private showDamageNumber(value: number, color: string, prefix: string = '') {
    const text = this.scene.add.text(
      this.x + Phaser.Math.Between(-20, 20),
      this.y - 30,
      prefix ? `${prefix}` : `-${value}`,
      {
        fontSize: '16px',
        color: color,
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }
}
