import { Scene, Tilemaps } from "phaser";

export const debugDraw = (layer: Tilemaps.TilemapLayer, scene: Scene) => {
    const debugGraphics = scene.add.graphics().setAlpha(0.75).setDepth(99);
    layer.renderDebug(debugGraphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
}