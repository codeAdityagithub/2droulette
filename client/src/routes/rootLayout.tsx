import { Outlet } from "react-router";
import { socket } from "../core/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const RootLayout = () => {
    const [id, setId] = useState("");

    useEffect(() => {
        if (socket.disconnected) socket.connect();
        const getId = (id: string) => {
            setId(id);
        };
        socket.on("getId", getId);
        return () => {
            if (socket.connected) socket.disconnect();
            socket.off("getId", getId);
        };
    }, []);
    return (
        <div className="w-full h-svh bg-amber-50 flex justify-center items-center">
            <Button />
            <Outlet context={{ socket, id }} />
        </div>
    );
};

export default RootLayout;
