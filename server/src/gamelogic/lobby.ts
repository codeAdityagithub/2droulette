import { IOType, SocketType } from "../types";
import { singleton } from "../utils/singleton";
import { GameState } from "./gameState";
import { Player } from "./player";

const lobbyMap = singleton("lobby", () => new Map<string, GameState>());

const timers = singleton("times", () => new Map<string, number>());
const MATCHMAKINGTIME = 1000 * 15;

const PRIVATE_MATCHTIME = 1000 * 60;

setInterval(() => {
    for (const [gameId, timeStamp] of timers) {
        const now = Date.now();
        const gameState = lobbyMap.get(gameId);
        if (!gameState) {
            lobbyMap.delete(gameId);
            timers.delete(gameId);
            continue;
        }
        const time = gameState.isPrivate ? PRIVATE_MATCHTIME : MATCHMAKINGTIME;

        if (now - timeStamp >= time) {
            gameState.startMatch();
            timers.delete(gameId);
        } else if (!gameState.isPrivate && gameState.isGameFull()) {
            gameState.startMatch();
            timers.delete(gameId);
        }
    }
}, 5000);

export function addPlayer(
    socket: SocketType,
    io: IOType,
    name: string,
    isPrivate?: boolean
) {
    if (lobbyMap.size === 0) {
        const game = new GameState(io, isPrivate ?? false);
        lobbyMap.set(game.getGameId(), game);
        const player = new Player(game, socket, 0, name);

        game.addPlayer(player);
        timers.set(game.getGameId(), Date.now());

        socket.data.gameId = game.getGameId();
        socket.data.playerId = player.getId();
        socket.join(game.getGameId());
        socket.join(player.getId());
    } else {
        // traverse
        for (const gameState of lobbyMap.values()) {
            if (
                gameState.isGameFull() ||
                gameState.isGameStarted() ||
                gameState.isPrivate
            ) {
                continue;
            }
            const player = new Player(
                gameState,
                socket,
                gameState.getPlayerNumber(),
                name
            );
            gameState.addPlayer(player);
            socket.data.gameId = gameState.getGameId();
            socket.data.playerId = player.getId();
            socket.join(gameState.getGameId());
            socket.join(player.getId());

            return;
        }
        // all games full

        const game = new GameState(io, isPrivate ?? false);
        lobbyMap.set(game.getGameId(), game);
        const player = new Player(game, socket, 0, name);

        game.addPlayer(player);
        timers.set(game.getGameId(), Date.now());

        socket.data.gameId = game.getGameId();
        socket.data.playerId = player.getId();
        socket.join(game.getGameId());
        socket.join(player.getId());
    }
}

export function deleteGameState(gameId: string) {
    lobbyMap.delete(gameId);
}
export function removeplayer(gameId: string, playerId: string) {
    const gameState = lobbyMap.get(gameId);
    if (!gameState) {
        return;
    }
    gameState.deletePlayer(playerId);
    const over = gameState.checkGameOver();

    if (over) {
        console.log("deleting from lobby game");
        lobbyMap.delete(gameId);
    }
}

export function getGameState(gameId: string) {
    return lobbyMap.get(gameId);
}
