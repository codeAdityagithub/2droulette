import { Ability } from ".";
import { GameState } from "../gameState";

export class ReverseBulletPolarity implements Ability {
    gameState: GameState;
    abilityName: String;
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
