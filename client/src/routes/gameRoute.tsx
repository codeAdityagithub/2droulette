import Table from "../components/table";

import Player from "../components/player";
import Loading from "../components/loading";
import useGameLogic from "../hooks/useGameLogic";
import RoundInfo from "@/components/RoundInfo";

const GameRoute = () => {
    const {
        gameState,
        currentRoundbulletinfo,
        isMyPlayerActive,
        isShooting,
        prevId,
        playerMap,
        rotate,
        gettingShotId,
        gettingShotRotation,
        isActive,
    } = useGameLogic();

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
                                player={playerMap[2]}
                                canGetShot={isMyPlayerActive}
                                activeId={gameState.currentPlayerId}
                                isShooting={
                                    prevId === playerMap[2].playerId &&
                                    isShooting
                                }
                                gettingShotId={gettingShotId}
                                gettingShotRotation={gettingShotRotation}
                                isActive={isActive}
                            />
                        ) : null}
                    </div>
                    {/* mid */}
                    <div className="w-full flex-row *:flex-1 justify-self-end gap-52">
                        {/* left 3 */}
                        {playerMap[3] ? (
                            <Player
                                canGetShot={isMyPlayerActive}
                                player={playerMap[3]}
                                activeId={gameState.currentPlayerId}
                                isShooting={
                                    prevId === playerMap[3].playerId &&
                                    isShooting
                                }
                                gettingShotId={gettingShotId}
                                gettingShotRotation={gettingShotRotation}
                                isActive={isActive}
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
                                isShooting={
                                    prevId === playerMap[1].playerId &&
                                    isShooting
                                }
                                gettingShotId={gettingShotId}
                                gettingShotRotation={gettingShotRotation}
                                isActive={isActive}
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
                                isShooting={
                                    prevId === playerMap[0].playerId &&
                                    isShooting
                                }
                                gettingShotId={gettingShotId}
                                gettingShotRotation={gettingShotRotation}
                                isActive={isActive}
                            />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameRoute;
