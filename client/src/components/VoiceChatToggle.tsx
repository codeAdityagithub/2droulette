import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../hooks/useSocket";
import type { PlayerType } from "@/types";
import { Button } from "./ui/button";

type UseVoiceChatOptions = {
    otherPlayers: PlayerType[] | null;
    myPlayer: PlayerType | undefined;
};

export default function VoiceChatToggle({
    otherPlayers,
    myPlayer,
}: UseVoiceChatOptions) {
    const peersRef = useRef<{ [id: string]: SimplePeer.Instance }>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{
        [peerId: string]: MediaStream;
    }>({});
    const [enabled, setEnabled] = useState(false);
    const localAudioRef = useRef<HTMLAudioElement>(null);
    const { socket } = useSocket();
    const onPeerStream = (peerId: string, stream: MediaStream) => {
        setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    };
    const onPeerDisconnect = (peerId: string) => {
        setRemoteStreams((prev) => {
            const { [peerId]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleSignal = ({
        sourceId,
        signal,
    }: {
        sourceId: string;
        signal: any;
    }) => {
        if (!otherPlayers || !localStreamRef.current || !myPlayer) return;

        let peer = peersRef.current[sourceId];
        if (!peer) {
            const otherPlayer = otherPlayers.find(
                (p) => p.playerId === sourceId
            );
            if (!otherPlayer) return;

            const isInitiator = otherPlayer.position > myPlayer.position;

            peer = createPeer(sourceId, localStreamRef.current, isInitiator);
            peersRef.current[sourceId] = peer;
        }
        peer.signal(signal);
    };

    const handleDisconnect = (id: string) => {
        if (peersRef.current[id]) {
            peersRef.current[id].destroy();
            delete peersRef.current[id];
            onPeerDisconnect?.(id);
        }
    };
    const cleanup = () => {
        Object.entries(peersRef.current).forEach(([id, peer]) => {
            peer.destroy();
            delete peersRef.current[id];
        });
        socket.off("signal", handleSignal);
        socket.off("user-disconnected", handleDisconnect);
    };

    const setupVoice = async () => {
        if (!otherPlayers || otherPlayers.length === 0 || !myPlayer) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            localStreamRef.current = stream;

            // Create peers for each player
            for (const player of otherPlayers) {
                if (!peersRef.current[player.playerId]) {
                    const isInitiator = player.position > myPlayer.position;
                    const peer = createPeer(
                        player.playerId,
                        stream,
                        isInitiator
                    );
                    console.log(
                        "Creating peer for",
                        player.position,
                        "as init:",
                        isInitiator
                    );
                    peersRef.current[player.playerId] = peer;
                }
            }
        } catch (err) {
            console.warn("Could not access mic", err);
        }
    };

    useEffect(() => {
        socket.on("signal", handleSignal);
        socket.on("user-disconnected", handleDisconnect);

        return cleanup;
    }, [socket, myPlayer, otherPlayers]); // ensure rerun only if player list actually changes

    const stop = () => {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        cleanup();
    };
    const toggle = () => {
        if (enabled) {
            stop();
            setEnabled(false);
        } else {
            setEnabled(true);
            setupVoice();
        }
    };

    function createPeer(
        peerId: string,
        stream: MediaStream,
        initiator: boolean
    ) {
        const peer = new SimplePeer({ initiator, trickle: false, stream });

        peer.on("signal", (signal) => {
            console.log(
                initiator ? "sending offer to " : "sending answer to",
                otherPlayers?.find((p) => p.playerId === peerId)?.position
            );
            socket.emit("signal", { targetId: peerId, signal });
        });
        peer.on("connect", () => {
            console.log(
                "connected to",
                otherPlayers?.find((p) => p.playerId === peerId)?.position
            );
        });
        peer.on("stream", (remoteStream) => {
            onPeerStream?.(peerId, remoteStream);
        });

        peer.on("close", () => {
            if (peersRef.current[peerId]) {
                delete peersRef.current[peerId];
                onPeerDisconnect?.(peerId);
            }
        });

        peer.on("error", (err) => {
            console.error(`Peer ${peerId} error:`, err);
        });

        return peer;
    }
    console.log(remoteStreams);
    return (
        <div className="fixed inset-0 z-50">
            <Button onClick={toggle}>
                {enabled ? "Stop Voice Chat" : "Start Voice Chat"}
            </Button>

            {/* Hidden local audio */}
            <audio
                ref={localAudioRef}
                autoPlay
                muted
            />

            {/* Render remote peers */}
            {Object.entries(remoteStreams).map(([id, stream]) => (
                <VoicePlayer
                    key={id}
                    stream={stream}
                />
            ))}
        </div>
    );
}

function VoicePlayer({ stream }: { stream: MediaStream }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current && stream) {
            audioRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <audio
            ref={audioRef}
            autoPlay
            playsInline
        />
    );
}
