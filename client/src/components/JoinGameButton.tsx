import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEffect } from "react";
import { Input } from "./ui/input";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

export default function JoinGameButton({
    title,
    withFriends,
}: {
    title: string;
    withFriends: boolean;
}) {
    const [name, setName] = useState<null | string>(null);

    const [tempName, setTempName] = useState("");
    const [gameId, setGameId] = useState("");

    const { socket } = useSocket();
    let hasJoined = false;

    useEffect(() => {
        let temp = localStorage.getItem("name");

        if (temp && temp.trim() !== "") {
            setName(temp);
        }
    }, []);

    const handleName = () => {
        if (tempName.trim() == "" || tempName.trim().length < 3) return;

        localStorage.setItem("name", tempName);
        setName(tempName);
    };
    const joinGame = () => {
        if (hasJoined) return;
        socket.emit("join", name, withFriends);
        hasJoined = true;
    };

    return (
        <>
            {name ? (
                withFriends ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">{title}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Create or Join a Game
                                </AlertDialogTitle>
                            </AlertDialogHeader>
                            <Input
                                onChange={(e) => setGameId(e.target.value)}
                                type="text"
                                required
                                minLength={3}
                                placeholder="Please Enter Game Id"
                            ></Input>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction
                                    disabled={hasJoined}
                                    onClick={(e) => {
                                        if (
                                            !gameId ||
                                            gameId.length != 36 ||
                                            !name
                                        ) {
                                            toast("Invalid Game Id", {
                                                classNames: {
                                                    toast: "!bg-red-400",
                                                },
                                            });
                                            e.preventDefault();
                                            return;
                                        }
                                        hasJoined = true;
                                        socket.emit("join_game", name, gameId);
                                    }}
                                >
                                    Join Game
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            <h2 className="font-bold text-center">OR</h2>
                            <Button
                                disabled={hasJoined}
                                onClick={joinGame}
                            >
                                Create a new Room
                            </Button>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <Button
                        variant="outline"
                        disabled={hasJoined}
                        onClick={joinGame}
                    >
                        {title}
                    </Button>
                )
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">{title}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Please Enter Your Name:
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <Input
                            onChange={(e: any) => setTempName(e.target.value)}
                            type="text"
                            required
                            minLength={3}
                            placeholder="please enter your name"
                        ></Input>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleName}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}
