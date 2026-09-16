import Phaser from 'phaser';
import { sfx } from '../audio.js';
import { BODY_BOUNDS, renderAvatarCanvas } from '../avatars.js';
import { renderCoinCanvas, renderGearCanvas } from '../pixelart.js';
import {
  COINS_PER_DIMENSION,
  DIMENSIONS,
  GEAR_THRESHOLD,
  questionsFor,
} from '../data/gameData.js';
import { coinsEarned, isComplete, recordAnswer, state } from '../state.js';
import { flyCoinToHud, showEnd, showQuestion, updateHud } from '../ui.js';

const PIXEL_SIZE = 4;
const JUMP_VELOCITY = -440;
const RUN_SPEED = 260;
const GROUND_Y = 500;
const ZONE_WIDTH = 1000;
const ZONE_START = 200;
const LEVEL_WIDTH = ZONE_START + ZONE_WIDTH * DIMENSIONS.length + 500;
const ROCKET_X = LEVEL_WIDTH - 300;

// Tre frågetecken per zon, på varierande höjd. Offset räknas från zonens start.
const ZONE_LAYOUT = [
  { platforms: [{ dx: 480, y: 395, w: 200 }], blocks: [{ dx: 160, y: 395 }, { dx: 480, y: 290 }, { dx: 800, y: 395 }] },
  { platforms: [{ dx: 300, y: 380, w: 180 }, { dx: 700, y: 330, w: 160 }], blocks: [{ dx: 120, y: 395 }, { dx: 300, y: 275 }, { dx: 700, y: 225 }] },
  { platforms: [{ dx: 420, y: 360, w: 220 }], blocks: [{ dx: 180, y: 395 }, { dx: 420, y: 255 }, { dx: 780, y: 395 }] },
  { platforms: [{ dx: 260, y: 390, w: 170 }, { dx: 620, y: 340, w: 190 }], blocks: [{ dx: 260, y: 285 }, { dx: 620, y: 235 }, { dx: 860, y: 395 }] },
  { platforms: [{ dx: 340, y: 370, w: 200 }, { dx: 700, y: 310, w: 180 }], blocks: [{ dx: 140, y: 395 }, { dx: 340, y: 265 }, { dx: 700, y: 205 }] },
];

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  create() {
    this.finished = false;
    this.paused = false;
    this.gear = {};
    this.currentZone = -1;

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 540);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 540);

    this.buildTextures();
    this.drawZones();

    this.solids = this.physics.add.staticGroup();
    this.solids.add(this.add.rectangle(LEVEL_WIDTH / 2, GROUND_Y + 40, LEVEL_WIDTH, 80, 0x1b2436));
    this.createLevel();
    this.createRocket();
    this.createPlayer();

    this.physics.add.collider(this.player, this.solids, this.onLand, undefined, this);
    this.physics.add.collider(this.player, this.blocks, this.onBlockCollide, undefined, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,SPACE');
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 110);

    this.zoneBanner = this.add
      .text(480, 150, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        align: 'center',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.gearBanner = this.add
      .text(480, 470, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '13px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);
  }

  buildTextures() {
    for (const dimension of DIMENSIONS) {
      const key = `coin-${dimension.id}`;
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, renderCoinCanvas(dimension.color, 5));
      }
    }
    for (const name of ['shield', 'jetpack', 'thrust', 'companion', 'datacube']) {
      const key = `gear-${name}`;
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, renderGearCanvas(name, PIXEL_SIZE));
      }
    }
  }

  drawZones() {
    this.add.rectangle(0, 0, LEVEL_WIDTH, 540, 0x0a0e17).setOrigin(0, 0).setScrollFactor(0.2);

    DIMENSIONS.forEach((dimension, index) => {
      const startX = ZONE_START + index * ZONE_WIDTH;
      // Zonfärgen följer världen — färgen du ser ska vara zonen du står i.
      this.add.rectangle(startX, 0, ZONE_WIDTH, 540, dimension.tint).setOrigin(0, 0);

      for (let i = 0; i < 3; i += 1) {
        const x = startX + 120 + i * 330;
        const height = 130 + ((index * 37 + i * 61) % 90);
        this.add
          .triangle(x, GROUND_Y, 0, 0, 170, -height, 340, 0, 0x151d2e)
          .setScrollFactor(0.6);
      }
    });
  }

  createLevel() {
    this.blocks = this.physics.add.staticGroup();

    DIMENSIONS.forEach((dimension, index) => {
      const startX = ZONE_START + index * ZONE_WIDTH;
      const layout = ZONE_LAYOUT[index];
      const questions = questionsFor(dimension.id);

      for (const platform of layout.platforms) {
        this.solids.add(
          this.add.rectangle(startX + platform.dx, platform.y, platform.w, 18, 0x2a3550),
        );
      }

      layout.blocks.forEach((spot, i) => {
        const block = this.add.rectangle(startX + spot.dx, spot.y, 42, 42, 0xe0b23c);
        block.setStrokeStyle(2, 0xb8860b);
        const label = this.add
          .text(block.x, block.y, '?', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#3a2a00',
          })
          .setOrigin(0.5);

        block.setData('question', questions[i]);
        block.setData('label', label);
        block.setData('used', false);
        this.blocks.add(block);
      });
    });
  }

  createRocket() {
    this.add.rectangle(ROCKET_X, GROUND_Y - 6, 70, 12, 0x2a3550);
    this.rocket = this.add.container(ROCKET_X, GROUND_Y - 60, [
      this.add.rectangle(0, 0, 34, 96, 0xd6dae6),
      this.add.rectangle(0, -20, 34, 26, 0x7c3aed),
      this.add.triangle(0, -62, 0, 26, 17, 0, 34, 26, 0xef4444).setOrigin(0.5),
      this.add.triangle(-24, 40, 0, 0, 16, -28, 16, 28, 0xef4444).setOrigin(0.5),
      this.add.triangle(24, 40, 0, -28, 16, 0, 0, 28, 0xef4444).setOrigin(0.5),
    ]);
  }

  createPlayer() {
    const roleId = state.role?.id ?? 'medarbetare';
    const textureKey = `avatar-${roleId}`;
    if (!this.textures.exists(textureKey)) {
      this.textures.addCanvas(textureKey, renderAvatarCanvas(roleId, PIXEL_SIZE));
    }

    this.player = this.add.image(80, GROUND_Y - 60, textureKey);
    this.physics.add.existing(this.player);

    // Kollisionen följer kroppen, inte kronan eller kaffemuggen.
    this.player.body.setSize(BODY_BOUNDS.width * PIXEL_SIZE, BODY_BOUNDS.height * PIXEL_SIZE, false);
    this.player.body.setOffset(BODY_BOUNDS.x * PIXEL_SIZE, BODY_BOUNDS.y * PIXEL_SIZE);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(340, 900);
    this.jumpsUsed = 0;
    this.wasAirborne = false;
  }

  onLand() {
    if (this.wasAirborne && this.player.body.blocked.down) {
      this.wasAirborne = false;
      sfx.land();
      this.cameras.main.shake(90, 0.003);
    }
  }

  onBlockCollide(player, block) {
    if (block.getData('used') || this.paused) return;
    if (!player.body.blocked.up) return;
    this.openQuestion(block);
  }

  openQuestion(block) {
    const question = block.getData('question');
    block.setData('used', true);
    block.fillColor = 0x3d4763;
    block.setStrokeStyle(2, 0x24304a);
    block.getData('label').setText('✓').setColor('#8892b0');

    this.tweens.add({ targets: block, y: block.y - 8, yoyo: true, duration: 90 });

    this.paused = true;
    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    // Pilarna styr svarsalternativen medan frågan är uppe, inte figuren.
    this.input.keyboard.enabled = false;

    showQuestion(question, (optionIndex) => {
      const coinsBefore = coinsEarned(question.dimension);
      recordAnswer(question, optionIndex);
      this.rewardCoin(block, question.dimension, coinsBefore);
      this.paused = false;
      this.physics.resume();
      this.input.keyboard.resetKeys();
      this.input.keyboard.enabled = true;
    });
  }

  rewardCoin(block, dimensionId, before) {
    updateHud();
    const after = coinsEarned(dimensionId);

    if (after > before) {
      sfx.coin();
      // Ett mynt per nytt steg, så ett riktigt bra svar regnar flera.
      for (let i = before; i < after; i += 1) {
        this.time.delayedCall((i - before) * 130, () => this.spawnCoin(block, dimensionId, i));
      }
    }

    if (before < GEAR_THRESHOLD && after >= GEAR_THRESHOLD) {
      this.grantGear(dimensionId);
    }
  }

  spawnCoin(block, dimensionId, coinIndex) {
    const coin = this.add.image(block.x, block.y, `coin-${dimensionId}`);
    this.tweens.add({
      targets: coin,
      y: block.y - 46,
      duration: 330,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Myntet lämnar spelvärlden och landar i HUD:en.
        const camera = this.cameras.main;
        flyCoinToHud(dimensionId, coinIndex, this.game.canvas, {
          x: coin.x - camera.scrollX,
          y: coin.y - camera.scrollY,
          gameWidth: this.scale.gameSize.width,
          gameHeight: this.scale.gameSize.height,
        });
        coin.destroy();
      },
    });
  }

  grantGear(dimensionId) {
    const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
    this.gear[dimension.gear] = true;
    sfx.gear();

    if (dimension.gear === 'shield') {
      this.shield = this.add.image(0, 0, 'gear-shield');
    } else if (dimension.gear === 'datacube') {
      this.datacube = this.add.image(0, 0, 'gear-datacube');
    } else if (dimension.gear === 'companion') {
      this.companion = this.add.image(this.player.x - 50, this.player.y, 'gear-companion');
    } else if (dimension.gear === 'jetpack') {
      this.jetpack = this.add.image(0, 0, 'gear-jetpack').setDepth(-1);
      this.thrust = this.add.image(0, 0, 'gear-thrust').setVisible(false);
    }

    this.showBanner(this.gearBanner, dimension.gearLabel, dimension.color);
  }

  showBanner(banner, text, color) {
    banner.setText(text).setColor(color).setAlpha(0);
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 220,
      yoyo: true,
      hold: 1500,
    });
  }

  enterZone(index) {
    this.currentZone = index;
    const dimension = DIMENSIONS[index];
    sfx.zone();
    this.showBanner(
      this.zoneBanner,
      `ZON ${index + 1} / ${DIMENSIONS.length}\n${dimension.label.toUpperCase()}\n${dimension.tagline}`,
      dimension.color,
    );
  }

  update() {
    if (this.finished) return;
    this.updateGear();

    if (this.paused) return;

    const body = this.player.body;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

    // Full AI-förmåga i organisationen märks som ren fart.
    const speed = this.gear.trail ? RUN_SPEED * 1.25 : RUN_SPEED;
    if (left) body.setVelocityX(-speed);
    else if (right) body.setVelocityX(speed);
    else body.setVelocityX(0);

    if (body.blocked.down) this.jumpsUsed = 0;
    else this.wasAirborne = true;

    // Jetpacken ger ett tredje hopp: möjlighets-AI tar er dit ni inte nådde förr.
    const maxJumps = this.gear.jetpack ? 3 : 2;
    if (jumpPressed && this.jumpsUsed < maxJumps) {
      body.setVelocityY(JUMP_VELOCITY);
      this.jumpsUsed += 1;
      if (this.jumpsUsed > 1) sfx.doubleJump();
      else sfx.jump();
      this.fireThrust();
    }

    if (this.gear.trail && Math.abs(body.velocity.x) > 10) this.emitTrail();

    const zone = Math.floor((this.player.x - ZONE_START) / ZONE_WIDTH);
    if (zone !== this.currentZone && zone >= 0 && zone < DIMENSIONS.length) {
      this.enterZone(zone);
    }

    if (this.player.x >= ROCKET_X - 30 || isComplete()) this.launchRocket();
  }

  updateGear() {
    const { x, y } = this.player;
    if (this.shield) this.shield.setPosition(x + 26, y + 6);
    if (this.datacube) {
      const angle = this.time.now / 500;
      this.datacube.setPosition(x + Math.cos(angle) * 34, y - 26 + Math.sin(angle) * 8);
    }
    if (this.jetpack) this.jetpack.setPosition(x - 22, y + 4);
    if (this.thrust) this.thrust.setPosition(x - 22, y + 30);
    if (this.companion) {
      const target = x - 52;
      this.companion.x += (target - this.companion.x) * 0.06;
      this.companion.y = y - 34 + Math.sin(this.time.now / 260) * 5;
    }
  }

  fireThrust() {
    if (!this.thrust) return;
    this.thrust.setVisible(true);
    this.time.delayedCall(220, () => this.thrust?.setVisible(false));
  }

  emitTrail() {
    if (this.time.now - (this.lastTrail ?? 0) < 70) return;
    this.lastTrail = this.time.now;

    const spark = this.add.rectangle(this.player.x - 16, this.player.y + 20, 6, 6, 0x2e9e63);
    this.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.2,
      duration: 380,
      onComplete: () => spark.destroy(),
    });
  }

  launchRocket() {
    this.finished = true;
    this.paused = true;
    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    sfx.rocket();

    // Webbläsarens egen timer, inte spelklockan: byter någon flik mitt i
    // lyftet fryser tweenarna, men slutskärmen måste fram ändå — det är
    // där leadet fångas. showEnd() kan bara köras en gång.
    setTimeout(showEnd, 2600);

    this.cameras.main.stopFollow();
    this.tweens.add({
      targets: this.player,
      x: this.rocket.x,
      y: this.rocket.y + 10,
      duration: 420,
      ease: 'Quad.easeInOut',
      onComplete: () => this.liftOff(),
    });
  }

  liftOff() {
    this.player.setDepth(1);
    this.cameras.main.shake(1400, 0.006);

    const flame = this.add.image(this.rocket.x, this.rocket.y + 60, 'gear-thrust').setScale(1.6);
    this.tweens.add({
      targets: [this.rocket, this.player, flame],
      y: '-=700',
      duration: 1500,
      ease: 'Quad.easeIn',
      onComplete: () => showEnd(),
    });
    this.tweens.add({
      targets: flame,
      scaleX: 2.2,
      scaleY: 2.6,
      yoyo: true,
      repeat: 8,
      duration: 90,
    });
  }
}
