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

const GameOverDialog = ({ winner }: { winner: PlayerType | null }) => {
    const [open, setOpen] = useState(false);
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
            <DialogContent aria-describedby="Number of active and empty rounds">
                <DialogHeader>
                    <DialogTitle>
                        Winner of the game was {winner?.playerName}
                    </DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default GameOverDialog;
