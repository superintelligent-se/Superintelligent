import Phaser from 'phaser';
import { BODY_BOUNDS, renderAvatarCanvas } from '../avatars.js';
import { DIMENSIONS, QUESTIONS } from '../data/gameData.js';
import { isComplete, recordAnswer, state } from '../state.js';
import { showEnd, showQuestion, updateHud } from '../ui.js';

const PIXEL_SIZE = 4;
const JUMP_VELOCITY = -440;
const MAX_JUMPS = 2;

const LEVEL_WIDTH = 5200;
const GROUND_Y = 500;
const GOAL_X = 5000;

const PLATFORMS = [
  { x: 1000, y: 395, w: 200 },
  { x: 1750, y: 380, w: 220 },
  { x: 2600, y: 390, w: 200 },
  { x: 3400, y: 370, w: 240 },
  { x: 4200, y: 395, w: 200 },
];

const BLOCK_POSITIONS = [
  { x: 320, y: 395 },
  { x: 620, y: 395 },
  { x: 1000, y: 290 },
  { x: 1320, y: 395 },
  { x: 1750, y: 275 },
  { x: 2050, y: 395 },
  { x: 2330, y: 395 },
  { x: 2600, y: 285 },
  { x: 2900, y: 395 },
  { x: 3150, y: 395 },
  { x: 3400, y: 265 },
  { x: 3700, y: 395 },
  { x: 4000, y: 395 },
  { x: 4200, y: 285 },
  { x: 4600, y: 395 },
];

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  create() {
    this.finished = false;
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 540);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 540);

    this.drawBackdrop();

    this.solids = this.physics.add.staticGroup();
    const ground = this.add.rectangle(LEVEL_WIDTH / 2, GROUND_Y + 40, LEVEL_WIDTH, 80, 0x1b2436);
    this.solids.add(ground);

    for (const platform of PLATFORMS) {
      const rect = this.add.rectangle(platform.x, platform.y, platform.w, 18, 0x2a3550);
      this.solids.add(rect);
    }

    this.createBlocks();
    this.createGoal();
    this.createPlayer();

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.blocks, this.onBlockCollide, undefined, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,SPACE');

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 120);
  }

  drawBackdrop() {
    this.add
      .rectangle(0, 0, LEVEL_WIDTH, 540, 0x0a0e17)
      .setOrigin(0, 0)
      .setScrollFactor(0.2);

    for (let i = 0; i < 12; i += 1) {
      const x = i * 480 + 200;
      const height = 120 + ((i * 53) % 90);
      this.add
        .triangle(x, GROUND_Y, 0, 0, 160, -height, 320, 0, 0x151d2e)
        .setScrollFactor(0.45);
    }
  }

  createBlocks() {
    this.blocks = this.physics.add.staticGroup();
    BLOCK_POSITIONS.forEach((position, index) => {
      const question = QUESTIONS[index];
      const block = this.add.rectangle(position.x, position.y, 42, 42, 0xe0b23c);
      block.setStrokeStyle(2, 0xb8860b);
      const label = this.add
        .text(position.x, position.y, '?', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#3a2a00',
        })
        .setOrigin(0.5);

      block.setData('question', question);
      block.setData('label', label);
      block.setData('used', false);
      this.blocks.add(block);
    });
  }

  createGoal() {
    this.add.rectangle(GOAL_X, GROUND_Y - 60, 8, 120, 0x7c3aed);
    this.add.triangle(GOAL_X + 34, GROUND_Y - 100, 0, 0, 60, 20, 0, 40, 0x2e9e63);
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
    this.player.body.setMaxVelocity(300, 900);
    this.jumpsUsed = 0;
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

    this.paused = true;
    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    // Pilarna styr svarsalternativen medan frågan är uppe, inte figuren.
    this.input.keyboard.enabled = false;

    showQuestion(question, (optionIndex) => {
      recordAnswer(question, optionIndex);
      updateHud();
      this.celebrate(block, question.dimension);
      this.paused = false;
      this.physics.resume();
      this.input.keyboard.resetKeys();
      this.input.keyboard.enabled = true;
    });
  }

  celebrate(block, dimensionId) {
    const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
    const spark = this.add
      .text(block.x, block.y - 30, '+', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: dimension.color,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: spark,
      y: block.y - 80,
      alpha: 0,
      duration: 700,
      onComplete: () => spark.destroy(),
    });
  }

  update() {
    if (this.paused || this.finished) return;

    const body = this.player.body;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

    if (left) body.setVelocityX(-260);
    else if (right) body.setVelocityX(260);
    else body.setVelocityX(0);

    if (body.blocked.down) this.jumpsUsed = 0;

    // Andra hoppet ger full höjd igen från där man är i luften.
    if (jumpPressed && this.jumpsUsed < MAX_JUMPS) {
      body.setVelocityY(JUMP_VELOCITY);
      this.jumpsUsed += 1;
    }

    if (this.player.x >= GOAL_X - 20 || isComplete()) this.finish();
  }

  finish() {
    this.finished = true;
    this.physics.pause();
    showEnd();
  }
}
