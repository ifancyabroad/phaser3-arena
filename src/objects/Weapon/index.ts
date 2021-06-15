import { GameObjects, Physics, Scene } from "phaser";
import { Arena } from "../../scenes";
import { WeaponData } from "../../types";
import { Enemy } from "../Enemy";

enum WeaponState {
    Default,
    Equipped,
    Activated,
    Dropped,
}

export class Weapon extends Phaser.GameObjects.Sprite {
    readonly scene: Arena;
    readonly collider: Physics.Arcade.Collider;
    flipped: boolean = false;

    constructor(scene: Scene, x: number, y: number, sprite: string, frame: string, data: WeaponData) {
        super(scene, x, y, sprite, frame);

        this.scene = scene as Arena;
        this.scene.add
            .existing(this)
            .setDepth(4)
            .setOrigin(0.5, 1.2);
        this.scene.physics.world.enable(this);
        this.collider = this.scene.physics.world.addOverlap(this, this.scene.player, this.setEquipped, null, this);

        /*
         *  Set to Default state
         *  Set weapon name and stats
         */
        this.setState(WeaponState.Default);
        this.setName(data.name);
        this.setData({
            damage: data.stats.damage,
            knockback: data.stats.knockback,
            sprite: data.sprite,
            size: data.size
        });
    }

    update() {
        this.stateManager();
    }

    private setSprite() {
        const mouse = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.BetweenPoints(this.parentContainer, mouse); // Facing pointer
        const spriteAngle = (Phaser.Math.RAD_TO_DEG * angle) + 90 + (this.flipped ? 120 : angle - 120);
        this.setAngle(spriteAngle);
        const vx = Math.cos(angle) * 10;
        const vy = Math.sin(angle) * 10;
        if ('setOffset' in this.body) {
            this.body.setOffset(vx - 10, vy + 8);
        }
    }

    private overlapCheck() {
        if (!this.scene.physics.overlap(this, this.scene.player)) {
            this.setState(WeaponState.Default);
        }
    }

    private stateManager() {
        switch (this.state) {
            case WeaponState.Default:
                break;
            case WeaponState.Equipped:
                this.setSprite();
                break;
            case WeaponState.Activated:
                // this.setSprite();
                break;
            case WeaponState.Dropped:
                this.overlapCheck();
                break;
        }
    }

    public setEquipped() {
        if (this.state === WeaponState.Default &&
            (!this.scene.player.weapon || this.scene.player.weapon.state === WeaponState.Equipped)) {
            this.setState(1)
                .setPosition(0, this.scene.player.height / 2);
            if ('setCircle' in this.body) {
                this.body.setCircle(this.getData('size').width, -10, 8);
            }
            this.scene.physics.world.removeCollider(this.collider);
            this.scene.player.equip(this);
        }
    }

    public setUnequipped() {
        this.scene.sound.play('weapon-drop');
        this.setState(WeaponState.Dropped)
            .setAngle()
            .setDepth(4);
        if (this.scene.player.body instanceof Phaser.Physics.Arcade.Body) {
            this.setPosition(this.scene.player.body.x + this.width / 2, this.scene.player.body.y + this.height / 2);
        }
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize();
            this.body.preUpdate(true, 0)
        }
        this.scene.physics.world.colliders.add(this.collider);
        this.scene.add.existing(this);
    }

    public attack() {
        if (this.state === WeaponState.Equipped) {

            /*
             *  Set weapon state to Activated
             *  Play sound effect
             *  Set collision detection
             *  Play weapon tween
             */
            this.setState(WeaponState.Activated);
            this.scene.sound.play('weapon-swing');
            this.scene.physics.overlap(this, this.scene.enemies, this.hit, null, this.scene.player);
            this.scene.add.tween({
                targets: this,
                angle: this.angle + (this.flipped ? -240 : 240),
                duration: 100,
                completeDelay: 200,
                onComplete() {
                    this.flipped = !this.flipped;
                    this.setSprite();
                    this.setState(WeaponState.Equipped);
                },
                callbackScope: this
            });
        }
    }

    private hit(object1: GameObjects.GameObject, object2: GameObjects.GameObject) {
        const enemy = object2 as Enemy;
        enemy.takeHit();
    }
}