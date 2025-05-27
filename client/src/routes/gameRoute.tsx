import Table from "../components/table";

import Player from "../components/player";
import Loading from "../components/loading";
import useGameLogic from "../hooks/useGameLogic";
import { useEffect, useMemo, useState } from "react";
import type { PlayerType } from "../types";
import RoundInfo from "@/components/RoundInfo";

const GameRoute = () => {
    const { myPlayer, gameState, currentRoundbulletinfo } = useGameLogic();
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
    const isMyPlayerActive = myPlayer?.playerId === gameState?.currentPlayerId;
    const [isShooting, setIsShooting] = useState(false);
    const [prevId, setPrevId] = useState(gameState?.currentPlayerId);

    const triggerShoot = () => {
        setIsShooting(true);
        setPrevId(gameState?.currentPlayerId);
        setTimeout(() => {
            setIsShooting(false);
            setPrevId(gameState?.currentPlayerId);
        }, 1000);
    };
    return (
        <div className="w-full h-full overflow-hidden relative ">
            <Table />
            <div className="absolute w-full top-8 text-center text-4xl font-bold">
                Round {gameState?.gameRound}
            </div>
            <RoundInfo currentRoundbulletinfo={currentRoundbulletinfo} />
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
                                triggerShoot={triggerShoot}
                                player={playerMap[2]}
                                canGetShot={isMyPlayerActive}
                                activeId={gameState.currentPlayerId}
                                isShooting={
                                    prevId === playerMap[3].playerId &&
                                    isShooting
                                }
                            />
                        ) : null}
                    </div>
                    {/* mid */}
                    <div className="w-full flex-row *:flex-1 justify-self-end gap-52">
                        {/* left 3 */}
                        {playerMap[3] ? (
                            <Player
                                triggerShoot={triggerShoot}
                                canGetShot={isMyPlayerActive}
                                player={playerMap[3]}
                                activeId={gameState.currentPlayerId}
                                isShooting={
                                    prevId === playerMap[2].playerId &&
                                    isShooting
                                }
                            />
                        ) : (
                            <div></div>
                        )}

                        {/* right 1 */}
                        {playerMap[1] ? (
                            <Player
                                canGetShot={isMyPlayerActive}
                                player={playerMap[1]}
                                activeId={gameState.currentPlayerId}
                                triggerShoot={triggerShoot}
                                isShooting={
                                    prevId === playerMap[1].playerId &&
                                    isShooting
                                }
                            />
                        ) : (
                            <div></div>
                        )}
                    </div>
                    {/* bottom -0 */}
                    <div className="">
                        {playerMap[0] ? (
                            <Player
                                canGetShot={isMyPlayerActive}
                                player={playerMap[0]}
                                activeId={gameState.currentPlayerId}
                                triggerShoot={triggerShoot}
                                isShooting={
                                    prevId === playerMap[0].playerId &&
                                    isShooting
                                }
                            />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameRoute;
