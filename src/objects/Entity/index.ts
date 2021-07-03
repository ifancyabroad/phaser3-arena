import { Arena } from "../../scenes";
import { EntityData } from "../../types";

export class Entity extends Phaser.GameObjects.Container {
	readonly sprite: Phaser.GameObjects.Sprite;
	readonly scene: Arena;

	constructor(scene: Phaser.Scene, x: number, y: number, children: Phaser.GameObjects.GameObject[], data: EntityData) {
		super(scene, x, y, children);

		this.scene = scene as Arena;

		this.sprite = scene.add.sprite(0, 0, data.sprite.texture, data.sprite.frame);
		this.add(this.sprite);

		this.scene.add
			.existing(this)
			.setSize(data.size.width, data.size.height)
			.setDepth(5);
		this.scene.physics.add
			.existing(this)

		const shadow = this.scene.add.ellipse(0, this.sprite.height / 2, data.size.width - 4, 3, 0x111111, 0.8);
		this.add(shadow);
		this.sendToBack(shadow);

		this.setData(data);
	}
}