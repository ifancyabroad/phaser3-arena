export interface GameData {
    level: LevelData;
	player: PlayerData;
}

export interface LevelData {
    key: string;
    name: string;
    music: string;
}

export type AnimationType = "idle" | "run" | "walk" | "hit";

export interface Animation {
    type: AnimationType;
    key: string;
    prefix: string;
    suffix: string;
    start: number;
    end: number;
    frameRate: number;
    repeat: number;
}

export interface EntityData {
    name: string;
    sprite: {
        key: string;
        texture: string;
        frame: string;
    };
    type: string;
    animations: Animation[];
    size: {
        width: number;
        height: number;
    };
}

export interface PlayerData extends EntityData {
    weapon: string;
    stats: {
        score: number;
        gold: number;
        lives: number;
        maxLives: number;
        speed: number;
    };
}

export interface EnemyData extends EntityData {
    value: number;
    stats: {
        health: number;
        speed: number;
    };
}

export interface NPCData extends EntityData {

}

export interface WeaponData extends EntityData {
    stats: {
        damage: 50;
        knockback: 5;
    };
}