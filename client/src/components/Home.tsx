import { Button } from "./ui/button";
import title from "../assets/title.png";
import bg from "../assets/bg.jpg";

import JoinGameButton from "./JoinGameButton";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useNavigate } from "react-router";
import type { PlayerType } from "@/types";
import GameOverDialog from "./GameOverDialog";

const Home: React.FC = () => {
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
                    <Button variant={"secondary"}>Play With Friends</Button>
                    <JoinGameButton />
                </div>
            </div>
        </div>
    );
};

export default Home;
