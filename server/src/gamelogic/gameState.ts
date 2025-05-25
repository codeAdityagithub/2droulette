import { AbilityName } from "./ability";
import { Player } from "./player";
import getRandomBullets from "./utils/getRandomBullets";
import { Serializable } from "./utils/serializable";
import { v4 as uuidv4 } from "uuid";
import type { IOType, SocketType } from "../types";

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
    private io: IOType;

    constructor(io: IOType) {
        this.gameId = uuidv4();
        this.gameRound = 1;
        this.bullets = getRandomBullets();
        this.currentBulletIndex = 0;
        this.allPlayers = new Map<string, Player>();
        this.allPlayerIdArr = [];
        this.currentActivePlayerId = "";
        this.io = io;
    }
    public getGameId() {
        return this.gameId;
    }
    public isGameStarted() {
        return this.isStarted;
    }
    public getPlayerNumber() {
        return this.allPlayers.size;
    }
    public isGameFull() {
        return this.allPlayers.size >= 4;
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
        this.io.to(this.gameId).emit("start_match", this.serialize());
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
    public serialize() {
        const allPlayersArray: any[] = [];
        for (const [_, player] of this.allPlayers) {
            allPlayersArray.push(player.serialize());
        }
        return {
            gameRound: this.gameRound,
            currentPlayerId: this.currentActivePlayerId,
            allPlayers: allPlayersArray,
        };
    }
    public checkGameOver(): boolean {
        if (this.allPlayers.size <= 1) return true;
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
        this.io.to(this.gameId).emit("update_state", this.serialize());
    }
    public addPlayer(player: Player) {
        if (this.allPlayers.size >= 4) {
            throw new Error("Already full");
        }
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
    public stealAbility(
        ownerId: string,
        getterId: string,
        abilityIndex: number
    ) {
        const owner = this.allPlayers.get(ownerId);
        const getter = this.allPlayers.get(getterId);
        if (!owner || !getter) {
            return;
        }
        const ability = owner.getAbility(abilityIndex);
        if (!ability) return;

        owner.removeAbility(abilityIndex);
        getter.addAbility(ability);
    }
}
