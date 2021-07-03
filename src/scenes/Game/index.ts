import { LEVEL_CONFIG } from "../../config";
import { sceneEvents } from "../../events/EventsCentre";
import { Coin, Enemy, NPC, Player, Spikes, Weapon } from "../../objects";
import { EnemyData, GameData, LevelData, NPCData, PlayerData, WeaponData } from "../../types";
import { debugDraw } from "../../utils";

enum LevelState {
    Default,
    Cleared,
    Active
}

export class Game extends Phaser.Scene {
    state: LevelState;
    levelData: LevelData;
    playerData: PlayerData;
    enemyData: EnemyData[];
    npcData: NPCData[];
    weaponData: WeaponData[];
    player: Player;
    enemies: Phaser.GameObjects.Group;
    npcs: Phaser.GameObjects.Group;
    weapons: Phaser.GameObjects.Group;
    items: Phaser.GameObjects.Group;
    spikes: Phaser.GameObjects.Group;
    music: Phaser.Sound.BaseSound;
    tileMap: Phaser.Tilemaps.Tilemap;
    layerGround: Phaser.Tilemaps.TilemapLayer;
    layerWallsBehind: Phaser.Tilemaps.TilemapLayer;
    layerWallsInFront: Phaser.Tilemaps.TilemapLayer;

    constructor() {
        super('game');
    }

    create(data: GameData) {
        this.levelData = data.level;
        this.playerData = data.player;
        this.enemyData = this.cache.json.get('enemyData');
        this.npcData = this.cache.json.get('npcData');
        this.weaponData = this.cache.json.get('weaponData');

        /*
         *  Set to Default state
         */
		this.state = LevelState.Default;

        this.startMusic();
        this.generateMap();
        this.generatePlayer();
        this.generateNPCs();
        this.generateEnemies();
        this.generateWeapons();
        this.generateItems();
        this.generateSpikes();
        this.setCollision();
        this.setEvents();

        this.cameras.main.fadeIn(600);
    }

    update() {
        this.player.update();
        this.enemies.getChildren().forEach(enemy => enemy.update());
        this.weapons.getChildren().forEach(weapon => weapon.update());
        if (this.state === LevelState.Default && !this.enemies.getLength()) {
            this.roomComplete();
        }
    }

    private startMusic() {
        this.music = this.sound.get(this.levelData.music);
        if (!this.music) {
            this.music = this.sound.add(this.levelData.music);
        }
        if (!this.music.isPlaying) {
            this.sound.stopAll();
            this.music.play({
                loop: true,
                volume: 0.1
            });
        }
    }

    private generateMap() {
        this.tileMap = this.make.tilemap({ key: this.levelData.key });
        const tileset = this.tileMap.addTilesetImage('0x72_DungeonTilesetII_v1.3', 'tiles');
        this.layerGround = this.tileMap.createLayer('Below Player', tileset).setDepth(1);
        this.layerWallsBehind = this.tileMap.createLayer('Walls Below', tileset).setDepth(2);
        this.layerWallsInFront = this.tileMap.createLayer('Walls Above', tileset).setDepth(10);
    }

    private generatePlayer() {
        const spawn = this.tileMap.findObject('Player', (object) => object.name === 'Spawn');
        this.player = new Player(
            this,
            spawn.x,
            spawn.y,
            [],
            this.playerData
        );

        this.scene.launch('game-ui', this.playerData);
        this.scene.bringToTop('game-ui');
    }

    private generateEnemies() {
        this.enemies = this.add.group({
            classType: Enemy
        });
        const enemyLayer = this.tileMap.getObjectLayer('Enemies');
        if (enemyLayer) {
            enemyLayer.objects.forEach(object => {
                const data = this.enemyData.find(e => e.name === object.name);
                const enemy = new Enemy(this, object.x, object.y, [], data);
                this.enemies.add(enemy);
            });
        }
    }

    private generateNPCs() {
        this.npcs = this.add.group();
        const npcLayer = this.tileMap.getObjectLayer('NPC');
        if (npcLayer) {
            npcLayer.objects.forEach(object => {
                const data = this.npcData.find(npc => npc.name === object.name)
                const npc = new NPC(this, object.x, object.y, [], data);
                this.npcs.add(npc);
            });
        }
    }

    private generateWeapons() {
        this.weapons = this.add.group();

        /*
         *  Get currently equipped weapon from player data
         *  Equip weapon to the player
         */
        const weapon = this.player.getData('weapon');
        if (weapon) {
            const data = this.weaponData.find(w => w.name === weapon)
            const playerWeapon = new Weapon(this, this.player.x, this.player.y, data.sprite.texture, data.sprite.frame, data);
            this.weapons.add(playerWeapon);
            playerWeapon.setEquipped();
        }

        const weaponLayer = this.tileMap.getObjectLayer('Weapons');
        if (weaponLayer) {
            weaponLayer.objects.forEach(object => {
                const data = this.weaponData.find(w => w.name === object.name)
                const weapon = new Weapon(this, object.x, object.y, data.sprite.texture, data.sprite.frame, data);
                this.weapons.add(weapon);
            });
        }
    }

    private generateItems() {
        this.items = this.add.group();
        const itemLayer = this.tileMap.getObjectLayer('Items');
        if (itemLayer) {
            itemLayer.objects.forEach(object => {
                const coin = new Coin(this, object.x, object.y, 'dungeon-sprites', 'frames/coin_anim_f0.png');
                this.items.add(coin);
            });
        }
    }

    private generateSpikes() {
        this.spikes = this.add.group();

        /*
         *  Find spiked tiles from ground layer
         *  Add an interactable spike sprite
         *  Remove the old spike tile
         */
        this.layerGround.forEachTile(tile => {
            if (tile.index === 357) {
                const x = tile.getCenterX();
                const y = tile.getCenterY();
                const spikes = new Spikes(this, x, y, 'dungeon-sprites', 'frames/floor_spikes_anim_f0.png')
                this.spikes.add(spikes);
                this.layerGround.removeTileAt(tile.x, tile.y);
            }
        });
    }

    private setCollision() {
        this.layerWallsBehind.setCollisionByProperty({ collides: true });
        this.layerWallsInFront.setCollisionByProperty({ collides: true });
        this.physics.world.addCollider(this.player, this.npcs);
        this.physics.world.addCollider(this.player, this.layerWallsBehind);
        this.physics.world.addCollider(this.player, this.layerWallsInFront);
        // this.physics.world.addCollider(this.enemies);
        this.physics.world.addCollider(this.enemies, this.layerWallsBehind);
        this.physics.world.addCollider(this.enemies, this.layerWallsInFront);
        this.physics.world.createDebugGraphic();
        debugDraw(this.layerWallsBehind, this);
        debugDraw(this.layerWallsInFront, this);
    }

    private setEvents() {
        sceneEvents.on('game-over', this.gameOver, this);
    }

    private roomComplete() {
        this.state = LevelState.Cleared;
        this.time.delayedCall(400, () => {
            this.openDoors();
        }, null, this);
    }

    private openDoors() {
        this.sound.play('door-open');

        /*
         *  Replace door tiles with open door tiles
         *  Set collision on the open door tiles
         */
        this.layerWallsBehind.replaceByIndex(451, 454);
        this.layerWallsBehind.replaceByIndex(452, 455);
        this.layerWallsBehind.replaceByIndex(483, 486);
        this.layerWallsBehind.replaceByIndex(484, 487);
        this.layerWallsBehind.setCollision([486, 487], false);

        const doorLayer = this.levelData.key === 'arena' ? this.layerWallsBehind : this.layerWallsInFront;
        const door = doorLayer.findByIndex(486);
        doorLayer.setTileLocationCallback(door.x, door.y, 1, 1, this.exitLevel, this);
        this.player.updateScore(500);
    }

    private exitLevel() {
        const level = LEVEL_CONFIG.find(({key}) => key !== this.levelData.key);
        this.scene.restart({
            level,
            player: this.player.data.getAll()
        });
        // this.cameras.main.fadeOut(600);
        // this.cameras.main.once('camerafadeoutcomplete', () => {
        //     this.scene.start('transition', {
        //         level,
        //         player: this.player.data.getAll()
        //     });
        // }, this);
    }

    private gameOver() {
        this.scene.setActive(false);
        this.scene.launch('gameOver');
        this.scene.bringToTop('gameOver');
    }
}