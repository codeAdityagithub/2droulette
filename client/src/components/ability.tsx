import { cn } from "@/lib/utils";
import type { AbilityType, PlayerType } from "../types";
import { useSocket } from "@/hooks/useSocket";
import { useState } from "react";
import StealAbilityDialog from "./stealAbility";

const Ability = ({
    ability,
    isMyAbility,
    isActivePlayer,
    abilityIndex,
    allPlayers,
}: {
    ability: AbilityType;
    isMyAbility: boolean;
    abilityIndex: number;
    isActivePlayer: boolean;
    allPlayers: PlayerType[];
}) => {
    const { socket } = useSocket();
    const [open, setOpen] = useState(false);

    const useStealAbility = (
        index: number,
        ownerId?: string,
        abilityIndex?: number
    ) => {
        socket.emit("use_ability", index, ownerId, abilityIndex);
    };
    const useAbility = (
        index: number,
        ownerId?: string,
        abilityIndex?: number
    ) => {
        // ownerId if steal ability
        if (ability.abilityName === "StealAbility") {
            setOpen(true);
        } else {
            socket.emit("use_ability", index);
        }
    };

    return (
        <>
            <div
                onClick={() => {
                    if (!isMyAbility) return;
                    useAbility(abilityIndex);
                }}
                title={ability.abilityName}
                className={cn(
                    isMyAbility && isActivePlayer
                        ? "bg-green-300/80 hover:bg-green-300 transition-colors"
                        : "bg-gray-400",
                    "w-10 h-10 overflow-hidden border-2 rotate-180 rounded-md"
                )}
            >
                <img
                    src={"/" + ability.abilityName + ".png"}
                    alt={ability.abilityName}
                    className="w-full h-full aspect-auto "
                />
            </div>
            <StealAbilityDialog
                useAbility={useStealAbility}
                ownAbilityIndex={abilityIndex}
                open={open}
                setOpen={setOpen}
                allPlayers={allPlayers}
            />
        </>
    );
};

export default Ability;
