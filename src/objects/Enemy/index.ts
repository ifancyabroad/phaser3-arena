import { GameObjects, Scene } from "phaser";
import { Animation, AnimationType, EnemyData } from "../../types";
import { Entity } from "../Entity";

enum EnemyState {
	Default,
	Attacking,
	Stunned,
	Dead,
}

export class Enemy extends Entity {
	readonly particles: GameObjects.Particles.ParticleEmitterManager;
	readonly emitter: GameObjects.Particles.ParticleEmitter;

	constructor(scene: Scene, x: number, y: number, children: GameObjects.GameObject[], data: EnemyData) {
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
         *  Set enemy data
         */
		this.setState(EnemyState.Default);
		this.setData({
			type: data.type,
			animations: data.animations,
			value: data.value,
			health: data.stats.health,
			maxHealth: data.stats.health,
			speed: data.stats.speed,
			size: data.size,
			sprite: data.sprite
		});
	}

	update() {
		if (this.state !== EnemyState.Stunned) {
			this.setSprite();
			this.collisionCheck();
		}
		this.stateManager();
		this.aliveCheck();
	}

	private isAlive = () => this.data.values.health > 0;

	private aliveCheck() {
		if (!this.isAlive()) {
			this.death();
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

	private stateManager() {
		switch (this.state) {
			case EnemyState.Default:
				this.findPlayer();
				break;

			case EnemyState.Attacking:
				this.attackPlayer();
				break;
		}
	}

	private findPlayer() {
		if ('moves' in this.body) {
			this.body.moves = true;
		}
		this.scene.physics.moveToObject(this, this.scene.player, this.getData('speed'));
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
		this.knockback(this.scene.player.weapon.getData('knockback'));
		this.data.values.health -= this.scene.player.weapon.getData('damage');
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
		this.setState(EnemyState.Dead);
		this.emitter.emitParticleAt(this.x, this.y);
		this.destroy();
	}
}