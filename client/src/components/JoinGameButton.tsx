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
import { useNavigate } from "react-router";
export default function JoinGameButton() {
    const [name, setName] = useState<null | string>(null);

    const [tempName, setTempName] = useState("");
    const { socket } = useSocket();
    let hasJoined = false;

    useEffect(() => {
        let temp = localStorage.getItem("name");

        if (temp && temp.trim() !== "") {
            setName(temp);
        }

        const handleRedirect = (gameId: string) => {
            toast("Game Joined", {
                richColors: true,
            });
            navigate("/matchmaking/" + gameId);
        };
        socket.on("gameId", handleRedirect);
        return () => {
            socket.off("gameId", handleRedirect);
        };
    }, []);
    const handleName = () => {
        if (tempName.trim() == "" || tempName.trim().length < 3) return;

        localStorage.setItem("name", tempName);
        setName(tempName);
    };
    const navigate = useNavigate();
    const joinGame = () => {
        if (hasJoined) return;
        socket.emit("join", name);
        hasJoined = true;
    };

    return (
        <>
            {name ? (
                <Button
                    variant="outline"
                    onClick={joinGame}
                >
                    Solo Queue
                </Button>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">Solo Queue</Button>
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
