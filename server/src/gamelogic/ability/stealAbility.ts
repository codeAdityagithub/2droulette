import { Ability, AbilityName } from ".";
import { GameState } from "../gameState";

export class StealAbility implements Ability {
    gameState: GameState;
    abilityName: String;
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use(): void;
    public use(playerId: string, abilityName: AbilityName): void;

    // Actual implementation
    public use(playerId?: string, abilityName?: AbilityName): void {
        if (playerId && abilityName) {
            this.gameState.stealAbility(playerId, abilityName);
        } else {
            // Optional: throw error or no-op
            throw new Error("Missing parameters for StealAbility.use()");
        }
    }

    public serialize(): string {
        return JSON.stringify({
            abilityName: this.abilityName,
        });
    }
}
