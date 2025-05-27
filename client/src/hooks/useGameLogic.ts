import { useState, useMemo, useEffect } from "react";
import type { GameState } from "../types";
import { useSocket } from "./useSocket";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import shoot from "../assets/shot.mp3";
import empty from "../assets/empty.mp3";

type RoundInfo = {
    active: number;
    blank: number;
};

const useGameLogic = () => {
    const initialGameState: any = useLoaderData();
    const [gameState, setGameState] = useState<GameState | null>(
        initialGameState.gamestate
    );
    const [currentRoundbulletinfo, setRoundInfo] = useState<RoundInfo>(
        initialGameState.currRoundbulletinfo
    );

    const { socket, id } = useSocket();
    const myPlayer = useMemo(() => {
        return gameState?.allPlayers.find((player) => player.playerId === id);
    }, [gameState, id]);
    useEffect(() => {
        const getGameState = (value: GameState) => {
            setGameState(value);
        };
        const newRound = (gameState: GameState, roundInfo: RoundInfo) => {
            setGameState(gameState);
            setRoundInfo(roundInfo);
            toast("Bullet Exhausted, New Round Started");
        };
        const shootSound = (isActive: boolean) => {
            const shootSound = new Audio(shoot);
            const emptySound = new Audio(empty);
            if (isActive) shootSound.play();
            else emptySound.play();
        };
        socket.on("update_state", getGameState);
        socket.on("new_round", newRound);
        socket.on("shoot", shootSound);
        return () => {
            socket.off("update_state", getGameState);
            socket.off("new_round", newRound);
            socket.off("shoot", shootSound);
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
        currentRoundbulletinfo,
    } as const;
};

export default useGameLogic;
