import { SocketType } from "../types";
import { Ability, AbilityName } from "./ability";
import { GameState } from "./gameState";
import { v4 as uuidv4 } from "uuid";
import { Serializable } from "./utils/serializable";
import { StealAbility } from "./ability/stealAbility";
import generateAbilities from "./utils/getRandomAbilities";

export class Player implements Serializable {
    private lives: number;
    private id: string;
    private name: String;
    private abilities: Ability[];
    private gameState: GameState;
    public socket: SocketType;
    private position: number;
    public isAlive = true;

    constructor(
        gameState: GameState,
        socket: any,
        position: number,
        name: string
    ) {
        this.gameState = gameState;
        this.abilities = generateAbilities(gameState);
        this.socket = socket;
        this.id = uuidv4();
        this.position = position;
        this.name = name;
        this.lives = 2;
    }
    public getId() {
        return this.id;
    }
    public getName() {
        return this.name;
    }
    public getPosition() {
        return this.position;
    }
    public resetAbilities() {
        this.abilities = generateAbilities(this.gameState);
    }
    // socket.io
    public shoot(playerId: string) {
        if (!this.isAlive) return;
        try {
            this.gameState.shootPlayer(playerId);
        } catch (err) {
            return;
        }
    }
    public getShot(bullet: number) {
        this.lives -= bullet;
        console.log("getting shot", this.name, "bullet", bullet);
        if (this.lives <= 0) {
            this.isAlive = false;
        }
        return this.lives;
    }

    public getAbility(abilityIndex: number) {
        if (abilityIndex >= this.abilities.length) return null;
        return this.abilities[abilityIndex];
    }
    public addAbility(ability: Ability) {
        this.abilities.push(ability);
    }
    public useAbility(
        abilityIndex: number,
        playerId?: string,
        stealIndex?: number
    ) {
        if (!this.isAlive) return;
        if (abilityIndex >= this.abilities.length) return;
        const ability = this.abilities[abilityIndex];
        // if our ability is steal then its different
        if (
            ability instanceof StealAbility &&
            playerId != undefined &&
            stealIndex != undefined
        ) {
            if (!playerId) return;

            ability.use(playerId, this.id, stealIndex);
        } else {
            ability.use();
        }
        this.abilities = this.abilities.filter((_, i) => i !== abilityIndex);
    }

    public removeAbility(abilityIndex: number) {
        if (abilityIndex >= this.abilities.length) return;

        this.abilities = this.abilities.filter((_, i) => i !== abilityIndex);
    }
    public serialize() {
        return {
            playerId: this.id,
            playerName: this.name,
            livesLeft: this.lives,
            abilities: this.abilities.map((a) => a.serialize()),
            position: this.position,
            isAlive: this.isAlive,
        };
    }
}
