import { AnimationType, LevelData, PlayerData } from "./types";

export const MENU_ITEMS = [
	'Start',
	'Controls',
	'Credits'
];

export const PLAYER_DATA: PlayerData = {
    name: 'knight',
    sprite: 'knight_m',
    type: 'player',
    animations: [
        { type: "run", key: 'knight_m_run', prefix: 'knight_m_run_anim_f', start: 0, end: 3, frameRate: 10, repeat: -1 },
        { type: "idle", key: 'knight_m_idle', prefix: 'knight_m_idle_anim_f', start: 0, end: 3, frameRate: 10, repeat: -1 },
        { type: "hit", key: 'knight_m_hit', prefix: 'knight_m_hit_anim_f', start: 0, end: 0, frameRate: 1, repeat: -1 }
    ],
    score: 0,
    gold: 0,
    lives: 6,
    maxLives: 6,
    speed: 100,
    weapon: 'Sword',
    size: { width: 16, height: 16 }
};

export const LEVEL_DATA: LevelData[] = [
    {
        key: 'dungeon-1-1',
        name: 'The Arena',
        music: 'dungeonMusic'
    }
];