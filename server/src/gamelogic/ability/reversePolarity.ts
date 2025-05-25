import { Ability, AbilityName } from ".";
import { GameState } from "../gameState";

export class ReverseBulletPolarity implements Ability {
    gameState: GameState;
    abilityName: AbilityName = "ReversePolarity";
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use() {
        this.gameState.reverseBulletPolarity();
    }
    public serialize() {
        return {
            abilityName: this.abilityName,
        };
    }
}
