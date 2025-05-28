export type PlayerType = {
    playerId: string;
    playerName: string;
    livesLeft: number;
    abilities: AbilityType[];
    position: number;
};

export type AbilityName =
    | "DoubleBullet"
    | "SkipTurn"
    | "ReversePolarity"
    | "StealAbility"
    | "EjectBullet";

export type AbilityType = {
    abilityName: AbilityName;
};

export type GameState = {
    gameRound: number;
    currentPlayerId: string;
    allPlayers: PlayerType[];
    isGameOver: boolean;
    winnerId: string | null;
};
