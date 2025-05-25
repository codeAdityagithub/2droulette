import { Ability } from "../ability";
import { DoubleBullet } from "../ability/DoubleBullet";
import { EjectBullet } from "../ability/ejectBullet";
import { SkipTurnAbility } from "../ability/skipTurn";
import { ReverseBulletPolarity } from "../ability/reversePolarity";
import { StealAbility } from "../ability/stealAbility";
import { GameState } from "../gameState";

// Helper to randomly choose from the list
function getRandomAbility(gameState: GameState): Ability {
    const abilities = [
        ReverseBulletPolarity,
        DoubleBullet,
        EjectBullet,
        SkipTurnAbility,
        StealAbility,
    ];
    const RandomAbilityClass =
        abilities[Math.floor(Math.random() * abilities.length)];
    return new RandomAbilityClass(gameState);
}

// Main function to export
export default function generateAbilities(gameState: GameState): Ability[] {
    const abilityCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 abilities
    const selectedAbilities: Ability[] = [];

    for (let i = 0; i < abilityCount; i++) {
        selectedAbilities.push(getRandomAbility(gameState));
    }

    return selectedAbilities;
}
