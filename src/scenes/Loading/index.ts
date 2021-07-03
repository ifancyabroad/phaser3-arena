import { Animation, EnemyData, PlayerData } from "../../types";

export class Loading extends Phaser.Scene {

	constructor() {
		super('loadGame');
	}

	preload() {
		this.loadTextures();
		this.loadSounds();
		this.loadImages();
		this.loadData();
		this.loadMaps();
		this.setDisplay();
	}

	create() {
		this.cache.json.get('characterData').forEach((character: PlayerData) => {
			this.generateAnimations(character.animations, character.sprite.texture);
		});
		this.cache.json.get('enemyData').forEach((enemy: EnemyData) => {
			this.generateAnimations(enemy.animations, enemy.sprite.texture);
		});
		this.cache.json.get('npcData').forEach((npc: EnemyData) => {
			this.generateAnimations(npc.animations, npc.sprite.texture);
		});
		this.generateAnimations([
			{ type: "idle", key: "coin", prefix: 'frames/coin_anim_f', suffix: '.png', start: 0, end: 3, frameRate: 10, repeat: -1 },
			{ type: "idle", key: "floor_spikes", prefix: 'frames/floor_spikes_anim_f', suffix: '.png', start: 0, end: 3, frameRate: 5, repeat: -1 }
		], 'dungeon-sprites');
		this.scene.start('menu');
	}

	private loadTextures() {
		this.load.atlas('dungeon-sprites', 'assets/textures/0x72_DungeonTilesetII_v1.3.png', 'assets/textures/0x72_DungeonTilesetII_v1.3.json');
		this.load.atlas('npc-sprites', 'assets/textures/knights.png', 'assets/textures/knights.json');
		this.load.image('tiles', 'assets/levels/0x72_DungeonTilesetII_v1.3.png');
		this.load.image('orc-blood', 'assets/textures/orc-blood.png');
		this.load.image('undead-blood', 'assets/textures/undead-blood.png');
		this.load.image('demon-blood', 'assets/textures/demon-blood.png');
	}

	private loadSounds() {
		this.load.audio('coin', 'assets/sounds/coin.mp3');
		this.load.audio('weapon-swing', 'assets/sounds/weapon-swing.mp3');
		this.load.audio('weapon-drop', 'assets/sounds/weapon-drop.mp3');
		this.load.audio('door-open', 'assets/sounds/door-open.wav');
		this.load.audio('stairs-open', 'assets/sounds/stairs-open.mp3');
		this.load.audio('orc-hit', 'assets/sounds/orc-hit.mp3');
		this.load.audio('orc-death', 'assets/sounds/orc-death.mp3');
		this.load.audio('undead-hit', 'assets/sounds/undead-hit.mp3');
		this.load.audio('undead-death', 'assets/sounds/undead-death.mp3');
		this.load.audio('demon-hit', 'assets/sounds/demon-hit.mp3');
		this.load.audio('demon-death', 'assets/sounds/demon-death.mp3');
		this.load.audio('menuSelect', 'assets/sounds/select.mp3');
		this.load.audio('menuMusic', 'assets/sounds/POL-random-encounter-short.wav');
		this.load.audio('dungeonMusic', 'assets/sounds/POL-fortress-short.wav');
	}

	private loadImages() {
		this.load.image('caves', 'assets/images/background.png');
		this.load.image('logo', 'assets/images/logo.png');
	}

	private loadData() {
		this.load.json('characterData', 'assets/data/characters.json');
		this.load.json('enemyData', 'assets/data/enemies.json');
		this.load.json('npcData', 'assets/data/npcs.json');
		this.load.json('weaponData', 'assets/data/weapons.json');
	}

	private loadMaps() {
		this.load.tilemapTiledJSON([
			{ key: "arena", url: "assets/levels/arena.json" },
			{ key: "shop", url: "assets/levels/shop.json" },
		])
	}

	private setDisplay() {
		const loadingBar = this.add.graphics({
			fillStyle: {
				color: 0xffffff
			}
		});
		this.load.on('progress', (percent) => {
			loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
		})
		this.add.text(40, 100, 'Loading...', { fontFamily: 'EquipmentPro' });
	}

	private generateAnimations(
		animations: Animation[],
		atlas: string,
	) {
		animations.forEach(({ key, prefix, suffix, start, end, frameRate, repeat }) => {
			this.anims.create({
				key,
				frames: this.anims.generateFrameNames(atlas, {
					start,
					end,
					prefix,
					suffix,
				}),
				frameRate,
				repeat
			});
		});
	}
}