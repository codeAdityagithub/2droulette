import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import type { PlayerType } from "@/types";
import person1 from "../assets/person1.png";
import person2 from "../assets/person2.png";
import person3 from "../assets/person3.png";
import person4 from "../assets/person4.png";

const playerImages = [person1, person2, person3, person4];
const GameOverDialog = ({ winner }: { winner: PlayerType | null }) => {
    const [open, setOpen] = useState(true);
    useEffect(() => {
        if (winner != null) {
            setOpen(true);
        }
    }, [winner]);
    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger
                asChild
                className="hidden"
            >
                <Button>
                    Game Info <Info size={20} />
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="Winner of the game">
                <DialogHeader>
                    <DialogTitle>
                        Winner of the game was {winner?.playerName}
                    </DialogTitle>
                </DialogHeader>
                <img
                    src={playerImages[winner?.position ?? 0]}
                    alt="Winner image"
                    className="w-full h-full"
                />
            </DialogContent>
        </Dialog>
    );
};

export default GameOverDialog;
