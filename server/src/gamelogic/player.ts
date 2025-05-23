import { SocketType } from "../types";
import { Ability, AbilityName } from "./ability";
import { GameState } from "./gameState";
import { v4 as uuidv4 } from "uuid";
import { Serializable } from "./utils/serializable";

export class Player implements Serializable {
    private lives: number;
    private id: string;
    private name: String;
    private abilities: Map<string, Ability>;
    private gameState: GameState;
    private socket: SocketType;

    constructor(gameState: GameState, socket: any) {
        this.gameState = gameState;
        this.abilities = new Map();
        this.socket = socket;
        this.id = uuidv4();
    }
    public getId() {
        return this.id;
    }
    // socket.io
    public shoot(playerId: string) {
        try {
            this.gameState.shootPlayer(playerId);
        } catch (err) {
            return;
        }
    }
    public getShot(bullet: number) {
        this.lives -= bullet;
        return this.lives;
    }
    public useAbility(abilityName: AbilityName) {
        if (this.abilities.has(abilityName)) {
            this.abilities.get(abilityName)!.use();
        }
    }
    public hasAbility(abilityName: AbilityName): boolean {
        return this.abilities.has(abilityName);
    }
    public removeAbility(abilityName: string) {
        this.abilities.delete(abilityName);
    }
    public serialize() {
        const abilities: any[] = [];
        for (const [_, ability] of this.abilities) {
            abilities.push(ability.serialize());
        }

        return {
            playerId: this.id,
            playerName: this.name,
            livesLeft: this.lives,
            abilities: abilities,
        };
    }
}
