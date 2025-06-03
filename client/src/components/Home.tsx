import title from "../assets/title.png";
import bg from "../assets/bg.jpg";

import JoinGameButton from "./JoinGameButton";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";

const Home: React.FC = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        const handleRedirect = (gameId: string) => {
            toast("Game Joined", {
                classNames: {
                    toast: "!bg-green-300",
                },
            });
            navigate("/matchmaking/" + gameId);
        };
        socket.on("gameId", handleRedirect);
        return () => {
            socket.off("gameId", handleRedirect);
        };
    }, []);
    return (
        <div className="w-full h-full relative">
            <div className="absolute inset-0">
                <img
                    src={bg}
                    className="w-full h-full brightness-50"
                    alt="background"
                />
            </div>
            <div className="w-full h-full z-20 flex flex-col items-center justify-start min-h-screen bg-background text-foreground px-4">
                <div className="">
                    <img
                        src={title}
                        className="w-80 aspect-auto object-contain brightness-200"
                        alt="Russian Roulette"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 z-20">
                    <JoinGameButton
                        title="Play With Friends"
                        withFriends
                    />

                    <JoinGameButton
                        title="Solo Queue"
                        withFriends={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
