// MatchmakingLobby.tsx
import React, { useEffect, useState } from "react";
import person1 from "../assets/person1.png";
import { useSocket } from "@/hooks/useSocket";
import person2 from "../assets/person2.png";
import person3 from "../assets/person3.png";
import person4 from "../assets/person4.png";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const images = {
    0: person1,
    1: person2,
    2: person3,
    3: person4,
};

const MatchmakingLobby: React.FC = () => {
    const { socket } = useSocket();
    const [person, setPerson] = useState<{ name: string; position: number }[]>(
        []
    );
    const navigate = useNavigate();
    useEffect(() => {
        socket.emit("getMatchMaking");
        const handlePersons = (
            allPersons: { name: string; position: number }[]
        ) => {
            setPerson(allPersons);
        };
        const handleStart = (gameId: string) => {
            const toastId = toast("Game is about to start in 3 seconds");

            setTimeout(() => {
                toast("Game is about to start in 2 seconds", { id: toastId });
            }, 1000);
            setTimeout(() => {
                toast("Game is about to start in 1 second", { id: toastId });
            }, 2000);

            setTimeout(() => {
                navigate("/game/" + gameId);
                toast.dismiss(toastId);
                toast("Match Started", { richColors: true });
            }, 3000);
        };
        const handleFail = () => {
            toast("Match-Making failed", {
                classNames: {
                    toast: "!bg-red-400",
                },
            });
            navigate("/");
        };
        socket.on("matchMaking", handlePersons);
        socket.on("matchmaking_failed", handleFail);
        socket.on("start_match", handleStart);
        return () => {
            socket.off("matchMaking", handlePersons);
            socket.off("matchmaking_failed", handleFail);
            socket.off("start_match", handleStart);
        };
    }, []);

    return (
        <div className="w-full h-full bg-background flex flex-col items-center py-10">
            <h1 className="text-3xl font-bold mb-8">Matchmaking Lobby</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {person.map(({ name, position }) => (
                    <div
                        key={position}
                        className="flex flex-col items-center bg-white rounded-lg shadow-md p-4"
                    >
                        <img
                            // @ts-expect-error
                            src={images[position]}
                            alt={name}
                            className="w-24 h-24 rounded-full mb-2"
                        />
                        <h2 className="text-lg font-semibold">{name}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchmakingLobby;
