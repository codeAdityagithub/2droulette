import type { PlayerType } from "../types";
import person1sitting from "../assets/person1sitting.png";
import person1wgun from "../assets/person1wgun.png";
import person1shooting from "../assets/person1shooting.png";
import person2sitting from "../assets/person2sitting.png";
import person2wgun from "../assets/person2wgun.png";
import person2shooting from "../assets/person2shooting.png";
import person3sitting from "../assets/person3sitting.png";
import person3wgun from "../assets/person3wgun.png";
import person3shooting from "../assets/person3shooting.png";
import person4sitting from "../assets/person4sitting.png";
import person4wgun from "../assets/person4wgun.png";
import person4shooting from "../assets/person4shooting.png";
import blood from "../assets/blood.png";
import Ability from "./ability";
import LifeBar from "./lifebar";
import arrow from "../assets/arrow.png";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const playerImages = [
    {
        sitting: person1sitting,
        sittingwithgun: person1wgun,
        shooting: person1shooting,
    },
    {
        sitting: person2sitting,
        sittingwithgun: person2wgun,
        shooting: person2shooting,
    },

    {
        sitting: person3sitting,
        sittingwithgun: person3wgun,
        shooting: person3shooting,
    },
    {
        sitting: person4sitting,
        sittingwithgun: person4wgun,
        shooting: person4shooting,
    },
];

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

    const [activeImage, setActiveImage] = useState(
        playerImages[player.position].sitting
    );

    const isMyPlayer = id === player.playerId;

    const handleShoot = () => {
        if (canGetShot) socket.emit("shoot_player", player.playerId);
    };
    useEffect(() => {
        if (!isShooting)
            setActiveImage(
                player.playerId === activeId
                    ? playerImages[player.position].sittingwithgun
                    : playerImages[player.position].sitting
            );
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
                            src={
                                isShooting
                                    ? playerImages[player.position].shooting
                                    : activeImage
                            }
                            onClick={handleShoot}
                            title={"Shoot " + player.playerName}
                            className={cn(
                                canGetShot
                                    ? "hover:bg-red-400/80"
                                    : "hover:bg-gray-500/80",
                                isShooting ? gettingShotRotation : "",
                                "aspect-auto w-20 h-28 z-30 transition-all duration-500"
                            )}
                        ></img>
                    </div>
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
                    <h1 className="absolute -bottom-4 rotate-180 text-lg font-semibold font-mono text-gray-700 border px-1 shadow-md rounded capitalize">
                        {player.playerName}
                    </h1>
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
                            src={playerImages[player.position].sitting}
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
