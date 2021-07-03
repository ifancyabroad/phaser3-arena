import { Animation, NPCData } from "../../types";
import { Entity } from "../Entity";

export class NPC extends Entity {

	constructor(scene: Phaser.Scene, x: number, y: number, children: Phaser.GameObjects.GameObject[], data: NPCData) {
		super(scene, x, y, children, data);

		if (this.body instanceof Phaser.Physics.Arcade.Body) {
			this.body.setOffset(0, 6);
			this.body.immovable = true;
		}

		const animation: Animation = this.getData('animations').find((animation: Animation) => animation.type === "idle")
		this.sprite.play(animation.key, true);
	}

	update() { }
}