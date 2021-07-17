import { Game } from "../../scenes";
import { EntityData } from "../../types";

export class Entity extends Phaser.GameObjects.Container {
	readonly sprite: Phaser.GameObjects.Sprite;
	readonly scene: Game;
	readonly rangeBox: Phaser.GameObjects.Rectangle;
	readonly shadow: Phaser.GameObjects.Ellipse;

	constructor(scene: Phaser.Scene, x: number, y: number, children: Phaser.GameObjects.GameObject[], data: EntityData) {
		super(scene, x, y, children);

		this.scene = scene as Game;

		this.sprite = scene.add.sprite(0, 0, data.sprite.texture, data.sprite.frame);
		this.add(this.sprite);

		this.scene.add
			.existing(this)
			.setSize(data.size.width, data.size.height)
			.setDepth(5);
		this.scene.physics.add
			.existing(this)

		this.rangeBox = this.createRangeBox(data.size.width + 1, data.size.height + 1);
		this.shadow = this.createShadow(this.sprite.height / 2, data.size.width - 4);

		this.setData(Phaser.Utils.Objects.DeepCopy(data));
	}

	private createRangeBox(width: number, height: number) {
		const rangeBox = this.scene.add.rectangle(0, 0, width, height);
		this.add(rangeBox);
		this.scene.physics.add.existing(rangeBox);
		if ('debugBodyColor' in rangeBox.body) {
			rangeBox.body.debugBodyColor = 0xadfefe;
		}
		return rangeBox;
	}

	private createShadow(width: number, y: number) {
		const shadow = this.scene.add.ellipse(0, this.sprite.height / 2, width - 4, 3, 0x111111, 0.8);
		this.add(shadow);
		this.sendToBack(shadow);
		return shadow;
	}
}