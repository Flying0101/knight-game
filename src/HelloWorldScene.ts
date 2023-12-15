import Phaser from "phaser";

export default class HelloWorldScene extends Phaser.Scene {
  private character!: Phaser.Physics.Arcade.Sprite;
  private fireballEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private fireTrailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private achilles!: Phaser.Physics.Arcade.Sprite;
  private isAchillesMoving: boolean = false;

  constructor() {
    super("hello-world");
  }

  preload() {
    this.load.image("grass", "grass.png");
    this.load.image("character", "knighty.png");
    this.load.image("smoke", "smoke.png");
    this.load.image("fireball", "fireball.png");
    this.load.image("firetrail", "firetrail.png");
    this.load.image("achilles", "achilles.png");

    this.load.audio("backgroundMusic", "soundtrack.mp3");
    this.load.audio("fireSound", "firesound.mp3");
    this.load.audio("sprintSound", "speed.mp3");
  }

  create() {
    let sprintEffect = true;

    const berzerk = this.sound.add("sprintSound", {
      volume: 0.8,
    });
    this.input.keyboard.on("keydown-X", () => {
      if (sprintEffect) {
        berzerk.play();
        sprintEffect = false;
      }
      this.time.delayedCall(2000, () => {
        berzerk.stop();
        sprintEffect = true;
      });
    });

    const enterSound = this.sound.add("fireSound", {
      volume: 0.8,
    });

    this.input.keyboard.on("keydown-SPACE", () => {
      enterSound.play();

      this.time.delayedCall(2000, () => {
        enterSound.stop();
      });
    });
    const backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.5,
    });
    backgroundMusic.play();

    const backgroundImage = this.add.image(0, 0, "grass").setOrigin(0);
    backgroundImage.displayWidth = this.scale.width;
    backgroundImage.displayHeight = this.scale.height;

    this.character = this.physics.add.sprite(100, 100, "character");
    this.character.setCollideWorldBounds(true);
    this.character.setScale(0.2);

    const particlesChar = this.add.particles("smoke");
    const emitterChar = particlesChar.createEmitter({
      speed: { min: -50, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 2000,
      blendMode: "ADD",
    });

    // character particles effect
    emitterChar.startFollow(this.character);
    let sprintParticleSettings = {
      scale: { start: 0.5, end: 0 },
      tint: 0xffffff, // Initial particle color
    };
    const adjustParticleOnSprint = (isSprinting: boolean) => {
      if (isSprinting) {
        sprintParticleSettings = {
          scale: { start: 3, end: 0.5 },
          tint: 0x0080ff, // Change color to fireblue when sprinting
        };

        emitterChar.setSpeed({ min: -100, max: 100 });
        emitterChar.setScale(sprintParticleSettings.scale);
      } else {
        sprintParticleSettings = {
          scale: { start: 0.5, end: 0 },
          tint: 0xffffff, // Return to normal color when not sprinting
        };
      }
    };

    adjustParticleOnSprint(false);

    this.time.addEvent({
      loop: true,
      delay: 100, // Adjust the delay as needed
      callback: () => {
        emitterChar.setTint(sprintParticleSettings.tint);
        emitterChar.setScale(sprintParticleSettings.scale);
      },
      callbackScope: this,
    });

    this.achilles = this.physics.add.sprite(
      Phaser.Math.Between(0, this.scale.width),
      Phaser.Math.Between(0, this.scale.height),
      "achilles"
    );
    this.achilles.setCollideWorldBounds(true);
    this.achilles.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );
    this.achilles.setScale(0.2);

    //fireball statements
    let isFireballLeft = false;
    let isFireballRight = false;

    //fireball trigger
    this.input.keyboard.on("keydown", (key: any) => {
      if (key.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        this.achilles.setVelocityY(-5000);

        if (isFireballLeft) {
          this.spawnFireball(-1);
        } else if (isFireballRight) {
          this.spawnFireball(1);
        }
      }
    });

    const cursors = this.input.keyboard.createCursorKeys();

    // character movement
    this.input.keyboard.on("keydown", (key: any) => {
      const speed = 200;

      if (key.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
        this.character.setVelocityX(-speed);
      } else if (key.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
        this.character.setVelocityX(speed);
      } else if (key.keyCode === Phaser.Input.Keyboard.KeyCodes.UP) {
        this.character.setVelocityY(-speed);
      } else if (key.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) {
        this.character.setVelocityY(speed);
      }
    });

    this.input.keyboard.on("keyup", () => {
      this.character.setVelocity(0);
    });

    // activation of enemy movement
    this.input.keyboard.on("keydown", () => {
      if (!this.isAchillesMoving) {
        this.isAchillesMoving = true;
        this.achilles.setVelocity(-100, -100);
      }
    });

    // x speed mechanic
    let isSprintingLeft = false;
    let isSprintingRight = false;

    const sprintSpeed = 400; // Speed for sprinting
    const normalSpeed = 200; // Normal speed

    const setCharacterVelocity = (directionX: number) => {
      const sprintVelocityX = directionX * sprintSpeed;
      const sprintVelocityY = this.character.body.velocity.y; // Maintain current Y velocity

      this.character.setVelocity(sprintVelocityX, sprintVelocityY);

      // After 1 second, revert to normal speed
      this.time.delayedCall(1000, () => {
        const normalVelocityX = directionX * normalSpeed;

        this.character.setVelocity(normalVelocityX, sprintVelocityY);
      });
    };

    // sprint mechanic
    this.input.keyboard.on("keydown-LEFT", () => {
      isSprintingLeft = true;
      isFireballLeft = true;

      if (isSprintingRight) {
        isSprintingRight = false;
        setCharacterVelocity(-1);
      }
      if (isFireballRight) {
        isFireballRight = false;
      }
    });

    this.input.keyboard.on("keyup-LEFT", () => {
      isSprintingLeft = false;
      this.character.setVelocityX(0); // Stop the character if not sprinting in any direction
    });

    this.input.keyboard.on("keydown-RIGHT", () => {
      isSprintingRight = true;
      isFireballRight = true;
      if (isSprintingLeft) {
        isSprintingLeft = false;
        setCharacterVelocity(1);
      }
      if (isFireballLeft) {
        isFireballLeft = false;
      }
    });

    this.input.keyboard.on("keyup-RIGHT", () => {
      isSprintingRight = false;
      this.character.setVelocityX(0); // Stop the character if not sprinting in any direction
    });

    this.input.keyboard.on("keydown-X", () => {
      adjustParticleOnSprint(true);
      if (isSprintingLeft) {
        setCharacterVelocity(-1);
      } else if (isSprintingRight) {
        setCharacterVelocity(1);
      }
    });

    this.input.keyboard.on("keyup-X", () => {
      adjustParticleOnSprint(false);
    });
  } // end of create

  // enemy mechanic
  update() {
    if (this.isAchillesMoving) {
      const speed = 100;

      this.physics.moveToObject(this.achilles, this.character, speed);

      if (this.achilles.x <= 0) {
        this.achilles.setVelocityX(speed);
      } else if (this.achilles.x >= this.scale.width) {
        this.achilles.setVelocityX(-speed);
      }

      if (this.achilles.y <= 0) {
        this.achilles.setVelocityY(speed);
      } else if (this.achilles.y >= this.scale.height) {
        this.achilles.setVelocityY(-speed);
      }
    }
  }

  spawnFireball(directionBallX: number) {
    const speed = 2000;

    const fireballX = this.character.x;
    const fireballY = this.character.y;

    this.fireball = this.physics.add.sprite(fireballX, fireballY, "fireball");
    this.fireball.setRotation(this.character.rotation);

    const fireballVelocityX = directionBallX * speed;
    const fireballVelocityY = this.character.body.velocity.y;

    this.fireball.setVelocity(fireballVelocityX, fireballVelocityY);

    const fireTrailParticles = this.add.particles("firetrail");
    this.fireballEmitter = fireTrailParticles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: "ADD",
    });

    this.fireballEmitter.startFollow(this.fireball);

    this.time.addEvent({
      delay: 500,
      callback: () => {
        fireTrailParticles.destroy();
      },
      callbackScope: this,
    });
  }
}
