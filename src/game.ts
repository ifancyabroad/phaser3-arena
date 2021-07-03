import 'phaser';
import { Game, GameOver, GameUI, Loading, Menu, Transition } from './scenes';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    scene: [Loading, Menu, Transition, Game, GameUI, GameOver],
    scale: {
        parent: 'game-container',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 300,
    },
    physics: {
        default: 'arcade'
    },
    pixelArt: true

};

const game = new Phaser.Game(config);
