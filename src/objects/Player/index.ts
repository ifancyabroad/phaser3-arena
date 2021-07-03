import { sceneEvents } from "../../events/EventsCentre";
import { Animation, PlayerData } from "../../types";
import { Entity } from "../Entity";
import { Weapon } from "../Weapon";

enum PlayerState {
	Default,
	Stunned,
	Dead,
}

export class Player extends Entity {
	readonly pointer: Phaser.Input.Pointer;
	readonly controls: {
		up?: Phaser.Input.Keyboard.Key,
		down?: Phaser.Input.Keyboard.Key,
		left?: Phaser.Input.Keyboard.Key,
		right?: Phaser.Input.Keyboard.Key,
		attack?: Phaser.Input.Keyboard.Key,
	};
	weapon?: Weapon;

	constructor(scene: Phaser.Scene, x: number, y: number, children: Phaser.GameObjects.GameObject[], data: PlayerData) {
		super(scene, x, y, children, data);

		if ('setOffset' in this.body) {
			this.body.setOffset(0, 6);
		}

		this.pointer = scene.input.activePointer;
		this.controls = scene.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
			attack: Phaser.Input.Keyboard.KeyCodes.SPACE
		})

		/*
         *  Set to Default state
         *  Set current data
         */
		this.setState(PlayerState.Default);
		this.setData({
			animations: data.animations,
			score: data.stats.score,
			gold: data.stats.gold,
			lives: data.stats.lives,
			maxLives: data.stats.maxLives,
			speed: data.stats.speed,
			size: data.size,
			weapon: data.weapon
		});
	}

	update() {
		this.aliveCheck();
		this.controlManager();
	}

	private aliveCheck() {
		if (this.data.values.lives <= 0) {
			this.death();
		}
	}

	public updateScore(points: number) {
		this.data.values.score += points;
		sceneEvents.emit('player-score-changed', this.getData('score'));
	}

	public updateGold(gold: number) {
		this.data.values.gold += gold;
		sceneEvents.emit('player-gold-changed', this.getData('gold'));
	}

	private controlManager() {
		if (this.x > this.pointer.x) {
			this.sprite.setFlipX(true);
		} else {
			this.sprite.setFlipX(false);
		}

		if ((Phaser.Input.Keyboard.JustDown(this.controls.attack) || this.pointer.isDown) && this.weapon) {
			this.weapon.attack();
		}

		if (this.body instanceof Phaser.Physics.Arcade.Body) {
			if (this.controls.left.isDown) {
				this.body.setVelocityX(-this.getData('speed'));
			} else if (this.controls.right.isDown) {
				this.body.setVelocityX(this.getData('speed'));
			} else {
				this.body.setVelocityX(0);
			}
			if (this.controls.up.isDown) {
				this.body.setVelocityY(-this.getData('speed'));
			} else if (this.controls.down.isDown) {
				this.body.setVelocityY(this.getData('speed'));
			} else {
				this.body.setVelocityY(0);
			}
		}

		if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
			const animation: Animation = this.getData('animations').find((animation: Animation) => animation.type === "run");
			this.sprite.play(animation.key, true);
		} else {
			const animation: Animation = this.getData('animations').find((animation: Animation) => animation.type === "idle");
			this.sprite.play(animation.key, true);
		}
	}

	public takeHit() {
		if (this.state === PlayerState.Default) {
			this.stunned();
			this.flash();
			this.data.values.lives--;
			sceneEvents.emit('player-health-changed', this.getData('lives'));
		}
	}

	private stunned() {
		this.setState(PlayerState.Stunned);
		this.scene.time.delayedCall(1000, () => {
			this.setState(PlayerState.Default);
		}, null, this);
	}

	private flash() {
		this.sprite.setTintFill(0xff0000);
		this.scene.time.delayedCall(200, () => {
			this.sprite.clearTint();
		}, null, this);
	}

	public equip(weapon: Weapon) {
		if (this.weapon) {
			this.remove(this.weapon);
			this.weapon.setUnequipped();
		}
		this.weapon = weapon;
		this.setData('weapon', this.weapon.name)
		this.add(this.weapon);
	}

	private death() {
		this.setState(PlayerState.Dead);
		this.setActive(false);
		this.scene.scene.setActive(false);
		// this.scene.gameOver();
	}
}