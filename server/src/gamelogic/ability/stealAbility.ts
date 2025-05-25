import { Ability, AbilityName } from ".";
import { GameState } from "../gameState";

export class StealAbility implements Ability {
    gameState: GameState;
    abilityName: AbilityName = "StealAbility";
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    public use(): void;
    public use(ownerId: string, getterId: string, abilityIndex: number): void;

    // Actual implementation
    public use(
        ownerId?: string,
        getterId?: string,
        abilityIndex?: number
    ): void {
        if (getterId && abilityIndex && ownerId) {
            this.gameState.stealAbility(ownerId, getterId, abilityIndex);
        } else {
            // Optional: throw error or no-op
            throw new Error("Missing parameters for StealAbility.use()");
        }
    }

    public serialize() {
        return {
            abilityName: this.abilityName,
        };
    }
}
