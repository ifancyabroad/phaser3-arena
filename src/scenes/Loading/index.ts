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
			{ type: "idle", key: "floor_spikes", prefix: 'frames/floor_spikes_anim_f', suffix: '.png', start: 0, end: 3, frameRate: 5, repeat: -1 },
			{ type: "idle", key: "chest_open", prefix: 'frames/chest_empty_open_anim_f', suffix: '.png', start: 0, end: 2, frameRate: 5, repeat: 0 }
		], 'dungeon-sprites');
		this.scene.start('menu');
	}

	private loadTextures() {
		this.load.multiatlas([
			{ key: 'dungeon-sprites', atlasURL: 'assets/textures/0x72_DungeonTilesetII_v1.3.json', path: 'assets/textures' },
			{ key: 'npc-sprites', atlasURL: 'assets/textures/knights.json', path: 'assets/textures' }
		])
		this.load.image([
			{ key: 'tiles', url: 'assets/levels/0x72_DungeonTilesetII_v1.3.png' },
			{ key: 'orc-blood', url: 'assets/textures/orc-blood.png' },
			{ key: 'undead-blood', url: 'assets/textures/undead-blood.png' },
			{ key: 'demon-blood', url: 'assets/textures/demon-blood.png' }
		]);
	}

	private loadSounds() {
		this.load.audio([
			{ key: 'coin', url: 'assets/sounds/coin.mp3' },
			{ key: 'weapon-swing', url: 'assets/sounds/weapon-swing.mp3' },
			{ key: 'weapon-drop', url: 'assets/sounds/weapon-drop.mp3' },
			{ key: 'door-open', url: 'assets/sounds/door-open.wav' },
			{ key: 'stairs-open', url: 'assets/sounds/stairs-open.mp3' },
			{ key: 'orc-hit', url: 'assets/sounds/orc-hit.mp3' },
			{ key: 'orc-death', url: 'assets/sounds/orc-death.mp3' },
			{ key: 'undead-hit', url: 'assets/sounds/undead-hit.mp3' },
			{ key: 'undead-death', url: 'assets/sounds/undead-death.mp3' },
			{ key: 'demon-hit', url: 'assets/sounds/demon-hit.mp3' },
			{ key: 'demon-death', url: 'assets/sounds/demon-death.mp3' },
			{ key: 'menuSelect', url: 'assets/sounds/select.mp3' },
			{ key: 'menuMusic', url: 'assets/sounds/POL-random-encounter-short.wav' },
			{ key: 'dungeonMusic', url: 'assets/sounds/POL-fortress-short.wav' },
		]);
	}

	private loadImages() {
		this.load.image([
			{ key: 'caves', url: 'assets/images/background.png' },
			{ key: 'logo', url: 'assets/images/logo.png' }
		]);
	}

	private loadData() {
		this.load.json([
			{ key: 'characterData', url: 'assets/data/characters.json' },
			{ key: 'enemyData', url: 'assets/data/enemies.json' },
			{ key: 'npcData', url: 'assets/data/npcs.json' },
			{ key: 'weaponData', url: 'assets/data/weapons.json' }
		]);
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