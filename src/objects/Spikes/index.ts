import { Game } from "../../scenes";

export class Spikes extends Phaser.Physics.Arcade.Sprite {
	readonly scene: Game;
	readonly collider: Phaser.Physics.Arcade.Collider;

	constructor(scene: Phaser.Scene, x: number, y: number, sprite: string, frame: string) {
		super(scene, x, y, sprite, frame);

		this.scene = scene as Game;
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