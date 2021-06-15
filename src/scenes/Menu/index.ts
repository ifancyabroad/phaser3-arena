import { GameObjects, Input, Sound } from "phaser";
import { LEVEL_DATA, MENU_ITEMS, PLAYER_DATA } from "../../config";

export class Menu extends Phaser.Scene {
	music: Sound.BaseSound;
	options: GameObjects.Group;
	cursor: GameObjects.Container;
	currentIndex: number = 0;
	keys: {
		up?: Input.Keyboard.Key,
		down?: Input.Keyboard.Key,
		space?: Input.Keyboard.Key,
		enter?: Input.Keyboard.Key
	};

	constructor() {
		super('menu');
	}

	create() {
		this.setMusic();
		this.setDisplay();
		this.setMenu();
		this.setControls();
	}

	update() {
		if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
			this.navigateMenu(-1);
		}
		if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
			this.navigateMenu(1);
		}
		if (Phaser.Input.Keyboard.JustDown(this.keys.space) ||
			Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
			this.sound.play('menuSelect');
			switch (this.currentIndex) {
				case 0:
					this.start();
					break;
				case 1:
					this.controls();
					break;
				case 2:
					this.credits();
					break;
				default:
					break;
			}
		}
	}

	private setMusic() {
		this.music = this.sound.get('menuMusic');
		if (!this.music) {
			this.music = this.sound.add('menuMusic');
		}
		if (!this.music.isPlaying) {
			this.sound.stopAll();
			this.music.play({
				loop: true,
				volume: 0.1
			});
		}
	}

	private setDisplay() {
		this.add.image(0, 0, 'caves')
			.setScale(0.5)
			.setOrigin(0, 0)
			.setDepth(0);
		const logo = this.add.image(this.game.renderer.width / 2, 80, 'logo')
			.setScale(0.6);
		this.tweens.add({
			targets: logo,
			scale: 0.55,
			ease: 'Linear',
			duration: 1000,
			yoyo: true,
			repeat: -1
		});
	}

	private setMenu() {
		const menuItems = MENU_ITEMS.map((text, index) =>
		this.add.text(this.game.renderer.width / 2, 160 + index * 30, text, {
			fontFamily: 'EquipmentPro',
			fontSize: '20px',
			color: '#ddd',
			stroke: '#000',
			strokeThickness: 4
		}).setOrigin(0.5));
		this.options = this.add.group(menuItems);
		const option = this.options.getChildren()[this.currentIndex] as GameObjects.Text;
		this.cursor = this.add.container(option.x, option.y, [
			this.add.sprite(-(option.width / 2 + 24), 0, 'dungeon-sprites', 'frames/weapon_spear.png').setAngle(90),
			this.add.sprite(option.width / 2 + 24, 0, 'dungeon-sprites', 'frames/weapon_spear.png').setAngle(270)
		]);
	}

	private setControls() {
		this.keys = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.UP,
			down: Phaser.Input.Keyboard.KeyCodes.DOWN,
			space: Phaser.Input.Keyboard.KeyCodes.SPACE,
			enter: Phaser.Input.Keyboard.KeyCodes.ENTER
		});
	}

	private navigateMenu(index: number) {
		if (this.currentIndex + index >= 0 &&
			this.currentIndex + index < this.options.getLength()) {
			this.currentIndex += index;
			const option = this.options.getChildren()[this.currentIndex] as GameObjects.Text;
			this.cursor.setPosition(option.x, option.y);
			const cursorLeft = this.cursor.getAt(0) as GameObjects.Sprite;
			const cursorRight = this.cursor.getAt(1) as GameObjects.Sprite;
			cursorLeft.setX(-(option.width / 2 + 24));
			cursorRight.setX(option.width / 2 + 24);
		}
	}

	/* 
	 *	Execute menu options
	 */

	private start() {
		this.cameras.main.fadeOut(600);
		this.cameras.main.once('camerafadeoutcomplete', () => {
			this.scene.start('main', {
				level: LEVEL_DATA[0],
				player: PLAYER_DATA
			});
		}, this);
	}

	private controls() {  }

	private credits() {
		this.scene.start('credits');
	}
}