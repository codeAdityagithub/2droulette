import { AbilityName } from "./ability";
import { Player } from "./player";
import getRandomBullets from "./utils/getRandomBullets";
import { Serializable } from "./utils/serializable";
import { v4 as uuidv4 } from "uuid";

export class GameState implements Serializable {
    private gameId: string;
    private gameRound: number;
    private bullets: number[]; // 0-1 array
    private currentBulletIndex: number;
    private allPlayerIdArr: string[];
    private currentActivePlayerIndex: number;
    private currentActivePlayerId: string;
    private allPlayers: Map<string, Player>;
    private isStarted = false;
    private isSkipActive = false;
    private socket: any;

    constructor(socket: any) {
        this.gameId = uuidv4();
        this.gameRound = 1;
        this.bullets = getRandomBullets();
        this.currentBulletIndex = 0;
        this.allPlayers = new Map<string, Player>();
        this.currentActivePlayerId = "";
        this.socket = socket;
    }
    public getGameId() {
        return this.gameId;
    }
    public getCurrentGameRound() {
        return this.gameRound;
    }
    public getCurrentPlayerId() {
        return this.currentActivePlayerId;
    }
    public startMatch() {
        if (this.allPlayers.size < 2) {
            throw new Error("Not enough players");
        }
        this.isStarted = true;
    }
    public resetRound() {
        this.gameRound++;
        this.bullets = getRandomBullets();
        this.currentBulletIndex = 0;
    }
    public rotateTable() {
        const inc = this.isSkipActive ? 2 : 1;
        this.currentActivePlayerIndex =
            (this.currentActivePlayerIndex + inc) % this.allPlayerIdArr.length;
        this.currentActivePlayerId = this.allPlayers
            .get(this.allPlayerIdArr[this.currentActivePlayerIndex])!
            .getId();
    }
    public serialize(): string {
        const allPlayersArray: string[] = [];
        for (const [_, player] of this.allPlayers) {
            allPlayersArray.push(player.serialize());
        }
        return JSON.stringify({
            gameRound: this.gameRound,
            currentPlayerId: this.currentActivePlayerId,
            allPlayers: allPlayersArray,
        });
    }
    public checkGameOver(): boolean {
        if (this.allPlayers.size === 1) return true;
        return false;
    }
    public isRoundActive(): boolean {
        return this.bullets[this.currentBulletIndex] === 1;
    }

    public nextBullet() {
        this.currentBulletIndex++;
        if (this.currentBulletIndex === this.bullets.length) {
            this.resetRound();
        }
    }

    public shootPlayer(playerId: string) {
        const isActive = this.isRoundActive();
        if (isActive) {
            const lives = this.allPlayers
                .get(playerId)
                ?.getShot(this.bullets[this.currentBulletIndex]);
            if (lives === undefined) {
                // no player shot
                throw new Error("No player with that id");
            }
            if (lives === 0) {
                this.removePlayer(playerId);
                this.nextBullet();
            }
        } else {
            this.nextBullet();
        }
        this.rotateTable();
    }

    public removePlayer(playerId: string) {
        this.allPlayers.delete(playerId);
        this.allPlayerIdArr = this.allPlayerIdArr.filter(
            (id) => id !== playerId
        );
    }
    public addPlayer(player: Player) {
        this.allPlayerIdArr.push(player.getId());
        if (this.currentActivePlayerId === "") {
            this.currentActivePlayerId = player.getId();
        }
        this.allPlayers.set(player.getId(), player);
    }
    // abilities logic

    public skipTurn() {
        // 2x rotate
        this.isSkipActive = true;
    }
    public ejectBullet() {
        this.nextBullet();
    }
    public reverseBulletPolarity() {
        if (this.isRoundActive()) {
            this.bullets[this.currentBulletIndex] = 0;
        } else this.bullets[this.currentBulletIndex] = 1;
    }
    public doubleBullet() {
        this.bullets[this.currentBulletIndex] *= 2;
    }
    public stealAbility(playerId: string, abilityName: AbilityName) {
        const player = this.allPlayers.get(playerId);
        if (!player) {
            throw new Error("No player with this id");
        }
        if (!player.hasAbility(abilityName)) {
            throw new Error("Does not have that ability");
        }
        player.removeAbility(abilityName);
    }
}
