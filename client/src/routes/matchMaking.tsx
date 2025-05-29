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
        let timeout: any;
        const handleStart = (gameId: string) => {
            const toastId = toast("Game is about to start in 3 seconds");

            setTimeout(() => {
                toast("Game is about to start in 2 seconds", { id: toastId });
            }, 1000);
            setTimeout(() => {
                toast("Game is about to start in 1 second", { id: toastId });
            }, 2000);

            timeout = setTimeout(() => {
                navigate("/game/" + gameId);
                toast.dismiss(toastId);
                toast("Match Started", { richColors: true });
            }, 3000);
        };
        const handleFail = () => {
            clearTimeout(timeout);

            navigate("/");
        };
        socket.on("matchMaking", handlePersons);
        socket.on("matchmaking_failed", handleFail);
        socket.on("start_match", handleStart);
        return () => {
            clearTimeout(timeout);
            socket.off("matchMaking", handlePersons);
            socket.off("matchmaking_failed", handleFail);
            socket.off("start_match", handleStart);
        };
    }, []);

    return (
        <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-10 tracking-widest text-yellow-400 animate-pulse">
                🎯 Matchmaking Lobby
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
                {person.map(({ name, position }) => (
                    <div
                        key={position}
                        className="flex flex-col items-center bg-white/5 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl hover:scale-105 hover:border-yellow-500 transition duration-300"
                    >
                        <div className="relative mb-4">
                            <img
                                // @ts-expect-error
                                src={images[position]}
                                alt={name}
                                className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-lg"
                            />
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-black animate-ping"></div>
                        </div>
                        <h2 className="text-xl font-bold text-yellow-300">
                            {name}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchmakingLobby;
