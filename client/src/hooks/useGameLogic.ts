import { useState, useMemo, useEffect } from "react";
import type { GameState, PlayerType } from "../types";
import { useSocket } from "./useSocket";
import { useLoaderData, useNavigate } from "react-router";
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

    const isMyPlayerActive = myPlayer?.playerId === gameState?.currentPlayerId;
    const [isShooting, setIsShooting] = useState(false);
    const [prevId, setPrevId] = useState(gameState?.currentPlayerId);
    const [gettingShotId, setGettingShotId] = useState("");
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();
    const [winner, setWinner] = useState<null | PlayerType>(null);

    useEffect(() => {
        const getGameState = (value: GameState) => {
            setGameState(value);
        };
        const newRound = (gameState: GameState, roundInfo: RoundInfo) => {
            setGameState(gameState);
            setRoundInfo(roundInfo);
            toast("Bullet Exhausted, New Round Started");
        };
        const shootSound = (isActive: boolean, activePlayerId: string) => {
            const shootSound = new Audio(shoot);
            const emptySound = new Audio(empty);
            if (isActive) shootSound.play();
            else emptySound.play();

            setIsShooting(true);
            setPrevId(activePlayerId);
            setTimeout(() => {
                setIsShooting(false);
                setPrevId("");
            }, 1000);
        };

        const getShot = (playerId: string, active: boolean) => {
            setGettingShotId(playerId);
            setIsActive(active);
            setTimeout(() => {
                setGettingShotId("");
                setIsActive(false);
            }, 1000);
        };
        const gameover = (winner: PlayerType) => {
            setTimeout(() => {
                navigate("/");
            }, 5000);
            setWinner(winner);
        };
        socket.on("getShot", getShot);
        socket.on("update_state", getGameState);
        socket.on("new_round", newRound);
        socket.on("shoot", shootSound);
        socket.on("game_over", gameover);
        return () => {
            socket.off("update_state", getGameState);
            socket.off("new_round", newRound);
            socket.off("shoot", shootSound);
            socket.off("getShot", getShot);
            socket.off("game_over", gameover);
        };
    }, [socket, gameState]);

    let rotate;
    if (myPlayer?.position === 0) rotate = "";
    else if (myPlayer?.position === 2) rotate = "rotate-180";
    else if (myPlayer?.position === 1) rotate = "rotate-90";
    else rotate = "-rotate-90";

    const playerMap = useMemo(() => {
        const map = {} as Record<number, PlayerType>;
        if (!gameState) return map;

        for (const player of gameState?.allPlayers) {
            map[player.position] = player;
        }
        return map;
    }, [gameState]);

    const gettingShotPosition = useMemo(
        () =>
            gameState?.allPlayers.find((p) => p.playerId === gettingShotId)
                ?.position,
        [gameState, gettingShotId]
    );
    const currentPlayerPosition = useMemo(
        () =>
            gameState?.allPlayers.find((p) => p.playerId === prevId)?.position,
        [gameState, prevId]
    );

    let gettingShotRotation = "";
    if (currentPlayerPosition != undefined) {
        if (gettingShotPosition === (currentPlayerPosition + 1) % 4) {
            // console.log("shooting right");
            gettingShotRotation = "rotate-45";
        } else if (gettingShotPosition === (currentPlayerPosition + 2) % 4) {
            // console.log("shooting top");
            gettingShotRotation = "";
        } else if (gettingShotPosition === (currentPlayerPosition + 3) % 4) {
            // console.log("shooting left");
            gettingShotRotation = "-rotate-45";
        } else {
            // console.log("shoot himself");
        }
    }

    return {
        myPlayer,
        gameState,
        socket,
        id,
        currentRoundbulletinfo,
        isMyPlayerActive,
        isShooting,
        prevId,
        playerMap,
        rotate,
        gettingShotId,
        gettingShotRotation,
        isActive,
        winner,
    } as const;
};

export default useGameLogic;
