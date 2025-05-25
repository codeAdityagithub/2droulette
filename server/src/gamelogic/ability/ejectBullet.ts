import { Ability, AbilityName } from ".";
import { GameState } from "../gameState";

export class EjectBullet implements Ability {
    gameState: GameState;
    abilityName: AbilityName = "EjectBullet";
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use() {
        this.gameState.ejectBullet();
    }
    public serialize() {
        return {
            abilityName: this.abilityName,
        };
    }
}
