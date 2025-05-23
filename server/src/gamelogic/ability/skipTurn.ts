import { Ability } from ".";
import { GameState } from "../gameState";

export class SkipTurnAbility implements Ability {
    gameState: GameState;
    abilityName: String;
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use() {
        this.gameState.skipTurn();
    }
    public serialize() {
        return {
            abilityName: this.abilityName,
        };
    }
}
