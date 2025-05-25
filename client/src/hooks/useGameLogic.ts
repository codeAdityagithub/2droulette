import { useState, useMemo, useEffect } from "react";
import type { GameState } from "../types";
import { useSocket } from "./useSocket";

const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const { socket, id } = useSocket();
    const myPlayer = useMemo(() => {
        return gameState?.allPlayers.find((player) => player.playerId === id);
    }, [gameState, id]);

    useEffect(() => {
        const getGameState = (value: GameState) => {
            console.log(value);
            setGameState(value);
        };
        socket.on("start_match", getGameState);
        socket.on("update_state", getGameState);
        return () => {
            socket.off("gameState", getGameState);
            socket.off("update_state", getGameState);
        };
    }, []);

    return {
        hasMyPlayer: myPlayer != undefined,
        myPlayer,
        gameState,
        socket,
        id,
    } as const;
};

export default useGameLogic;
