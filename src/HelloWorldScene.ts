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
  }

  create() {
	
    const grass = this.add.image(960, 500, "grass");
    const { width, height } = this.scale;
    grass.setScale(width / grass.width, height / grass.height);

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

    emitterChar.startFollow(this.character);

    this.achilles = this.physics.add.sprite(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), "achilles");
    this.achilles.setCollideWorldBounds(true);
    this.achilles.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    this.achilles.setScale(0.2);

    this.input.keyboard.on("keydown", (key: any) => {
      if (key.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        this.spawnFireball();
		this.achilles.setVelocityY(-5000);
      }
    });

    const cursors = this.input.keyboard.createCursorKeys();

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

	this.input.keyboard.on("keydown", () => {
		if (!this.isAchillesMoving) {
		  this.isAchillesMoving = true;
		  this.achilles.setVelocity(-100, -100); // Start Achilles movement after a key press
		}
	  });

	
  }

  update() {
    if (this.isAchillesMoving) {
		const speed = 100;
  
		// Move achilles towards the character
		this.physics.moveToObject(this.achilles, this.character, speed);
  
		// Keep achilles inside the screen bounds
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

  spawnFireball() {
    const distance = 10; // Distance in front of the character
    const fireballX = this.character.x + Math.cos(this.character.rotation) * distance;
    const fireballY = this.character.y + Math.sin(this.character.rotation) * distance;

    this.fireball = this.physics.add.sprite(fireballX, fireballY, "fireball");
    this.fireball.setRotation(this.character.rotation);

    const speed = 2000;
    this.fireball.setVelocity(Math.cos(this.character.rotation) * speed, Math.sin(this.character.rotation) * speed);

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
