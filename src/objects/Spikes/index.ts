import { Physics, Scene } from "phaser";
import { Arena } from "../../scenes";

export class Spikes extends Phaser.Physics.Arcade.Sprite {
	readonly scene: Arena;
	readonly collider: Physics.Arcade.Collider;

	constructor(scene: Scene, x: number, y: number, sprite: string, frame: string) {
		super(scene, x, y, sprite, frame);

		this.scene = scene as Arena;
		this.scene.add
			.existing(this)
			.setDepth(1);
		this.scene.physics.world.enable(this);
		this.collider = this.scene.physics.world.addOverlap(this, this.scene.player, this.hitPlayer, null, this);

		this.body
			.setSize(14, 14)
			.setOffset(1, 1)

		this.play('floor_spikes');
	}

	private hitPlayer() {
		this.scene.player.takeHit();
	}
}