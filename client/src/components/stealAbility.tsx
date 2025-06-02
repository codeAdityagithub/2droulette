import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import type { PlayerType } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";

const StealAbilityDialog = ({
    open,
    setOpen,
    allPlayers,
    useAbility,
    ownAbilityIndex,
    isActivePlayer,
}: {
    setOpen: any;
    open: boolean;
    allPlayers: PlayerType[];
    ownAbilityIndex: number;
    useAbility: (index: number, ownerId: string, abilityIndex: number) => void;
    isActivePlayer: boolean;
}) => {
    const [ownerId, setOwnerId] = useState("");
    const [abilityIndex, stealAbilityIndex] = useState(-1);
    const { id } = useSocket();
    const handleClick = (ownerId: string, abilityIndex: number) => {
        setOwnerId(ownerId);

        stealAbilityIndex(abilityIndex);
    };

    const handleUse = () => {
        useAbility(ownAbilityIndex, ownerId, abilityIndex);
    };

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
                    <DialogTitle>Steal Ability of another player</DialogTitle>
                </DialogHeader>
                {allPlayers
                    .filter((player) => player.playerId != id && player.isAlive)
                    .map((player) => (
                        <div
                            key={player.playerId}
                            className="w-full h-full flex items-center justify-between flex-row gap-2"
                        >
                            <div>{player.playerName}</div>
                            <div className="flex gap-1">
                                {player.abilities.map((ability, index) => (
                                    <div
                                        onClick={() => {
                                            if (!isActivePlayer) return;
                                            handleClick(player.playerId, index);
                                        }}
                                        key={index}
                                        className={cn(
                                            "w-full h-full bg-secondary p-2 rounded cursor-pointer",
                                            abilityIndex === index &&
                                                player.playerId === ownerId
                                                ? "bg-green-300"
                                                : ""
                                        )}
                                    >
                                        <img
                                            src={`/${ability.abilityName}.png`}
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                <DialogFooter>
                    <DialogClose
                        onClick={() => {
                            stealAbilityIndex(-1);
                            setOwnerId("");
                        }}
                    >
                        Cancel
                    </DialogClose>
                    <DialogClose
                        disabled={ownerId === "" || abilityIndex == -1}
                        onClick={handleUse}
                    >
                        Steal Ability
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StealAbilityDialog;
