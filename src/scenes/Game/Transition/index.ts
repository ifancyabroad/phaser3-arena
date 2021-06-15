import { GameData } from "../../../types";

export class Transition extends Phaser.Scene {

    constructor() {
      super('transition');
    }
  
    create(data: GameData) {
      const levelData = data.level;
      const playerData = data.player;
  
      this.add.text(this.game.renderer.width / 2, this.game.renderer.height / 2, levelData.name, {
        fontFamily: 'EquipmentPro',
        fontSize: '24px'
      }).setOrigin(0.5);
  
      this.cameras.main.fadeIn(600);
      this.time.delayedCall(1000, () => {
        this.cameras.main.fadeOut(600);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('arena', {
            level: levelData,
            player: playerData
          });
        }, this);
      });
    }
  }