import Table from "../components/table";
import type { GameState } from "../types";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useMemo, useState } from "react";
import Player from "../components/player";
import MyPlayer from "../components/myplayer";
import Loading from "../components/loading";
// import Loading from "../components/loading";

const GameRoute = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const { socket, id } = useSocket();

    const hasMyPlayer = useMemo(() => {
        return (
            gameState?.allPlayers.find((player) => {
                player.playerId === id;
            }) !== undefined
        );
    }, [gameState, id]);

    useEffect(() => {
        const getGameState = (value: GameState) => {
            console.log(value);
            setGameState(value);
        };
        socket.on("start_match", getGameState);

        return () => {
            socket.off("gameState", getGameState);
        };
    }, []);
    return (
        <div className="w-full h-full relative ">
            <Table />
            {gameState === null ? (
                <Loading />
            ) : (
                <div className="flex items-center justify-center *:flex-1 *:flex *:items-center flex-col absolute inset-0 border-amber-500">
                    <div className="">
                        <Player
                            player={{}}
                            position="top"
                        />
                    </div>
                    {/* mid */}
                    <div className="w-full max-w-[1100px] flex-row justify-between gap-52">
                        <Player
                            player={{}}
                            position="left"
                        />
                        <Player
                            player={{}}
                            position="right"
                        />
                    </div>
                    {/* bottom */}
                    <div className="">
                        {hasMyPlayer ? <MyPlayer player={{}} /> : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameRoute;
