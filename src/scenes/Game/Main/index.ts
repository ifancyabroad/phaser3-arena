import { GameData, LevelData, PlayerData } from "../../../types";

export class Main extends Phaser.Scene {
    levelData: LevelData;
    playerData: PlayerData;

    constructor() {
        super('main');
    }

    create(data: GameData) {
        this.levelData = data.level;
        this.playerData = data.player;
        this.gameStart();
    }

    private gameStart() {
        this.scene.launch('transition', {
            level: this.levelData,
            player: this.playerData
        });
    }

    public gameOver() {
        this.scene.setActive(false);
        this.scene.launch('gameOver');
        this.scene.bringToTop('gameOver');
    }
}