import Table from "../components/table";

import Player from "../components/player";
import MyPlayer from "../components/myplayer";
import Loading from "../components/loading";
import useGameLogic from "../hooks/useGameLogic";
import { useMemo } from "react";
import type { PlayerType } from "../types";

const GameRoute = () => {
    const { hasMyPlayer, myPlayer, gameState } = useGameLogic();
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

    console.log(playerMap, myPlayer);

    return (
        <div className="w-full h-full overflow-hidden relative ">
            <Table />
            {gameState === null ? (
                <Loading />
            ) : (
                /* apply rotate here */ <div
                    className={`flex w-[600px] h-[600px] lg:w-[650px] lg:h-[650px] m-auto items-center justify-center *:flex-1 *:flex *:items-center flex-col absolute inset-0 ${rotate} border-amber-500`}
                >
                    <div className="">
                        {/* ttop - 2 */}
                        {playerMap[2] ? (
                            <Player
                                player={playerMap[2]}
                                activeId={gameState.currentPlayerId}
                            />
                        ) : null}
                    </div>
                    {/* mid */}
                    <div className="w-full flex-row *:flex-1 justify-self-end gap-52">
                        {/* left 3 */}
                        {playerMap[3] ? (
                            <Player
                                player={playerMap[3]}
                                activeId={gameState.currentPlayerId}
                            />
                        ) : (
                            <div></div>
                        )}

                        {/* right 1 */}
                        {playerMap[1] ? (
                            <Player
                                player={playerMap[1]}
                                activeId={gameState.currentPlayerId}
                            />
                        ) : (
                            <div></div>
                        )}
                    </div>
                    {/* bottom -0 */}
                    <div className="">
                        {playerMap[0] ? (
                            <Player
                                player={playerMap[0]}
                                activeId={gameState.currentPlayerId}
                            />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameRoute;
