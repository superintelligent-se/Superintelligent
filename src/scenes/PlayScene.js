import Phaser from 'phaser';
import { sfx } from '../audio.js';
import { BODY_BOUNDS, renderAvatarCanvas } from '../avatars.js';
import { renderCoinCanvas, renderGearCanvas } from '../pixelart.js';
import {
  clearTouchInput,
  consumeDown,
  consumeJump,
  setDownButtonVisible,
  touchState,
} from '../touch.js';
import {
  COINS_PER_DIMENSION,
  DIMENSIONS,
  GEAR_THRESHOLD,
  questionsFor,
} from '../data/gameData.js';
import { answerFor, coinsEarned, markShortcut, recordAnswer, state } from '../state.js';
import {
  flyCoinToHud,
  isDialogOpen,
  markGear,
  showEnd,
  showQuestion,
  showRestartPrompt,
  showShortcutPrompt,
  updateHud,
} from '../ui.js';

const CAPTURED_KEYS = 'UP,DOWN,LEFT,RIGHT,SPACE,W,A,S,D';
const PIXEL_SIZE = 4;
const JUMP_VELOCITY = -440;
const RUN_SPEED = 260;
const GROUND_Y = 500;
const ZONE_WIDTH = 1000;
const ZONE_START = 200;
const LEVEL_WIDTH = ZONE_START + ZONE_WIDTH * DIMENSIONS.length + 600;
const MAST_X = LEVEL_WIDTH - 420;
const MAST_TOP = 120;
const MAST_BOTTOM = 470;
const ROCKET_X = LEVEL_WIDTH - 240;
const PIPE_IN_X = ZONE_START + 300;
const PIPE_OUT_X = MAST_X + 130;
const PIPE_TOP = GROUND_Y - 44;
const SHORTCUT_BONUS = 100;

// Zon 1-2 är flacka. Från zon 3 klättrar banan: du tar en avsats för att nå
// ett frågetecken, och nästa ligger högre upp. Marken är alltid framkomlig,
// så ingen kan fastna och missa slutet.
const ZONE_LAYOUT = [
  {
    platforms: [{ dx: 480, y: 395, w: 200 }],
    blocks: [{ dx: 160, y: 395 }, { dx: 480, y: 290 }, { dx: 800, y: 395 }],
  },
  {
    platforms: [{ dx: 300, y: 385, w: 180 }, { dx: 700, y: 330, w: 160 }],
    blocks: [{ dx: 120, y: 395 }, { dx: 300, y: 280 }, { dx: 700, y: 225 }],
  },
  {
    platforms: [{ dx: 480, y: 390, w: 170 }, { dx: 800, y: 300, w: 160 }],
    blocks: [{ dx: 180, y: 395 }, { dx: 480, y: 285 }, { dx: 800, y: 195 }],
  },
  {
    platforms: [
      { dx: 260, y: 395, w: 150 },
      { dx: 540, y: 310, w: 150 },
      { dx: 820, y: 255, w: 140 },
    ],
    blocks: [{ dx: 260, y: 290 }, { dx: 540, y: 205 }, { dx: 820, y: 150 }],
  },
  {
    platforms: [
      { dx: 220, y: 400, w: 120 },
      { dx: 500, y: 315, w: 120 },
      { dx: 780, y: 235, w: 120 },
    ],
    blocks: [{ dx: 220, y: 295 }, { dx: 500, y: 210 }, { dx: 780, y: 130 }],
  },
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
    this.messageQueue = [];

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 540);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 540);

    this.buildTextures();
    this.drawZones();

    this.solids = this.physics.add.staticGroup();
    this.solids.add(this.add.rectangle(LEVEL_WIDTH / 2, GROUND_Y + 40, LEVEL_WIDTH, 80, 0x1b2436));
    this.createLevel();
    this.createFinish();
    this.createPipes();
    this.createPlayer();
    this.createMessagePanel();

    this.physics.add.collider(this.player, this.solids, this.onLand, undefined, this);
    this.physics.add.collider(this.player, this.blocks, this.onBlockCollide, undefined, this);
    this.physics.add.overlap(this.player, this.mastZone, this.grabMast, undefined, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 90);

    // Phaser fångar W, A, D och mellanslag på window och kallar
    // preventDefault, så de aldrig når ett textfält. Att stänga av
    // keyboard-pluginen räcker inte — fångsten sitter i managern och måste
    // rensas. Gränssnittet säger till när det behöver tangenterna själv.
    // Escape mitt i spelet: erbjud omstart. Escape inne i en dialog hanteras
    // av dialogen själv.
    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || this.finished || this.paused || isDialogOpen()) return;
      this.holdForDialog();
      showRestartPrompt((restart) => {
        if (restart) window.location.reload();
        else this.releaseFromDialog();
      });
    });

    window.addEventListener('game-input', (event) => {
      const enabled = event.detail.enabled;
      this.input.keyboard.enabled = enabled;
      if (enabled) {
        this.input.keyboard.addCapture(CAPTURED_KEYS);
      } else {
        this.input.keyboard.clearCaptures();
        this.input.keyboard.resetKeys();
      }
    });
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

        // Ditt svar ligger kvar som en etikett ovanför blocket — alltid
        // ovanför, och rent dekorativ: den kolliderar aldrig med figuren.
        const answerTag = this.add
          .text(block.x, block.y - 30, '', {
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: '11px',
            color: '#dfe6f2',
            backgroundColor: '#0d1422e6',
            padding: { x: 7, y: 5 },
            align: 'center',
            lineSpacing: 3,
          })
          .setOrigin(0.5, 1)
          .setVisible(false);

        block.setData('question', questions[i]);
        block.setData('label', label);
        block.setData('tag', answerTag);
        this.blocks.add(block);
      });
    });
  }

  createFinish() {
    // Masten: hoppa så högt du kan innan du når raketen.
    this.add.rectangle(MAST_X, (MAST_TOP + MAST_BOTTOM) / 2, 8, MAST_BOTTOM - MAST_TOP, 0x8b95a8);
    this.add.circle(MAST_X, MAST_TOP - 8, 9, 0xfde047);
    for (let y = MAST_TOP + 20; y < MAST_BOTTOM; y += 40) {
      this.add.rectangle(MAST_X, y, 26, 4, 0x5b6478);
    }

    this.mastZone = this.add.zone(MAST_X, (MAST_TOP + MAST_BOTTOM) / 2, 34, MAST_BOTTOM - MAST_TOP);
    this.physics.add.existing(this.mastZone, true);

    this.add.rectangle(ROCKET_X, GROUND_Y - 6, 70, 12, 0x2a3550);
    this.rocket = this.add.container(ROCKET_X, GROUND_Y - 60, [
      this.add.rectangle(0, 0, 34, 96, 0xd6dae6),
      this.add.rectangle(0, -20, 34, 26, 0x7c3aed),
      this.add.triangle(0, -62, 0, 26, 17, 0, 34, 26, 0xef4444).setOrigin(0.5),
      this.add.triangle(-24, 40, 0, 0, 16, -28, 16, 28, 0xef4444).setOrigin(0.5),
      this.add.triangle(24, 40, 0, -28, 16, 0, 0, 28, 0xef4444).setOrigin(0.5),
    ]);
  }

  // Klassiskt grönt rör precis efter första frågetecknet. Ner i det och du
  // hoppar över hela banan — för den som redan vet att hjälpen behövs.
  createPipes() {
    this.drawPipe(PIPE_IN_X);
    this.drawPipe(PIPE_OUT_X);

    // Skylt ovanför röret, synlig på håll, så genvägen inte missas.
    this.add
      .text(PIPE_IN_X, PIPE_TOP - 96, 'GENVÄG TILL SLUTET', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#8ef0ad',
        backgroundColor: '#0d1422e6',
        padding: { x: 9, y: 6 },
      })
      .setOrigin(0.5);

    this.add
      .text(PIPE_IN_X, PIPE_TOP - 70, '▼', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '18px',
        color: '#2fbf57',
      })
      .setOrigin(0.5);

    // Uppmaningen står bredvid röret: på röret döljs den av figuren som
    // står där, och mot den gröna kroppen syns den knappt.
    this.pipeHint = this.add
      .text(PIPE_IN_X + 60, PIPE_TOP + 8, 'TRYCK ↓', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#04240f',
        backgroundColor: '#8ef0ad',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0, 0.5)
      .setDepth(7)
      .setVisible(false);
  }

  drawPipe(x) {
    // Röret ritas framför figuren, så den glider ner bakom det i stället för
    // att tona bort — man ska se den försvinna ner i hålet.
    // Skaftet går förbi skärmkanten, annars skymtar figuren under röret.
    const shaft = this.add.rectangle(x, PIPE_TOP + 90, 58, 180, 0x1f8b3d).setDepth(6);
    shaft.setStrokeStyle(2, 0x0d4f21);
    const rim = this.add.rectangle(x, PIPE_TOP + 2, 78, 22, 0x2fbf57).setDepth(6);
    rim.setStrokeStyle(2, 0x0d4f21);
    this.solids.add(rim);
    return rim;
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

  // Meddelandena ligger i markbandet längst ner. Där är de aldrig i vägen
  // för vare sig HUD:en eller det man spelar på.
  createMessagePanel() {
    this.messagePanel = this.add
      .rectangle(0, GROUND_Y, 960, 40, 0x05070c, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(19);

    this.messageRule = this.add
      .rectangle(0, GROUND_Y, 960, 2, 0xffffff, 0.16)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(19);

    this.messageTitle = this.add
      .text(480, GROUND_Y + 5, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        align: 'center',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);

    this.messageBody = this.add
      .text(480, GROUND_Y + 22, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        align: 'center',
        color: '#c7d2e5',
        // Smalare än skärmen: touch-knapparna sitter i hörnen.
        wordWrap: { width: 620 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);

    this.messageGroup = [
      this.messagePanel,
      this.messageRule,
      this.messageTitle,
      this.messageBody,
    ];
    this.messageGroup.forEach((item) => item.setAlpha(0));
  }

  showMessage({ title, body, color = '#ffffff', duration = 3600 }) {
    this.messageQueue.push({ title, body, color, duration });
    if (!this.messageActive) this.playNextMessage();
  }

  playNextMessage() {
    const next = this.messageQueue.shift();
    if (!next) {
      this.messageActive = false;
      return;
    }
    this.messageActive = true;

    this.messageTitle.setText(next.title).setColor(next.color);
    this.messageBody.setText(next.body ?? '');
    this.messageTitle.setScale(0.8);

    this.tweens.add({ targets: this.messageTitle, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: this.messageGroup,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: next.duration,
      onComplete: () => this.playNextMessage(),
    });
  }

  onLand() {
    if (this.wasAirborne && this.player.body.blocked.down) {
      this.wasAirborne = false;
      sfx.land();
      this.cameras.main.shake(90, 0.003);
    }
  }

  onBlockCollide(player, block) {
    if (this.paused || this.finished) return;
    if (!player.body.blocked.up) return;
    this.openQuestion(block);
  }

  openQuestion(block) {
    const question = block.getData('question');
    this.tweens.add({ targets: block, y: block.y - 8, yoyo: true, duration: 90 });

    // Pilarna styr svarsalternativen medan frågan är uppe, inte figuren.
    this.holdForDialog();

    const previous = answerFor(question.id);
    showQuestion(question, previous, (optionIndex) => {
      const coinsBefore = coinsEarned(question.dimension);
      const gearBefore = coinsBefore >= GEAR_THRESHOLD;
      recordAnswer(question, optionIndex);
      this.markAnswered(block, question, optionIndex);
      this.rewardCoin(block, question.dimension, coinsBefore, gearBefore);

      this.releaseFromDialog();
    }, () => this.releaseFromDialog());
  }

  markAnswered(block, question, optionIndex) {
    const option = question.options[optionIndex];
    block.fillColor = 0x2e9e63;
    block.setStrokeStyle(2, 0x1c7a49);
    block.getData('label').setText('✓').setColor('#04240f');
    // Kort rubrik plus kort svar: vad frågan gällde och vad du svarade.
    block.getData('tag').setText([question.short.toUpperCase(), option.short]).setVisible(true);

    this.showMessage({
      title: option.label,
      body: option.comment,
      color: '#2e9e63',
      duration: 2600,
    });
  }

  rewardCoin(block, dimensionId, before, gearBefore) {
    updateHud();
    const after = coinsEarned(dimensionId);

    if (after > before) {
      sfx.coin();
      // Ett mynt per nytt steg, så ett riktigt bra svar regnar flera.
      for (let i = before; i < after; i += 1) {
        this.time.delayedCall((i - before) * 130, () => this.spawnCoin(block, dimensionId, i));
      }
    }

    // Utrustningen speglar alltid de svar som står nu — ändrar du ner
    // ett svar försvinner den igen.
    const hasGear = after >= GEAR_THRESHOLD;
    if (hasGear && !gearBefore) this.grantGear(dimensionId);
    if (!hasGear && gearBefore) this.revokeGear(dimensionId);
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
    markGear(dimensionId, true);

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

    this.showMessage({
      title: dimension.gearLabel.split(':')[0].toUpperCase(),
      body: dimension.gearWhy,
      color: dimension.color,
      duration: 4200,
    });
  }

  revokeGear(dimensionId) {
    const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
    this.gear[dimension.gear] = false;
    markGear(dimensionId, false);

    const sprites = {
      shield: 'shield',
      datacube: 'datacube',
      companion: 'companion',
      jetpack: 'jetpack',
    };
    const key = sprites[dimension.gear];
    if (key && this[key]) {
      this[key].destroy();
      this[key] = null;
    }
    if (dimension.gear === 'jetpack' && this.thrust) {
      this.thrust.destroy();
      this.thrust = null;
    }
  }

  enterZone(index) {
    this.currentZone = index;
    const dimension = DIMENSIONS[index];
    sfx.zone();
    this.showMessage({
      title: `ZON ${index + 1} / ${DIMENSIONS.length} · ${dimension.label.toUpperCase()}`,
      body: dimension.tagline,
      color: dimension.color,
      duration: 3000,
    });
  }

  update() {
    if (this.finished) return;
    this.updateGear();
    if (this.paused) return;

    const body = this.player.body;
    // Touch läses först: consume* måste köras varje bildruta, annars ligger
    // ett tryck kvar och utlöses när || kortsluter.
    const touchJump = consumeJump();
    const touchDown = consumeDown();
    const left = this.cursors.left.isDown || this.keys.A.isDown || touchState.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || touchState.right;
    const jumpPressed =
      touchJump ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

    // Full AI-förmåga i organisationen märks som ren fart.
    const speed = this.gear.trail ? RUN_SPEED * 1.25 : RUN_SPEED;
    if (left) body.setVelocityX(-speed);
    else if (right) body.setVelocityX(speed);
    else body.setVelocityX(0);

    if (body.blocked.down) {
      this.noteLanding(body);
      this.jumpsUsed = 0;
    } else {
      this.wasAirborne = true;
    }

    // Jetpacken ger ett tredje hopp: möjlighets-AI tar er dit ni inte nådde förr.
    const maxJumps = this.gear.jetpack ? 3 : 2;
    if (jumpPressed && this.jumpsUsed < maxJumps) {
      if (this.jumpsUsed === 0) this.jumpedFrom = body.bottom;
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

    this.checkPipe(body, touchDown);

    if (!this.mastHinted && this.player.x > MAST_X - 560) {
      this.mastHinted = true;
      this.showMessage({
        title: 'MASTEN VÄNTAR',
        body: 'Hoppa så högt du kan på den — ju högre träff, desto större bonus. Klarar du att hoppa över hela masten händer något annat.',
        color: '#fde047',
        duration: 4200,
      });
    }

    // Hoppade du över hela masten missar du bonusen på den — men det är
    // en svårare bragd, så den belönas bättre.
    if (this.player.x > MAST_X + 26) this.clearedMast();
  }

  holdForDialog() {
    clearTouchInput();
    this.paused = true;
    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    this.input.keyboard.enabled = false;
  }

  releaseFromDialog() {
    this.paused = false;
    this.physics.resume();
    this.input.keyboard.resetKeys();
    this.input.keyboard.enabled = true;
  }

  checkPipe(body, touchDown) {
    const standingOnPipe =
      body.blocked.down &&
      Math.abs(this.player.x - PIPE_IN_X) < 42 &&
      body.bottom <= PIPE_TOP + 16;

    this.pipeHint.setVisible(standingOnPipe);
    setDownButtonVisible(standingOnPipe);

    const downPressed =
      touchDown ||
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.keys.S);

    if (standingOnPipe && downPressed) this.offerShortcut();
  }

  offerShortcut() {
    this.holdForDialog();
    sfx.zone();

    showShortcutPrompt((takeIt) => {
      if (takeIt) {
        this.input.keyboard.resetKeys();
        this.input.keyboard.enabled = true;
        this.takeShortcut();
      } else {
        this.releaseFromDialog();
      }
    });
  }

  takeShortcut() {
    this.finished = true;
    markShortcut();
    this.pipeHint.setVisible(false);

    // Ner i röret och upp på andra sidan flaggstången. Figuren ligger bakom
    // rörgrafiken hela vägen, så den glider ur synhåll och tillbaka fram.
    this.player.setDepth(0);
    this.tweens.add({
      targets: this.player,
      y: PIPE_TOP + 120,
      duration: 900,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.player.setPosition(PIPE_OUT_X, PIPE_TOP + 120);
        this.cameras.main.stopFollow();
        this.cameras.main.pan(PIPE_OUT_X, 270, 500, 'Quad.easeInOut');
        this.tweens.add({
          targets: this.player,
          y: PIPE_TOP - 32,
          duration: 900,
          delay: 500,
          ease: 'Quad.easeOut',
          onComplete: () => this.afterShortcut(),
        });
      },
    });

    setTimeout(() => showEnd(SHORTCUT_BONUS), 9000);
  }

  afterShortcut() {
    sfx.gear();
    this.starfield();
    this.showMessage({
      title: 'GENVÄGEN TAGEN',
      body: 'Du hoppade över hela banan och kom upp bakom flaggstången. Ingen såg något. Raketen väntar.',
      color: '#8ef0ad',
      duration: 4200,
    });

    this.tweens.add({
      targets: this.player,
      x: this.rocket.x,
      y: this.rocket.y + 10,
      duration: 1000,
      delay: 1200,
      ease: 'Quad.easeInOut',
      onComplete: () => this.liftOff(SHORTCUT_BONUS),
    });
  }

  // Landar du där du startade, efter ett enkelhopp, försökte du troligen nå
  // något och missade. Tre sådana i rad och spelet berättar om dubbelhoppet.
  noteLanding(body) {
    if (this.jumpedFrom === null || this.jumpedFrom === undefined) return;
    const sameLevel = Math.abs(body.bottom - this.jumpedFrom) < 14;
    if (sameLevel && this.jumpsUsed === 1) {
      this.shortJumps = (this.shortJumps ?? 0) + 1;
      this.maybeHintDoubleJump();
    } else {
      this.shortJumps = 0;
    }
    this.jumpedFrom = null;
  }

  maybeHintDoubleJump() {
    if (this.shortJumps < 3 || (this.doubleJumpHints ?? 0) >= 2) return;
    this.shortJumps = 0;
    this.doubleJumpHints = (this.doubleJumpHints ?? 0) + 1;
    this.showMessage({
      title: 'KOMMER DU INTE UPP?',
      body: 'Tryck hoppknappen en gång till medan du är i luften — då hoppar du nästan dubbelt så högt.',
      color: '#fde047',
      duration: 4600,
    });
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

  // Ju högre upp på masten du träffar, desto större hoppbonus — precis som
  // flaggstången. Bonusen är bara skoj och rapporteras inte vidare.
  grabMast() {
    if (this.finished || this.paused) return;
    this.finished = true;

    const hit = Phaser.Math.Clamp(this.player.y, MAST_TOP, MAST_BOTTOM);
    const height = 1 - (hit - MAST_TOP) / (MAST_BOTTOM - MAST_TOP);
    const bonus = Math.round((500 + height * 4500) / 100) * 100;

    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    sfx.gear();

    const popup = this.add
      .text(MAST_X + 40, hit, `+${bonus}`, {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#fde047',
      })
      .setOrigin(0, 0.5)
      .setDepth(20);

    this.tweens.add({ targets: popup, y: hit - 60, alpha: 0, duration: 1400 });
    this.showMessage({
      title: `HOPPBONUS +${bonus}`,
      body: 'Bara för skojs skull — den säger inget om er AI-mognad.',
      color: '#fde047',
      duration: 3000,
    });

    this.tweens.add({
      targets: this.player,
      x: this.rocket.x,
      y: this.rocket.y + 10,
      duration: 900,
      delay: 700,
      ease: 'Quad.easeInOut',
      onComplete: () => this.liftOff(bonus),
    });

    // Webbläsarens egen timer, inte spelklockan: byter någon flik mitt i
    // lyftet fryser tweenarna, men slutskärmen måste fram ändå — det är
    // där leadet fångas. showEnd() kan bara köras en gång.
    setTimeout(() => showEnd(bonus), 7000);
  }

  clearedMast() {
    if (this.finished) return;
    this.finished = true;
    const bonus = 6000;

    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    sfx.gear();
    this.starfield();

    this.showMessage({
      title: 'ÖVER HELA MASTEN!',
      body: `Det där gör nästan ingen. Hoppbonus +${bonus} — och du slipper klättra.`,
      color: '#fde047',
      duration: 4000,
    });

    this.tweens.add({
      targets: this.player,
      x: this.rocket.x,
      y: this.rocket.y + 10,
      duration: 900,
      delay: 900,
      ease: 'Quad.easeInOut',
      onComplete: () => this.liftOff(bonus),
    });
    setTimeout(() => showEnd(bonus), 7200);
  }

  // Blinkande stjärnhimmel som belöning.
  starfield() {
    for (let i = 0; i < 70; i += 1) {
      const star = this.add
        .rectangle(Math.random() * 960, Math.random() * 430, 3, 3, 0xffffff)
        .setScrollFactor(0)
        .setDepth(18)
        .setAlpha(0);

      this.tweens.add({
        targets: star,
        alpha: 1,
        scale: 1.8,
        duration: 260 + Math.random() * 500,
        delay: Math.random() * 900,
        yoyo: true,
        repeat: 6,
      });
    }
  }

  liftOff(bonus) {
    this.player.setDepth(1);
    this.cameras.main.shake(2600, 0.004);
    sfx.rocket();

    const flame = this.add.image(this.rocket.x, this.rocket.y + 60, 'gear-thrust').setScale(1.6);
    this.tweens.add({
      targets: [this.rocket, this.player, flame],
      y: '-=760',
      duration: 3600,
      ease: 'Quad.easeIn',
      onComplete: () => showEnd(bonus),
    });
    this.tweens.add({
      targets: flame,
      scaleX: 2.2,
      scaleY: 2.6,
      yoyo: true,
      repeat: 18,
      duration: 90,
    });
  }
}
