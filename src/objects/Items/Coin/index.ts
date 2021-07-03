import { Arena } from "../../../scenes";

export class Coin extends Phaser.Physics.Arcade.Sprite {
	readonly scene: Arena;
	readonly collider: Phaser.Physics.Arcade.Collider;

	constructor(scene: Phaser.Scene, x: number, y: number, sprite: string, frame: string) {
		super(scene, x, y, sprite, frame);

		this.scene = scene as Arena;
		this.scene.add
			.existing(this)
			.setDepth(4);
		this.scene.physics.world.enable(this);
		this.collider = this.scene.physics.world.addOverlap(this, this.scene.player, this.collect, null, this);

		this.play('coin');
	}

	update() { }

	private collect() {
		this.scene.sound.play('coin', { volume: 0.3 });
		this.disableBody(true, true);
		this.scene.player.updateGold(1);
	}
}