import { GameObjects, Scene } from "phaser";
import { Arena } from "../../scenes";
import { EntityData } from "../../types";

export class Entity extends Phaser.GameObjects.Container {
	readonly sprite: GameObjects.Sprite;
	readonly scene: Arena;

	constructor(scene: Scene, x: number, y: number, children: GameObjects.GameObject[], data: EntityData) {
		super(scene, x, y, children);

		this.scene = scene as Arena;
		this.sprite = children[0] as GameObjects.Sprite;

		this.scene.add
			.existing(this)
			.setSize(data.size.width, data.size.height)
			.setDepth(5);
		this.scene.physics.add
			.existing(this)

		const shadow = this.scene.add.ellipse(0, this.sprite.height / 2, data.size.width - 4, 3, 0x111111, 0.8);
		this.add(shadow);
		this.sendToBack(shadow);
	}
}