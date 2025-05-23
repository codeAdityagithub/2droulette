import { useOutletContext } from "react-router";
import type { SocketType } from "../core/socket";

export function useSocket() {
    return useOutletContext<{ socket: SocketType; id: string }>();
}
