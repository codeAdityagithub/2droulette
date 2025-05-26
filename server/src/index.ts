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
    socket.on("join", (name) => {
        addPlayer(socket, io, name);
        socket.emit("getId", socket.data.playerId);
        socket.emit("gameId", socket.data.gameId);
    });
    socket.on("getMatchMaking", () => {
        const gameState = getGameState(socket.data.gameId);
        if (gameState)
            io.to(socket.data.gameId).emit(
                "matchMaking",
                gameState.getMatchMaking()
            );
    });

    socket.on("removeFromMatch", () => {
        removeplayer(socket.data.gameId, socket.data.playerId);
        const gameState = getGameState(socket.data.gameId);
        if (gameState)
            io.to(socket.data.gameId).emit(
                "matchMaking",
                gameState.getMatchMaking()
            );
    });
    socket.on("disconnect", () => {
        removeplayer(socket.data.gameId, socket.data.playerId);
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

app.post("/test", (req, res) => {
    console.log(req.cookies);
    res.json({ message: "test" });
});
// @ts-expect-error
app.get("/game/:gameid", (req, res) => {
    const gameid = req.params.gameid;
    const gamestate = getGameState(gameid);
    if (!gamestate) {
        return res.status(400);
    }
    return res.status(200).send(gamestate.serialize());
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
    console.log(`app running on http://127.0.0.1:${PORT}`);
});
