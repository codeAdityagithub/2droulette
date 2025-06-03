// MatchmakingLobby.tsx
import React, { useEffect, useState } from "react";
import person1 from "../assets/person1.png";
import { useSocket } from "@/hooks/useSocket";
import person2 from "../assets/person2.png";
import person3 from "../assets/person3.png";
import person4 from "../assets/person4.png";
import { useLoaderData, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const images = {
    0: person1,
    1: person2,
    2: person3,
    3: person4,
};

const MatchmakingLobby: React.FC = () => {
    const { socket, id } = useSocket();
    const params = useParams();
    const match = useLoaderData();
    const [person, setPerson] = useState<
        { name: string; position: number; id: string }[]
    >([]);
    const navigate = useNavigate();
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        socket.emit("getMatchMaking");
        const handlePersons = (
            allPersons: { name: string; position: number; id: string }[]
        ) => {
            setPerson(allPersons);
        };
        let timeout: any;
        const handleStart = (gameId: string) => {
            setIsStarted(true);
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
    }, [socket]);

    function copyToClipboard(text: string) {
        toast("Copied to Clipboard");
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log("Copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    }

    return (
        <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-10">
                <h1 className="text-4xl font-extrabold tracking-widest text-yellow-400 animate-pulse">
                    🎯 Matchmaking Lobby
                </h1>

                {match.isPrivate ? (
                    <>
                        <Button
                            title="Copy Link to Lobby"
                            size={"icon"}
                            variant={"secondary"}
                            onClick={() => {
                                if (params.gameId)
                                    copyToClipboard(params.gameId);
                            }}
                        >
                            <Copy />
                        </Button>
                        {person.length > 1 &&
                        person.find((p) => p.id === id)?.position === 0 ? (
                            <Button
                                variant={"secondary"}
                                disabled={isStarted}
                                onClick={() => {
                                    socket.emit("start_match");
                                }}
                            >
                                Start Match
                            </Button>
                        ) : null}
                    </>
                ) : null}
            </div>
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
