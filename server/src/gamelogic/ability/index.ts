import { GameState } from "../gameState";

import { Serializable } from "../utils/serializable";

export type AbilityName =
    | "DoubleBullet"
    | "SkipTurn"
    | "ReversePolarity"
    | "StealAbility"
    | "EjectBullet";

export interface Ability extends Serializable {
    gameState: GameState; // constructor injection
    abilityName: AbilityName;
    use(): void;
    use(ownerId: string, playerId: string, abilityName: AbilityName): void;
    serialize(): any;
}
