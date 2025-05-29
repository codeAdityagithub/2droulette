import { AbilityName } from "./ability";
import { Player } from "./player";
import getRandomBullets from "./utils/getRandomBullets";
import { Serializable } from "./utils/serializable";
import { v4 as uuidv4 } from "uuid";
import type { IOType, SocketType } from "../types";
import { deleteGameState } from "./lobby";

export class GameState implements Serializable {
    private gameId: string;
    private gameRound: number;
    private bullets: number[]; // 0-1 array
    private currentBulletIndex: number;
    private allPlayerIdArr: string[];
    private currentActivePlayerIndex: number = 0;
    private currentActivePlayerId: string;
    private allPlayers: Map<string, Player>;
    private isStarted = false;
    private isSkipActive = false;
    private io: IOType;
    private isGameOver = false;
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
    public getCountBullets() {
        let active = 0;

        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i] === 1) active++;
        }
        const currRoundbulletinfo = {
            active: active,
            blank: this.bullets.length - active,
        };
        return currRoundbulletinfo;
    }
    public getPlayer(playerId: string) {
        return this.allPlayers.get(playerId);
    }
    public getMatchMaking() {
        const matchMaking: any[] = [];
        for (const player of this.allPlayers.values()) {
            matchMaking.push({
                name: player.getName(),
                position: player.getPosition(),
            });
        }
        return matchMaking;
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
    public startMatch(): boolean {
        if (this.allPlayers.size < 2) {
            this.io.to(this.gameId).emit("matchmaking_failed");
            return false;
        }
        this.io.to(this.gameId).emit("start_match", this.gameId);
        this.isStarted = true;
        return true;
    }
    public resetRound() {
        this.gameRound++;
        this.bullets = getRandomBullets();
        this.currentBulletIndex = 0;
        console.log("resetting round", this.getCountBullets());
        for (const player of this.allPlayers.values()) {
            player.resetAbilities();
        }

        this.io
            .to(this.gameId)
            .emit("new_round", this.serialize(), this.getCountBullets());
    }
    public rotateTable() {
        this.currentActivePlayerIndex =
            (this.currentActivePlayerIndex + 1) % this.allPlayerIdArr.length;

        while (
            this.allPlayerIdArr.length > 1 &&
            this.allPlayerIdArr[this.currentActivePlayerIndex] === ""
        ) {
            console.log("player removed checking rotate");
            this.currentActivePlayerIndex =
                (this.currentActivePlayerIndex + 1) %
                this.allPlayerIdArr.length;
        }

        if (this.isSkipActive) {
            this.currentActivePlayerIndex =
                (this.currentActivePlayerIndex + 1) %
                this.allPlayerIdArr.length;

            while (
                this.allPlayerIdArr.length > 1 &&
                this.allPlayerIdArr[this.currentActivePlayerIndex] === ""
            ) {
                this.currentActivePlayerIndex =
                    (this.currentActivePlayerIndex + 1) %
                    this.allPlayerIdArr.length;
            }
            this.isSkipActive = false;
        }

        this.currentActivePlayerId =
            this.allPlayerIdArr[this.currentActivePlayerIndex];
    }
    public serialize() {
        const allPlayersArray: any[] = [];
        for (const [_, player] of this.allPlayers) {
            allPlayersArray.push(player.serialize());
        }
        let winnerId: string | null = null;
        if (this.isGameOver) {
            winnerId = this.allPlayerIdArr[0];
        }
        return {
            gameRound: this.gameRound,
            currentPlayerId: this.currentActivePlayerId,
            allPlayers: allPlayersArray,
        };
    }
    public checkGameOver(): boolean {
        let activeCount = 0;
        for (const s of this.allPlayerIdArr) {
            if (s !== "") {
                activeCount++;
            }
        }
        console.log("checking game over active players", activeCount);
        if (activeCount <= 1) {
            this.isGameOver = true;
            this.isStarted = false;
            return true;
        }
        return false;
    }
    public isRoundActive(): boolean {
        return this.bullets[this.currentBulletIndex] !== 0;
    }

    public nextBullet() {
        this.currentBulletIndex++;
        console.log("next bullet", this.bullets);
        if (this.currentBulletIndex === this.bullets.length) {
            this.resetRound();
        }
    }

    public shootPlayer(playerId: string) {
        if (!this.isStarted) return;

        const isActive = this.isRoundActive();
        console.log(isActive, "active round");

        if (isActive) {
            const lives = this.allPlayers
                .get(playerId)
                ?.getShot(this.bullets[this.currentBulletIndex]);

            if (lives === undefined) {
                // no player shot
                return;
            }

            if (lives <= 0) {
                this.removePlayer(playerId);
            }
        }

        this.io.to(this.gameId).emit("getShot", playerId, isActive);
        this.io
            .to(this.gameId)
            .emit("shoot", isActive, this.currentActivePlayerId);

        const isOver = this.checkGameOver();
        if (isOver) {
            let winner: any = null;
            for (const player of this.allPlayers.values()) {
                if (player.isAlive) {
                    winner = player.serialize();
                }
            }
            deleteGameState(this.gameId);
            this.io.to(this.gameId).emit("game_over", winner);
            return;
        }
        this.nextBullet();
        this.rotateTable();

        setTimeout(() => {
            this.io.to(this.gameId).emit("update_state", this.serialize());
        }, 900);
    }

    public removePlayer(playerId: string) {
        this.allPlayerIdArr = this.allPlayerIdArr.map((prev) =>
            prev === playerId ? "" : prev
        );
        if (this.isStarted)
            this.io.to(this.gameId).emit("update_state", this.serialize());
    }
    public deletePlayer(playerId: string) {
        this.allPlayerIdArr = this.allPlayerIdArr.map((prev) =>
            prev === playerId ? "" : prev
        );
        this.allPlayers.delete(playerId);

        if (this.currentActivePlayerId === playerId) this.rotateTable();

        if (this.allPlayers.size <= 1) {
            this.isStarted = false;
        }

        this.io.to(this.gameId).emit("update_state", this.serialize());
    }
    public addPlayer(player: Player) {
        if (this.allPlayers.size >= 4 || this.isStarted) {
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
        if (
            !owner ||
            !getter ||
            owner.getId() === getter.getId() ||
            !owner.isAlive
        ) {
            return;
        }
        const ability = owner.getAbility(abilityIndex);
        if (!ability) return;

        owner.removeAbility(abilityIndex);
        getter.addAbility(ability);
    }
}
