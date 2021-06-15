import 'phaser';
import { Arena, Loading, Main, Menu, Transition } from './scenes';
import { GameOver } from './scenes/Game/GameOver';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    width: 800,
    height: 600,
    scene: [Loading, Menu, Main, Transition, Arena, GameOver],
    physics: {
        default: 'arcade'
    }
};

const game = new Phaser.Game(config);
