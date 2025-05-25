import { Ability, AbilityName } from ".";
import { GameState } from "../gameState";

export class DoubleBullet implements Ability {
    gameState: GameState;
    abilityName: AbilityName = "DoubleBullet";
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
