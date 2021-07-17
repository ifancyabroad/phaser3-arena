import { LEVEL_CONFIG } from "../../config";
import { sceneEvents } from "../../events/EventsCentre";
import { Button, Coin, Enemy, NPC, Player, Spikes, Weapon } from "../../objects";
import { EnemyData, GameData, LevelData, NPCData, PlayerData, WeaponData } from "../../types";
import { debugDraw } from "../../utils";

enum LevelState {
    Default,
    Active,
    Cleared,
    Complete
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
    buttons: Phaser.GameObjects.Group;
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
        this.createGroups();
        this.generateMap();
        this.generatePlayer();
        this.generateNPCs();
        this.generateWeapons();
        this.generateButtons();
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
        this.stateManager();
    }

    private stateManager() {
        switch (this.state) {
            case LevelState.Active:
                if (!this.enemies.getLength()) {
                    this.waveComplete();
                }
                break;
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

    private createGroups() {
        this.enemies = this.add.group();
        this.npcs = this.add.group();
        this.weapons = this.add.group();
        this.buttons = this.add.group();
        this.items = this.add.group();
        this.spikes = this.add.group();
    }

    private generateMap() {
        this.tileMap = this.make.tilemap({ key: this.levelData.key });
        const tileset = this.tileMap.addTilesetImage('0x72_DungeonTilesetII_v1.3', 'tiles');
        this.layerGround = this.tileMap.createLayer('Below Player', tileset).setDepth(1);
        this.layerWallsBehind = this.tileMap.createLayer('Walls Below', tileset).setDepth(2);
        this.layerWallsInFront = this.tileMap.createLayer('Walls Above', tileset).setDepth(10);
        this.setDoorCallback();
    }

    private generatePlayer() {
        const spawn = this.tileMap.findObject('Player', (object) => object.name === 'Spawn');
        this.player = new Player(this, spawn.x, spawn.y, [], this.playerData);
        this.scene.launch('game-ui', this.playerData);
        this.scene.bringToTop('game-ui');
    }

    private generateNPCs() {
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

    private generateButtons() {
        const buttonLayer = this.tileMap.getObjectLayer('Buttons');
        if (buttonLayer) {
            buttonLayer.objects.forEach(object => {
                const button = new Button(this, object.x, object.y, 'dungeon-sprites', 'frames/chest_empty_open_anim_f0.png');
                this.buttons.add(button);
            });
        }
    }

    private generateItems() {
        const itemLayer = this.tileMap.getObjectLayer('Items');
        if (itemLayer) {
            itemLayer.objects.forEach(object => {
                const coin = new Coin(this, object.x, object.y, 'dungeon-sprites', 'frames/coin_anim_f0.png');
                this.items.add(coin);
            });
        }
    }

    private generateSpikes() {
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
        this.physics.world.addCollider(this.player, this.enemies);
        this.physics.world.addCollider(this.player, this.layerWallsBehind);
        this.physics.world.addCollider(this.player, this.layerWallsInFront);
        // this.physics.world.addCollider(this.enemies);
        this.physics.world.addCollider(this.enemies, this.layerWallsBehind);
        this.physics.world.addCollider(this.enemies, this.layerWallsInFront);
        // this.physics.world.createDebugGraphic();
        // debugDraw(this.layerWallsBehind, this);
        // debugDraw(this.layerWallsInFront, this);
    }

    private setEvents() {
        sceneEvents.on('game-over', this.gameOver, this);
        sceneEvents.on('activate-arena', this.startWave, this);
        sceneEvents.on('deactivate-arena', this.stopWave, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			sceneEvents.off('game-over', this.gameOver, this);
			sceneEvents.off('activate-arena', this.startWave, this);
			sceneEvents.off('deactivate-arena', this.stopWave, this);
		});
    }

    private gameOver() {
        this.scene.setActive(false);
        this.scene.launch('gameOver');
        this.scene.bringToTop('gameOver');
    }

    private startWave() {
        this.state = LevelState.Active;
        const spawn = this.tileMap.findObject('Enemies', (object) => object.name === 'Spawn');
        const data = this.enemyData.find(e => e.name === 'Skeleton');
        const enemy = new Enemy(this, spawn.x, spawn.y, [], data);
        this.enemies.add(enemy);
        this.closeDoors(this.layerWallsBehind);
    }

    private stopWave() {
        console.log('Stopping wave...');
        // this.state = LevelState.Default;
    }

    private waveComplete() {
        this.state = LevelState.Cleared;
        this.time.delayedCall(400, () => {
            /*
            *  Replace door tiles with open door tiles
            *  Set collision on the open door tiles
            */
           this.openDoors(this.layerWallsBehind);
           this.player.updateScore(500);
        }, null, this);
    }

    private setDoorCallback(callback = this.exitLevel) {
        for (const layer of this.tileMap.layers) {
            const door = layer.tilemapLayer.findByIndex(486);
            if (door) {
                door.layer.tilemapLayer.setTileLocationCallback(door.x, door.y, 1, 1, callback, this);
                break;
            }
        }
    }

    private openDoors(layer: Phaser.Tilemaps.TilemapLayer) {
        this.sound.play('door-open');
        layer.replaceByIndex(451, 454);
        layer.replaceByIndex(452, 455);
        layer.replaceByIndex(483, 486);
        layer.replaceByIndex(484, 487);
        this.setDoorCallback();
    }

    private closeDoors(layer: Phaser.Tilemaps.TilemapLayer) {
        this.sound.play('door-open');
        this.setDoorCallback(null);
        layer.replaceByIndex(454, 451);
        layer.replaceByIndex(455, 452);
        layer.replaceByIndex(486, 483);
        layer.replaceByIndex(487, 484);
    }

    private exitLevel() {
        const level = LEVEL_CONFIG.find(({ key }) => key !== this.levelData.key);
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
}