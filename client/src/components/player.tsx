import type { PlayerType } from "../types";
import sitting from "../assets/sitting.png";
import withGun from "../assets/sitwgun.png";
import Ability from "./ability";
import LifeBar from "./lifebar";
import arrow from "../assets/arrow.png";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

const Player = ({
    player,
    activeId,
}: {
    player: PlayerType;
    activeId: string;
}) => {
    let angle;
    if (player.position === 2) angle = "";
    else if (player.position === 3) angle = "-rotate-90";
    else if (player.position === 1) angle = "rotate-90";
    else angle = "rotate-180";

    const { id } = useSocket();

    const isActive = activeId === player.playerId;
    const isMyPlayer = id === player.playerId;

    return (
        <div
            className={`w-full h-full relative flex flex-col gap-6 items-center justify-self-end ${angle}`}
        >
            <LifeBar lives={player.livesLeft} />
            {isActive ? (
                <div className="absolute inset-0 -top-2 -left-8 rotate-90">
                    <img
                        src={arrow}
                        alt="arrow"
                        className="w-10 h-10 animate-bounce"
                    />
                </div>
            ) : null}
            <img
                src={isActive ? withGun : sitting}
                className={cn(
                    isActive ? "hover:bg-red-400/80" : "hover:bg-gray-500/80",
                    "aspect-auto w-20 h-28 z-30"
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
