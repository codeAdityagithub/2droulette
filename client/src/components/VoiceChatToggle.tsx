import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../hooks/useSocket";
import type { PlayerType } from "@/types";
import { Button } from "./ui/button";
import { Mic, MicOff } from "lucide-react";

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
    const { socket } = useSocket();

    const signalBuffer = useRef<{ sourceId: string; signal: any }[]>([]);

    const muteLocalStream = useCallback(() => {
        if (!localStreamRef.current) return;

        localStreamRef.current?.getAudioTracks().forEach((t) => {
            t.enabled = false;
        });
        const silentTrack = localStreamRef.current.getTracks()[0];

        Object.values(peersRef.current).forEach((peer) => {
            // @ts-expect-error
            const pc = peer._pc as RTCPeerConnection;
            const sender = pc
                .getSenders()
                .find((s) => s.track?.kind === "audio");
            if (sender) {
                sender.replaceTrack(silentTrack);
            }
        });
    }, []);

    const unmuteLocalStream = useCallback(() => {
        if (!localStreamRef.current) return;

        localStreamRef.current?.getAudioTracks().forEach((t) => {
            t.enabled = true;
        });
        const realTrack = localStreamRef.current.getAudioTracks()[0];

        Object.values(peersRef.current).forEach((peer) => {
            // @ts-expect-error
            const pc = peer._pc as RTCPeerConnection;
            const sender = pc
                .getSenders()
                .find((s) => s.track?.kind === "audio");
            if (sender) {
                sender.replaceTrack(realTrack);
            }
        });
    }, []);

    const leaveVoiceChat = useCallback(() => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        Object.entries(peersRef.current).forEach(([id, peer]) => {
            peer.destroy();
            delete peersRef.current[id];
        });
        setRemoteStreams({});
    }, []);

    const onPeerStream = useCallback((peerId: string, stream: MediaStream) => {
        setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    }, []);

    const onPeerDisconnect = useCallback((peerId: string) => {
        setRemoteStreams((prev) => {
            const { [peerId]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    const createPeer = useCallback(
        (
            peerId: string,
            stream: MediaStream | undefined,
            initiator: boolean
        ) => {
            const peer = new SimplePeer({ initiator, trickle: false, stream });

            peer.on("signal", (signal) => {
                socket.emit("signal", { targetId: peerId, signal });
            });

            peer.on("stream", (remoteStream) => {
                onPeerStream(peerId, remoteStream);
            });
            peer.on("connect", () => {
                console.log(
                    "connected to",
                    otherPlayers?.find((p) => p.playerId === peerId)?.position
                );
            });
            peer.on("close", () => {
                delete peersRef.current[peerId];
                console.log(
                    "disconnected with",
                    otherPlayers?.find((p) => p.playerId === peerId)?.position
                );
                onPeerDisconnect(peerId);
            });

            peer.on("error", (err) => {
                console.error(`Peer ${peerId} error:`, err);
            });

            return peer;
        },
        [onPeerStream, onPeerDisconnect, socket]
    );

    const handleSignal = useCallback(
        ({ sourceId, signal }: { sourceId: string; signal: any }) => {
            if (!otherPlayers || !localStreamRef.current || !myPlayer) {
                signalBuffer.current.push({ sourceId, signal });
                return;
            }

            let peer = peersRef.current[sourceId];
            if (!peer) {
                const otherPlayer = otherPlayers.find(
                    (p) => p.playerId === sourceId
                );
                if (!otherPlayer) return;

                const isInitiator = otherPlayer.position > myPlayer.position;
                peer = createPeer(
                    sourceId,
                    localStreamRef.current,
                    isInitiator
                );
                peersRef.current[sourceId] = peer;
            }

            peer.signal(signal);
        },
        [otherPlayers, myPlayer, createPeer]
    );

    const handleDisconnect = useCallback(
        (id: string) => {
            if (peersRef.current[id]) {
                peersRef.current[id].destroy();
                delete peersRef.current[id];
                onPeerDisconnect(id);
            }
        },
        [onPeerDisconnect]
    );

    const setupVoice = useCallback(async () => {
        if (!otherPlayers || !myPlayer || localStreamRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            localStreamRef.current = stream;
            muteLocalStream();

            for (const player of otherPlayers) {
                if (!peersRef.current[player.playerId]) {
                    const isInitiator = player.position > myPlayer.position;
                    const peer = createPeer(
                        player.playerId,
                        localStreamRef.current,
                        isInitiator
                    );
                    peersRef.current[player.playerId] = peer;
                }
            }
        } catch (err) {
            console.warn("Could not access mic", err);
        }
    }, [otherPlayers, myPlayer, createPeer, muteLocalStream]);

    const toggle = useCallback(async () => {
        if (enabled) {
            muteLocalStream();
            setEnabled(false);
        } else {
            if (!localStreamRef.current) {
                await setupVoice();
            }
            unmuteLocalStream();
            setEnabled(true);
        }
    }, [enabled, muteLocalStream, unmuteLocalStream, setupVoice]);

    useEffect(() => {
        setupVoice();
    }, [setupVoice]);

    useEffect(() => {
        if (!otherPlayers || !myPlayer || !localStreamRef.current) return;

        // Flush buffered signals
        for (const { sourceId, signal } of signalBuffer.current) {
            handleSignal({ sourceId, signal });
        }
        signalBuffer.current = [];
    }, [otherPlayers, myPlayer, localStreamRef.current]);

    useEffect(() => {
        socket.on("signal", handleSignal);
        socket.on("user-disconnected", handleDisconnect);
        return () => {
            socket.off("signal", handleSignal);
            socket.off("user-disconnected", handleDisconnect);
            leaveVoiceChat();
        };
    }, [socket, handleSignal, handleDisconnect, leaveVoiceChat]);

    return (
        <div className="fixed left-8 bottom-8 z-50">
            <Button
                size="icon"
                onClick={toggle}
                title={enabled ? "Mute Your Mic" : "Unmute Your Mic"}
            >
                {enabled ? <Mic /> : <MicOff />}
            </Button>

            {/* Remote peer audio elements */}
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
