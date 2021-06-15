import { GameObjects, Sound, Tilemaps } from "phaser";
import { Coin, Enemy, NPC, Player, Spikes, Weapon } from "../../../objects";
import { EnemyData, GameData, LevelData, NPCData, PlayerData, WeaponData } from "../../../types";

export class Arena extends Phaser.Scene {
    levelData: LevelData;
    playerData: PlayerData;
    enemyData: EnemyData[];
    npcData: NPCData[];
    weaponData: WeaponData[];
    cleared: boolean = false;
    player: Player;
    enemies: GameObjects.Group;
    npcs: GameObjects.Group;
    weapons: GameObjects.Group;
    items: GameObjects.Group;
    spikes: GameObjects.Group;
    music: Sound.BaseSound;
    tileMap: Tilemaps.Tilemap;
    layerGround: Tilemaps.TilemapLayer;
    layerWallsBehind: Tilemaps.TilemapLayer;
    layerWallsInFront: Tilemaps.TilemapLayer;

    constructor() {
        super('arena');
    }

    create(data: GameData) {
        this.levelData = data.level;
        this.playerData = data.player;
        this.enemyData = this.cache.json.get('enemyData');
        this.npcData = this.cache.json.get('npcData');
        this.weaponData = this.cache.json.get('weaponData');

        this.startMusic();
        this.generateMap();
        this.generateNPCs();
        this.generateEnemies();
        this.generatePlayer();
        this.generateWeapons();
        this.generateItems();
        this.generateSpikes();
        this.setCollision();

        this.cameras.main.fadeIn(600);
    }

    update() {
        this.player.update();
        this.enemies.getChildren().forEach(enemy => enemy.update());
        this.weapons.getChildren().forEach(weapon => weapon.update());
        if (!this.cleared && !this.enemies.getLength()) {
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
        this.tileMap = this.make.tilemap({ key: this.levelData.key});
        const tileset = this.tileMap.addTilesetImage('0x72_DungeonTilesetII_v1.3', 'tiles');
        this.layerGround = this.tileMap.createLayer('Below Player', tileset).setDepth(1);
        this.layerWallsBehind = this.tileMap.createLayer('Walls Below', tileset).setDepth(2);
        this.layerWallsInFront = this.tileMap.createLayer('Walls Above', tileset).setDepth(10);
    }

    private generatePlayer() {
        const hero = this.add.sprite(0, 0, 'dungeon-sprites', `frames/${this.playerData.sprite}_idle_anim_f0.png`);
        const spawn = this.tileMap.findObject('Player', (object) => object.name === 'Spawn');
        this.player = new Player(
            this,
            spawn.x,
            spawn.y,
            [hero],
            this.playerData
        );

        // Launch HUD
        // this.scene.launch('hud', { room: this, player: this.player });
        // this.scene.bringToTop('hud');
    }

    private generateEnemies() {
        this.enemies = this.add.group();
        const enemyLayer = this.tileMap.getObjectLayer('Enemies');
        if (enemyLayer) {
            enemyLayer.objects.forEach(object => {
                const data = this.enemyData.find(e => e.name === object.name);
                const sprite = this.add.sprite(0, 0, 'dungeon-sprites', `frames/${data.sprite}_idle_anim_f0.png`);
                const enemy = new Enemy(this, object.x, object.y, [sprite], data);
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
                const sprite = this.add.sprite(0, 0, 'npc-sprites', `frames/${data.sprite}_Idle_1.png`);
                const npc = new NPC(this, object.x, object.y, [sprite], data);
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
            const playerWeapon = new Weapon(this, this.player.x, this.player.y, 'dungeon-sprites', `frames/weapon_${data.sprite}.png`, data);
            this.weapons.add(playerWeapon);
            playerWeapon.setEquipped();
        }

        const weaponLayer = this.tileMap.getObjectLayer('Weapons');
        if (weaponLayer) {
            weaponLayer.objects.forEach(object => {
                const data = this.weaponData.find(w => w.name === object.name)
                const weapon = new Weapon(this, object.x, object.y, 'dungeon-sprites', `frames/weapon_${data.sprite}.png`, data);
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
        this.physics.world.addCollider(this.player, this.layerWallsBehind);
        this.physics.world.addCollider(this.player, this.layerWallsInFront);
        // this.physics.world.addCollider(this.enemies);
        this.physics.world.addCollider(this.enemies, this.layerWallsBehind);
        this.physics.world.addCollider(this.enemies, this.layerWallsInFront);
        // this.physics.world.createDebugGraphic();
    }

    private roomComplete() {
        this.cleared = true;
        this.time.delayedCall(400, () => {
            this.openStairs();
        }, null, this);
    }

    private openDoors() {
        this.sound.play('door-open');
        this.layerWallsBehind.replaceByIndex(451, 454);
        this.layerWallsBehind.replaceByIndex(452, 455);
        this.layerWallsBehind.replaceByIndex(483, 486);
        this.layerWallsBehind.replaceByIndex(484, 487);

        // Remove collision on door base
        // this.layerWallsBehind.setCollision([486, 487], false);

        // Set collision callback for door top
        // const door = this.layerWallsBehind.findByIndex(454);
        // this.layerWallsBehind.setTileLocationCallback(door.x, door.y, 1, 1, this.nextRoom, this);
    }

    private openStairs() {
        this.sound.play('stairs-open');

        /*
         *  Find the hidden object
         *  Replace object with stairs down tile
         *  Set collision on the stairs down
         */
        const hiddenLayer = this.tileMap.getObjectLayer('Hidden');
        const exit = hiddenLayer.objects.find(object => object.name === 'Exit');
        this.layerGround.removeTileAtWorldXY(exit.x, exit.y);
        this.layerGround.putTileAtWorldXY(358, exit.x, exit.y);
        const stairs = this.layerGround.findByIndex(358);
        this.layerGround.setTileLocationCallback(stairs.x, stairs.y, 1, 1, this.nextRoom, this);
        this.player.updateScore(500);
    }

    private nextRoom() {
        this.scene.restart({
            level: this.levelData,
            player: this.player.data.getAll()
        });
    }

    // private nextFloor() {
    //     const stairs = this.layerGround.findByIndex(358);
    //     stairs.setCollisionCallback(null);

    //     this.cameras.main.fadeOut(600);
    //     this.cameras.main.once('camerafadeoutcomplete', () => {
    //         this.scene.start('transition', {
    //             floor: this.mainScene.dungeon.getFloor(this.floorId + 1),
    //             room: this.mainScene.dungeon.getRoom(this.floorId + 1, 1),
    //             player: this.player.data.getAll()
    //         });
    //     }, this);
    // }
}