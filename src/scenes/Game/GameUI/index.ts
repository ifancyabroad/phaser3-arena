import { sceneEvents } from "../../../events/EventsCentre";
import { PlayerData } from "../../../types";

export class GameUI extends Phaser.Scene {
    private hearts: Phaser.GameObjects.Group;
    private score: Phaser.GameObjects.Text;
    private gold: Phaser.GameObjects.Text;

    constructor() {
        super('game-ui');
    }

    create(data: PlayerData) {
        this.setHearts(data.stats.lives, data.stats.maxLives);
        this.setScore(data.stats.score);
        this.setGold(data.stats.gold);

        sceneEvents.on('player-health-changed', this.updateHearts, this);
        sceneEvents.on('player-score-changed', this.updateScore, this);
        sceneEvents.on('player-gold-changed', this.updateGold, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			sceneEvents.off('player-health-changed', this.updateHearts, this);
			sceneEvents.off('player-score-changed', this.updateScore, this);
			sceneEvents.off('player-gold-changed', this.updateGold, this);
		})
    }

    private setHearts(lives: number, maxLives: number) {
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        });
        this.hearts.createMultiple({
            key: 'dungeon-sprites',
            frame: 'frames/ui_heart_full.png',
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            },
            quantity: maxLives / 2
        });
        this.updateHearts(lives);
    }

    private updateHearts(lives: number) {
        const currentHearts = lives / 2;
        this.hearts.children.each((go, idx) => {
            const heart = go as Phaser.GameObjects.Image;
            const heartNumber = idx + 1;
            if (currentHearts >= heartNumber) {
                heart.setTexture('dungeon-sprites', 'frames/ui_heart_full.png');
            } else if (heartNumber - currentHearts === 0.5) {
                heart.setTexture('dungeon-sprites', 'frames/ui_heart_half.png');
            } else {
                heart.setTexture('dungeon-sprites', 'frames/ui_heart_empty.png');
            }
        })
    }

    private setScore(score: number) {
        let x = this.game.renderer.width - 5;
        let y = 10;
        this.score = this.add.text(x, y, `Score: ${score}`, {
            fontFamily: 'EquipmentPro',
            fontSize: '18px'
        }).setOrigin(1, 0.5);
    }

    private updateScore(score: number) {
        this.score.setText(`Score: ${score}`);
    }

    private setGold(gold: number) {
        let x = 80;
        let y = 10;
        const goldIcon = this.add.image(x, y, 'dungeon-sprites', 'frames/coin_anim_f0.png').setScale(1.5);
        this.gold = this.add.text(goldIcon.x + goldIcon.width + 2, y, gold.toString(), {
            fontFamily: 'EquipmentPro',
            fontSize: '18px'
        }).setOrigin(0, 0.5);
    }

    private updateGold(gold: number) {
        this.gold.setText(gold.toString());
    }
}