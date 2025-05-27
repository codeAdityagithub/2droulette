import type { PlayerType } from "../types";
import sitting from "../assets/sitting.png";
import withGun from "../assets/sitwgun.png";
import shooting from "../assets/shooting.png";
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
    triggerShoot,
    isShooting,
}: {
    player: PlayerType;
    activeId: string;
    canGetShot: boolean;
    triggerShoot: () => void;
    isShooting: boolean;
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
        triggerShoot();
    };
    useEffect(() => {
        if (!isShooting)
            setActiveImage(player.playerId === activeId ? withGun : sitting);
    }, [player, activeId, isShooting]);

    useEffect(() => {
        const getShot = (playerId: string) => {
            if (player.playerId === playerId) {
                // get shot animation
                console.log("geting shiot", player.playerName);
            }
        };
        socket.on("getShot", getShot);
        return () => {
            socket.off("getShot", getShot);
        };
    }, []);

    return (
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
            <img
                src={isShooting ? shooting : activeImage}
                onClick={handleShoot}
                title={"Shoot " + player.playerName}
                className={cn(
                    canGetShot ? "hover:bg-red-400/80" : "hover:bg-gray-500/80",
                    "aspect-auto w-20 h-28 z-30 transition-colors"
                )}
            ></img>
            {/* {id == player.playerId ? "my" : "diff"} */}
            <div className="flex gap-2">
                {player.abilities.map((ability, i) => (
                    <Ability
                        isMyAbility={isMyPlayer}
                        ability={ability}
                        abilityIndex={i}
                        key={ability.abilityName + i}
                    />
                ))}
            </div>
        </div>
    );
};

export default Player;
