export class GameOver extends Phaser.Scene {
    spacebar: Phaser.Input.Keyboard.Key;

    constructor() {
        super('gameOver');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(this.game.renderer.width / 2, 120, 'GAME OVER', {
            fontFamily: 'EquipmentPro',
            fontSize: '24px',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.add.text(this.game.renderer.width / 2, 140, '(PRESS SPACEBAR TO RETURN TO MENU)', {
            fontFamily: 'EquipmentPro',
            fontSize: '16px',
            // strokeThickness: 1
        }).setOrigin(0.5);

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cameras.main.fadeIn(600);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.sound.stopAll();
            this.sound.play('menuSelect');
            this.cameras.main.fadeOut(600);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.stop('game-ui');
                this.scene.stop('arena');
                this.scene.stop('main');
                this.scene.start('menu');
            }, this);
        }
    }
}