import { LEVEL_CONFIG, MENU_ITEMS } from "../../config";
import { PlayerData } from "../../types";

export class Menu extends Phaser.Scene {
	music: Phaser.Sound.BaseSound;
	options: Phaser.GameObjects.Group;
	cursor: Phaser.GameObjects.Container;
	currentIndex: number = 0;
	keys: {
		up?: Phaser.Input.Keyboard.Key,
		down?: Phaser.Input.Keyboard.Key,
		space?: Phaser.Input.Keyboard.Key,
		enter?: Phaser.Input.Keyboard.Key
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
		this.options = this.add.group(menuItems, {
			classType: Phaser.GameObjects.Text
		});
		const option = this.options.getChildren()[this.currentIndex] as Phaser.GameObjects.Text;
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
			const option = this.options.getChildren()[this.currentIndex] as Phaser.GameObjects.Text;
			this.cursor.setPosition(option.x, option.y);
			const cursorLeft = this.cursor.getAt(0) as Phaser.GameObjects.Sprite;
			const cursorRight = this.cursor.getAt(1) as Phaser.GameObjects.Sprite;
			cursorLeft.setX(-(option.width / 2 + 24));
			cursorRight.setX(option.width / 2 + 24);
		}
	}

	/* 
	 *	Execute menu options
	 */

	private start() {
		/* 
		*	TODO: Add character select screen to determine what character data to use
		*/
		const PLAYER_DATA = this.cache.json.get('characterData') as PlayerData[];
		this.cameras.main.fadeOut(600);
		this.cameras.main.once('camerafadeoutcomplete', () => {
			this.scene.start('main', {
				level: LEVEL_CONFIG[0],
				player: PLAYER_DATA[0]
			});
		}, this);
	}

	/* 
	*	TODO: Add controls screen
	*/
	private controls() {  }

	private credits() {
		this.scene.start('credits');
	}
}