import { Ability } from ".";
import { GameState } from "../gameState";

export class DoubleBullet implements Ability {
    gameState: GameState;
    abilityName: String;
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use() {
        this.gameState.doubleBullet();
    }
    public serialize() {
        return {
            abilityName: this.abilityName,
        };
    }
}
