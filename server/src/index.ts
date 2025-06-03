import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";
import { addPlayer, getGameState, removeplayer } from "./gamelogic/lobby";
import { Player } from "./gamelogic/player";

config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});

io.on("connection", (socket) => {
    socket.on("join", (name, isPrivate?: boolean) => {
        if (socket.data.playerId) {
            socket.leave(socket.data.playerId);
        }
        if (socket.data.gameId) {
            socket.leave(socket.data.gameId);
        }
        addPlayer(socket, io, name, isPrivate);
        socket.emit("getId", socket.data.playerId);
        socket.emit("gameId", socket.data.gameId);
    });
    socket.on("join_game", (name: string, gameId: string) => {
        if (socket.data.gameId === gameId) return;
        if (socket.data.playerId) {
            socket.leave(socket.data.playerId);
        }
        if (socket.data.gameId) {
            socket.leave(socket.data.gameId);
        }

        const gameState = getGameState(gameId);
        if (gameState) {
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
            socket.emit("getId", socket.data.playerId);
            socket.emit("gameId", socket.data.gameId);
        }
    });
    socket.on("start_match", () => {
        const gameState = getGameState(socket.data.gameId);
        if (!gameState || !gameState.isPrivate || gameState.isGameStarted())
            return;

        const player = gameState.getPlayer(socket.data.playerId);
        if (player?.getPosition() !== 0) return;

        gameState.startMatch();
    });
    socket.on("getMatchMaking", () => {
        const gameState = getGameState(socket.data.gameId);

        if (gameState) {
            const player = gameState.getPlayer(socket.data.playerId);
            if (!player) return;

            io.to(socket.data.gameId).emit(
                "matchMaking",
                gameState.getMatchMaking()
            );
        }
    });
    socket.on("signal", ({ targetId, signal }) => {
        io.to(targetId).emit("signal", {
            sourceId: socket.data.playerId,
            signal,
        });
    });

    socket.on("ready", () => {
        const gameState = getGameState(socket.data.gameId);
        gameState?.setPlayerReady(socket.data.playerId);
    });
    socket.on("unready", () => {
        const gameState = getGameState(socket.data.gameId);
        gameState?.unReadyPlayer(socket.data.playerId);
    });

    socket.on("initiated", (toPlayer: string) => {
        io.to(toPlayer).emit("initiate_peer", socket.data.playerId);
    });
    socket.on("removeFromMatch", () => {
        removeplayer(socket.data.gameId, socket.data.playerId);
        const gameState = getGameState(socket.data.gameId);
        if (gameState)
            io.to(socket.data.gameId).emit(
                "matchMaking",
                gameState.getMatchMaking()
            );
        if (gameState?.getPlayerNumber ?? 0 <= 1) {
            io.to(socket.data.gameId).emit("matchmaking_failed");
        }
    });
    socket.on(
        "use_ability",
        (index: number, ownerId?: string, stealIndex?: number) => {
            const gameState = getGameState(socket.data.gameId);
            if (!gameState) return;
            const player = gameState.getPlayer(socket.data.playerId);
            if (!player || gameState.getCurrentPlayerId() !== player.getId())
                return;
            player.useAbility(index, ownerId, stealIndex);
            io.to(socket.data.gameId).emit(
                "update_state",
                gameState.serialize()
            );
        }
    );
    socket.on("shoot_player", (playerId: string) => {
        const gameState = getGameState(socket.data.gameId);
        if (!gameState) return;
        const curPlayer = gameState.getPlayer(socket.data.playerId);
        if (!curPlayer || gameState.getCurrentPlayerId() != curPlayer.getId())
            return;
        gameState.shootPlayer(playerId);
    });
    socket.on("disconnect", () => {
        console.log("removing player", socket.data.playerId);
        removeplayer(socket.data.gameId, socket.data.playerId);
        io.to(socket.data.gameId).emit(
            "user-disconnected",
            socket.data.playerId
        );
    });
});

// Use Helmet!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(helmet());
app.use(morgan("short"));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "../public")));

// @ts-expect-error
app.get("/game/:gameid", (req, res) => {
    const gameid = req.params.gameid;
    const gamestate = getGameState(gameid);
    if (!gamestate || gamestate.getPlayerNumber() <= 1) {
        console.log("error not player");
        return res.status(400).send("Error No Player");
    }
    const currRoundbulletinfo = gamestate.getCountBullets();
    return res.status(200).send({
        gamestate: gamestate.serialize(),
        currRoundbulletinfo: currRoundbulletinfo,
    });
});
// @ts-expect-error
app.get("/matchmaking/:gameid", (req, res) => {
    const gameid = req.params.gameid;
    const gamestate = getGameState(gameid);
    if (!gamestate) {
        console.log("error not player");
        return res.status(400).send("Error No Player");
    }
    return res.status(200).json({ isPrivate: gamestate.isPrivate });
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
    console.log(`app running on http://127.0.0.1:${PORT}`);
});
