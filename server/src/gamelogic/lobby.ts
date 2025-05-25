import { IOType, SocketType } from "../types";
import { singleton } from "../utils/singleton";
import { GameState } from "./gameState";
import { Player } from "./player";

const lobbyMap = singleton("lobby", () => new Map<string, GameState>());

export function addPlayer(socket: SocketType, io: IOType) {
    if (lobbyMap.size === 0) {
        const game = new GameState(io);
        lobbyMap.set(game.getGameId(), game);
        const player = new Player(game, socket, 0);

        game.addPlayer(player);

        socket.data.gameId = game.getGameId();
        socket.data.playerId = player.getId();
        socket.join(game.getGameId());
    } else {
        // traverse
        for (const gameState of lobbyMap.values()) {
            if (gameState.isGameFull() || gameState.isGameStarted()) {
                continue;
            }
            const player = new Player(
                gameState,
                socket,
                gameState.getPlayerNumber()
            );
            gameState.addPlayer(player);
            socket.data.gameId = gameState.getGameId();
            socket.data.playerId = player.getId();
            socket.join(gameState.getGameId());

            if (gameState.isGameFull()) {
                gameState.startMatch();
            }

            return;
        }
        // all games full

        const game = new GameState(io);
        lobbyMap.set(game.getGameId(), game);
        const player = new Player(game, socket, 0);

        game.addPlayer(player);
        socket.data.gameId = game.getGameId();
        socket.data.playerId = player.getId();
        socket.join(game.getGameId());
    }
}
export function removeplayer(gameId: string, playerId: string) {
    const gameState = lobbyMap.get(gameId);
    gameState?.removePlayer(playerId);
    if (gameState?.checkGameOver()) {
        lobbyMap.delete(gameId);
    }
}
