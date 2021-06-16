import 'phaser';
import { Arena, Loading, Main, Menu, Transition } from './scenes';
import { GameOver } from './scenes/Game/GameOver';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    scene: [Loading, Menu, Main, Transition, Arena, GameOver],
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
