import Phaser from 'phaser';
import { Player } from './Player';

export interface MonsterConfig {
  name: string;
  texture: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  scale?: number;
  isBoss?: boolean;
}

export const MONSTER_TYPES: { [key: string]: MonsterConfig } = {
  slime: {
    name: '史萊姆',
    texture: 'monster',
    hp: 30,
    attack: 8,
    defense: 2,
    speed: 50,
    exp: 15,
    gold: 5
  },
  strongSlime: {
    name: '強化史萊姆',
    texture: 'monster',
    hp: 60,
    attack: 15,
    defense: 5,
    speed: 60,
    exp: 35,
    gold: 15,
    scale: 1.3
  },
  bossSlime: {
    name: '史萊姆王',
    texture: 'boss',
    hp: 300,
    attack: 25,
    defense: 10,
    speed: 40,
    exp: 200,
    gold: 100,
    scale: 1.5,
    isBoss: true
  }
};

export class Monster extends Phaser.Physics.Arcade.Sprite {
  config: MonsterConfig;
  currentHp: number;
  isAlive: boolean = true;
  private target: Player | null = null;
  private attackCooldown: number = 0;
  private moveTimer: number = 0;
  private wanderDirection: Phaser.Math.Vector2;
  private hpBar: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private aggroRange: number = 150;
  private attackRange: number = 40;

  constructor(scene: Phaser.Scene, x: number, y: number, config: MonsterConfig) {
    super(scene, x, y, config.texture);

    this.config = config;
    this.currentHp = config.hp;
    this.wanderDirection = new Phaser.Math.Vector2(0, 0);

    // 添加到場景
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 設置物理屬性
    this.setCollideWorldBounds(true);
    this.setScale(config.scale || 1.2);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);

    // 創建血條
    this.hpBar = scene.add.graphics();
    this.updateHpBar();

    // 創建名稱標籤
    this.nameText = scene.add.text(x, y - 35, config.name, {
      fontSize: config.isBoss ? '14px' : '10px',
      color: config.isBoss ? '#ff0000' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Boss 特效
    if (config.isBoss) {
      this.setTint(0xff6666);
    }
  }

  setTarget(player: Player) {
    this.target = player;
  }

  update(time: number, delta: number) {
    if (!this.isAlive) return;

    this.attackCooldown -= delta;
    this.moveTimer -= delta;

    if (this.target) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );

      if (distance < this.aggroRange) {
        // 追蹤玩家
        this.chasePlayer(distance);
      } else {
        // 隨機漫遊
        this.wander();
      }
    }

    // 更新血條和名稱位置
    this.updateHpBar();
    this.nameText.setPosition(this.x, this.y - 35);
  }

  private chasePlayer(distance: number) {
    if (!this.target) return;

    if (distance < this.attackRange) {
      // 攻擊玩家
      this.setVelocity(0, 0);
      if (this.attackCooldown <= 0) {
        this.attackPlayer();
      }
    } else {
      // 移動向玩家
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );

      const speed = this.config.speed;
      this.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 面向玩家
      this.setFlipX(this.target.x < this.x);
    }
  }

  private wander() {
    if (this.moveTimer <= 0) {
      // 隨機選擇新方向或停止
      if (Math.random() < 0.3) {
        this.setVelocity(0, 0);
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.config.speed * 0.5;
        this.wanderDirection.set(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
        this.setVelocity(this.wanderDirection.x, this.wanderDirection.y);
        this.setFlipX(this.wanderDirection.x < 0);
      }
      this.moveTimer = Phaser.Math.Between(1000, 3000);
    }
  }

  private attackPlayer() {
    if (!this.target || this.attackCooldown > 0) return;

    this.attackCooldown = this.config.isBoss ? 1500 : 1000;

    // 攻擊動畫
    this.scene.tweens.add({
      targets: this,
      scale: (this.config.scale || 1.2) * 1.3,
      duration: 100,
      yoyo: true
    });

    // 造成傷害
    const damage = this.config.attack + Phaser.Math.Between(-3, 3);
    this.target.takeDamage(damage);
  }

  takeDamage(damage: number, attacker: Player): boolean {
    if (!this.isAlive) return false;

    const actualDamage = Math.max(1, damage - this.config.defense);
    this.currentHp -= actualDamage;

    // 受傷效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 顯示傷害數字
    this.showDamageNumber(actualDamage);

    // 被攻擊後鎖定目標
    this.target = attacker;

    if (this.currentHp <= 0) {
      this.die(attacker);
      return true;
    }

    this.updateHpBar();
    return false;
  }

  private showDamageNumber(damage: number) {
    const text = this.scene.add.text(
      this.x + Phaser.Math.Between(-10, 10),
      this.y - 20,
      `-${damage}`,
      {
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    });
  }

  private updateHpBar() {
    this.hpBar.clear();

    const barWidth = this.config.isBoss ? 60 : 30;
    const barHeight = 4;
    const x = this.x - barWidth / 2;
    const y = this.y - (this.config.isBoss ? 45 : 25);

    // 背景
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

    // 血量
    const hpPercent = this.currentHp / this.config.hp;
    const hpColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(x, y, barWidth * hpPercent, barHeight);
  }

  private die(killer: Player) {
    this.isAlive = false;
    this.setVelocity(0, 0);

    // 給予獎勵
    killer.gainExp(this.config.exp);
    killer.gainGold(this.config.gold);

    // 掉落物品機率
    if (Math.random() < 0.3) {
      this.dropItem();
    }

    // 死亡動畫
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => {
        this.hpBar.destroy();
        this.nameText.destroy();
        this.destroy();
      }
    });

    // 發送怪物死亡事件
    this.scene.events.emit('monsterKilled', this.config);
  }

  private dropItem() {
    const potion = this.scene.add.sprite(this.x, this.y, 'potion');
    potion.setScale(1.5);
    potion.setData('type', 'healthPotion');
    potion.setData('value', 30);

    // 掉落動畫
    this.scene.tweens.add({
      targets: potion,
      y: this.y + 10,
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // 設置為可拾取物品
    this.scene.events.emit('itemDropped', potion);
  }
}
