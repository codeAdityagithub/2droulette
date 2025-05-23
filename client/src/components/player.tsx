import type { PlayerType } from "../types";
import playerImage from "../assets/sitting.png";

type Position = "top" | "left" | "right";

const Player = ({ position }: { player: PlayerType; position: Position }) => {
    const angle =
        position === "top"
            ? ""
            : position === "left"
            ? "-rotate-90"
            : "rotate-90";

    return (
        <div
            className={`w-full h-full flex items-start justify-center overflow-hidden ${angle}`}
        >
            <img
                src={playerImage}
                className="aspect-auto w-32 h-40"
            ></img>
        </div>
    );
};

export default Player;
