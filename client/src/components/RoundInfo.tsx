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
import type { AbilityName } from "@/types";

const abilities: { name: AbilityName; description: string }[] = [
    { name: "DoubleBullet", description: "Deals Double Damage" },
    { name: "EjectBullet", description: " Ejects Current Round" },
    {
        name: "ReversePolarity",
        description: " Reverse the polarity of current Bullet",
    },
    { name: "SkipTurn", description: " Next players turn is skipped" },
    { name: "StealAbility", description: " Steal Someonelse's ability" },
];

const RoundInfo = ({
    currentRoundbulletinfo: { active, blank },
}: {
    currentRoundbulletinfo: { active: number; blank: number };
}) => {
    const [open, setOpen] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setOpen(false);
        }, 5000);
        return () => {
            clearTimeout(timeout);
        };
    }, []);
    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger
                asChild
                className="flex items-center justify-center gap-1 absolute top-8 right-8"
            >
                <Button>
                    Game Info <Info size={20} />
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="Number of active and empty rounds">
                <DialogHeader>
                    <DialogTitle>Number of active and empty rounds</DialogTitle>
                    <h3 className="font-bold">Active Rounds : {active}</h3>
                    <h3 className="font-bold">Empty Rounds : {blank}</h3>
                </DialogHeader>
                <h2>When you have the gun, click to shoot any player.</h2>
                <div className="w-full h-full flex flex-col gap-2">
                    {abilities.map(({ name, description }) => {
                        return (
                            <div
                                key={description}
                                className="w-full h-full bg-secondary p-2 rounded flex flex-row items-center justify-between gap-3"
                            >
                                <img
                                    src={`/${name}.png`}
                                    className="w-16 h-16 object-contain"
                                />
                                <div className="text-secondary-foreground">
                                    {description}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoundInfo;
