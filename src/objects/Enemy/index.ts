import { Animation, EnemyData } from "../../types";
import { Entity } from "../Entity";

enum EnemyState {
	Default,
	Attacking,
	Stunned,
	Dead,
}

export class Enemy extends Entity {
	readonly particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
	readonly emitter: Phaser.GameObjects.Particles.ParticleEmitter;

	constructor(scene: Phaser.Scene, x: number, y: number, children: Phaser.GameObjects.GameObject[], data: EnemyData) {
		super(scene, x, y, children, data);

		if (this.body instanceof Phaser.Physics.Arcade.Body) {
			this.body
				.setDrag(50, 50)
				.setBounce(0.5, 0.5);
		}

		this.particles = this.scene.add.particles(`${data.type}-blood`).setDepth(5);
		this.emitter = this.particles.createEmitter({
			angle: { min: 180, max: 360 },
			speed: { min: 15, max: 30 },
			quantity: { min: 10, max: 30 },
			lifespan: 600,
			scale: { start: 0.3, end: 0.1 },
			gravityY: 50,
			on: false
		});

		/*
         *  Set to Default state
         *  Set additional enemy data
         */
		this.setState(EnemyState.Default);
		this.setData({
			maxHealth: data.stats.health,
		});
	}

	update() {
		this.aliveCheck();
		this.stateManager();
	}

	private stateManager() {
		switch (this.state) {
			case EnemyState.Default:
				this.setSprite();
				this.collisionCheck();
				this.findPlayer();
				break;
			case EnemyState.Stunned:
				break;
			case EnemyState.Attacking:
				this.setSprite();
				this.collisionCheck();
				this.attackPlayer();
				break;
			case EnemyState.Dead:
				this.death();
				break;
		}
	}

	private aliveCheck() {
		if (this.data.values.stats.health <= 0) {
			this.setState(EnemyState.Dead);
		}
	}

	private setSprite() {
		if (this.body.velocity.x > 0) {
			this.sprite.setFlipX(false);
		} else if (this.body.velocity.x < 0) {
			this.sprite.setFlipX(true);
		}

		if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
			const animation: Animation = this.getData('animations').find((animation: Animation) => animation.type === "run");
			this.sprite.play(animation.key, true);
		} else {
			const animation: Animation = this.getData('animations').find((animation: Animation) => animation.type === "idle");
			this.sprite.play(animation.key, true);
		}
	}

	private collisionCheck() {
		if (this.scene.physics.collide(this, this.scene.player)) {
			this.setState(EnemyState.Attacking);
		} else {
			this.setState(EnemyState.Default);
		}
	}

	private findPlayer() {
		if ('moves' in this.body) {
			this.body.moves = true;
		}
		this.scene.physics.moveToObject(this, this.scene.player, this.data.values.stats.speed);
	}

	private attackPlayer() {
		if ('moves' in this.body) {
			this.body.moves = false;
		}
		this.scene.player.takeHit();
	}

	public takeHit() {
		this.scene.sound.play(`${this.getData('type')}-hit`);
		this.stunned();
		this.flash();
		this.knockback(this.scene.player.weapon.data.values.stats.knockback);
		this.data.values.stats.health -= this.scene.player.weapon.data.values.stats.damage;
	}

	private stunned() {
		this.setState(EnemyState.Stunned);
		this.scene.time.delayedCall(1000, () => {
			this.setState(EnemyState.Default);
		}, null, this);
	}

	private flash() {
		this.sprite.setTintFill();
		this.scene.time.delayedCall(200, () => {
			this.sprite.clearTint();
		}, null, this);
	}

	private knockback(force: number) {
		if (this.body instanceof Phaser.Physics.Arcade.Body && this.scene.player.body instanceof Phaser.Physics.Arcade.Body) {
			const x = this.body.x - this.scene.player.body.x;
			const y = this.body.y - this.scene.player.body.y;
			this.body.velocity.x += x * force;
			this.body.velocity.y += y * force;
		}
	}

	private death() {
		this.scene.sound.play(`${this.getData('type')}-death`);
		this.scene.player.updateScore(this.getData('value'));
		this.emitter.emitParticleAt(this.x, this.y);
		this.destroy();
	}
}