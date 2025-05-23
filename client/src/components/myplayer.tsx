import type { PlayerType } from "../types";
import playerImage from "../assets/sitting.png";

const MyPlayer = ({}: { player: PlayerType }) => {
    return (
        <div
            className={`w-full h-full flex items-start justify-center overflow-hidden rotate-180`}
        >
            <img
                src={playerImage}
                className="aspect-auto w-32 h-40"
            ></img>
        </div>
    );
};

export default MyPlayer;
