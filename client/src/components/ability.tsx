import type { AbilityType } from "../types";

const Ability = ({ ability }: { ability: AbilityType }) => {
    return (
        <div className="w-10 h-10 overflow-hidden border-2 rotate-180 bg-green-200/80 hover:bg-green-200 transition-colors rounded-md">
            <img
                src={"/" + ability.abilityName + ".png"}
                alt={ability.abilityName}
                className="w-full h-full aspect-auto "
            />
        </div>
    );
};

export default Ability;
