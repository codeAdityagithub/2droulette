import { cn } from "@/lib/utils";
import type { AbilityType } from "../types";
import { useSocket } from "@/hooks/useSocket";

const Ability = ({
    ability,
    isMyAbility,
    isActivePlayer,
    abilityIndex,
}: {
    ability: AbilityType;
    isMyAbility: boolean;
    abilityIndex: number;
    isActivePlayer: boolean;
}) => {
    const { socket } = useSocket();
    const useAbility = (
        index: number,
        ownerId?: string,
        abilityIndex?: number
    ) => {
        // ownerId if steal ability
        if (ability.abilityName === "StealAbility") {
            console.log("Handle ability steal in frontend");
        }
        socket.emit("use_ability", index, ownerId, abilityIndex);
    };

    return (
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
    );
};

export default Ability;
