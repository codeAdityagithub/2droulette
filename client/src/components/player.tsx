import type { PlayerType } from "../types";
import sitting from "../assets/sitting.png";
import withGun from "../assets/sitwgun.png";
import shooting from "../assets/shooting.png";
import blood from "../assets/blood.png";
import Ability from "./ability";
import LifeBar from "./lifebar";
import arrow from "../assets/arrow.png";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const Player = ({
    player,
    activeId,
    canGetShot,
    isShooting,
    gettingShotId,
    gettingShotRotation,
    isActive,
    allPlayers,
}: {
    player: PlayerType;
    activeId: string;
    canGetShot: boolean;
    isShooting: boolean;
    gettingShotId: string;
    gettingShotRotation: string;
    isActive: boolean;
    allPlayers: PlayerType[];
}) => {
    let angle;
    if (player.position === 2) angle = "";
    else if (player.position === 3) angle = "-rotate-90";
    else if (player.position === 1) angle = "rotate-90";
    else angle = "rotate-180";
    const { id, socket } = useSocket();

    const [activeImage, setActiveImage] = useState(sitting);

    const isMyPlayer = id === player.playerId;

    const handleShoot = () => {
        if (canGetShot) socket.emit("shoot_player", player.playerId);
    };
    useEffect(() => {
        if (!isShooting)
            setActiveImage(player.playerId === activeId ? withGun : sitting);
    }, [player, activeId, isShooting]);

    const isGettingShot = gettingShotId === player.playerId && isActive;

    return (
        <>
            {player.isAlive ? (
                <div
                    className={`w-full h-full relative flex flex-col gap-6 items-center justify-self-end ${angle}`}
                >
                    <LifeBar lives={player.livesLeft} />
                    {player.playerId === activeId ? (
                        <div className="absolute inset-0 -top-2 -left-8 rotate-90">
                            <img
                                src={arrow}
                                alt="arrow"
                                className="w-10 h-10 animate-bounce"
                            />
                        </div>
                    ) : null}
                    <div className="relative">
                        {isGettingShot ? (
                            <img
                                src={blood}
                                alt=""
                                className="absolute inset-0 w-20 h-20"
                            />
                        ) : null}
                        <img
                            src={isShooting ? shooting : activeImage}
                            onClick={handleShoot}
                            title={"Shoot " + player.playerName}
                            className={cn(
                                canGetShot
                                    ? "hover:bg-red-400/80"
                                    : "hover:bg-gray-500/80",
                                isShooting ? gettingShotRotation : "",
                                "aspect-auto w-20 h-28 z-30 transition-colors"
                            )}
                        ></img>
                    </div>
                    {/* {id == player.playerId ? "my" : "diff"} */}
                    <div className="flex gap-2">
                        {player.abilities.map((ability, i) => (
                            <Ability
                                isMyAbility={isMyPlayer}
                                isActivePlayer={player.playerId === activeId}
                                ability={ability}
                                abilityIndex={i}
                                key={ability.abilityName + i}
                                allPlayers={allPlayers}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div
                    className={`w-full h-full relative flex flex-col gap-6 items-center justify-self-end ${angle}`}
                >
                    <LifeBar lives={player.livesLeft} />
                    {player.playerId === activeId ? (
                        <div className="absolute inset-0 -top-2 -left-8 rotate-90">
                            <img
                                src={arrow}
                                alt="arrow"
                                className="w-10 h-10 animate-bounce"
                            />
                        </div>
                    ) : null}
                    <div className="relative">
                        <img
                            src={blood}
                            alt=""
                            className="absolute inset-0 w-20 h-20"
                        />
                        <img
                            src={sitting}
                            title={"Dead " + player.playerName}
                            className={cn(
                                "aspect-auto w-20 h-28 z-30 transition-colors hover:bg-gray-500/80"
                            )}
                        ></img>
                    </div>
                    {/* {id == player.playerId ? "my" : "diff"} */}
                    <div className="h-10"></div>
                </div>
            )}
        </>
    );
};

export default Player;
