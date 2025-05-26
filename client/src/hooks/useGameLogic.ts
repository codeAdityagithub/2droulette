import { useState, useMemo, useEffect } from "react";
import type { GameState } from "../types";
import { useSocket } from "./useSocket";
import { useLoaderData } from "react-router";

const useGameLogic = () => {
    const initialGameState: GameState = useLoaderData();
    const [gameState, setGameState] = useState<GameState | null>(
        initialGameState
    );
    const { socket, id } = useSocket();
    const myPlayer = useMemo(() => {
        return gameState?.allPlayers.find((player) => player.playerId === id);
    }, [gameState, id]);
    useEffect(() => {
        const getGameState = (value: GameState) => {
            console.log(value);
            setGameState(value);
        };
        socket.on("update_state", getGameState);
        return () => {
            socket.off("update_state", getGameState);
        };
    }, []);
    useEffect(() => {
        console.log(gameState);
    }, [gameState]);
    return {
        myPlayer,
        gameState,
        socket,
        id,
    } as const;
};

export default useGameLogic;
