import { Ability } from ".";
import { GameState } from "../gameState";

export class EjectBullet implements Ability {
    gameState: GameState;
    abilityName: String;
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use() {
        this.gameState.ejectBullet();
    }
    public serialize(): string {
        return JSON.stringify({
            abilityName: this.abilityName,
        });
    }
}
