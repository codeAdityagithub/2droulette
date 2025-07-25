import { Outlet, useLocation } from "react-router";
import { socket } from "../core/socket";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const RootLayout = () => {
    const [id, setId] = useState("");
    const location = useLocation();
    const prevLocation = useRef("");

    useEffect(() => {
        if (
            prevLocation.current.includes("matchmaking") &&
            !location.pathname.includes("matchmaking") &&
            !location.pathname.includes("game")
        ) {
            socket.emit("removeFromMatch");
            toast("Match-Making failed", {
                classNames: {
                    toast: "!bg-red-400",
                },
            });
        }
        if (
            prevLocation.current.includes("game") &&
            !location.pathname.includes("game")
        ) {
            socket.emit("removeFromMatch");
        }
        prevLocation.current = location.pathname;
    }, [location]);

    useEffect(() => {
        if (socket.disconnected) socket.connect();
        const getId = (id: string) => {
            setId(id);
        };
        socket.on("getId", getId);
        return () => {
            socket.off("getId", getId);
            if (socket.connected) socket.disconnect();
        };
    }, []);
    return (
        <div className="w-full h-svh bg-amber-50 flex justify-center items-center">
            <Toaster
                richColors
                position="top-center"
            />
            <Outlet context={{ socket, id }} />
        </div>
    );
};

export default RootLayout;
