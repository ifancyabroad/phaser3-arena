import { sceneEvents } from "../../events/EventsCentre";
import { Game } from "../../scenes";

enum ButtonState {
	Active,
	Inactive
}

export class Button extends Phaser.Physics.Arcade.Sprite {
	readonly scene: Game;

	constructor(scene: Phaser.Scene, x: number, y: number, sprite: string, frame: string) {
		super(scene, x, y, sprite, frame);
		console.log(scene);

		this.scene = scene as Game;
		this.scene.add
			.existing(this)
			.setDepth(1);
		this.scene.physics.world.enable(this);
		this.scene.physics.world.addCollider(this, this.scene.player);
		this.scene.physics.world.addCollider(this, this.scene.enemies);

		this.body.setSize(14, 14);

		if ('setImmovable' in this.body) {
			this.body.setImmovable(true);
		}

		this.setState(ButtonState.Inactive);

		sceneEvents.on('player-activate', this.toggle, this);

		this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			sceneEvents.off('player-activate', this.toggle, this);
		});
	}

	private toggle() {
		console.log(this);
		if (this.scene.physics.overlap(this, this.scene.player.rangeBox)) {
			switch (this.state) {
				case ButtonState.Inactive:
					this.play('chest_open');
					this.setState(ButtonState.Active);
					sceneEvents.emit('activate-arena');
					break;
				case ButtonState.Active:
					this.playReverse('chest_open');
					this.setState(ButtonState.Inactive);
					sceneEvents.emit('deactivate-arena');
					break;
			}
		}
	}
}