import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../hooks/useSocket";
import type { PlayerType } from "@/types";
import { Button } from "./ui/button";
import { Mic, MicOff, Send, X } from "lucide-react";
import { Input } from "./ui/input";
import { formatTime } from "@/lib/utils";

type UseVoiceChatOptions = {
    otherPlayers: PlayerType[] | null;
    myPlayer: PlayerType | undefined;
};

type Message = {
    message: string;
    timestamp: number;
    from: string;
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const openRef = useRef<boolean>(false);
    useEffect(() => {
        openRef.current = open;
    }, [open]);
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
            peer.on("data", (chunk: Uint8Array) => {
                const message = JSON.parse(chunk.toString()) as Message;
                if (message) {
                    setMessages((prev) => [...prev, message]);
                }
                if (!openRef.current) {
                    setUnread((p) => p + 1);
                }
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

    const setupConnection = useCallback(async () => {
        if (!otherPlayers || !myPlayer || !localStreamRef.current) return;

        try {
            for (const player of otherPlayers) {
                if (!peersRef.current[player.playerId]) {
                    const isInitiator = player.position > myPlayer.position;
                    if (isInitiator) {
                        const peer = createPeer(
                            player.playerId,
                            localStreamRef.current,
                            false
                        );
                        console.log(
                            "created peer for ",
                            player.position,
                            "init false"
                        );
                        socket.emit("initiated", player.playerId);
                        peersRef.current[player.playerId] = peer;
                    }
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
                await setupConnection();
            }
            unmuteLocalStream();
            setEnabled(true);
        }
    }, [enabled, muteLocalStream, unmuteLocalStream, setupConnection]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
            })
            .then((stream) => {
                localStreamRef.current = stream;
                muteLocalStream();
            });

        return () => {
            leaveVoiceChat();
        };
    }, []);

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
        const initConnection = async () => {
            console.log("all connected, initiating process");
            await setupConnection();
        };
        const initiatePeer = (peerId: string) => {
            console.log(
                "peer is ready creating peer init true for ",
                otherPlayers?.find((p) => p.playerId === peerId)?.position,
                peersRef.current[peerId],
                localStreamRef.current
            );
            if (!peersRef.current[peerId] && localStreamRef.current) {
                const peer = createPeer(peerId, localStreamRef.current, true);
                peersRef.current[peerId] = peer;
            }
        };
        socket.emit("ready"); // for peer connection
        socket.on("init_connect", initConnection);
        socket.on("initiate_peer", initiatePeer);

        return () => {
            socket.off("signal", handleSignal);
            socket.off("user-disconnected", handleDisconnect);
            socket.emit("unready");
            socket.off("init_connect", initConnection);
            socket.off("initiate_peer", initiatePeer);
        };
    }, [
        socket,
        handleSignal,
        handleDisconnect,
        leaveVoiceChat,
        createPeer,
        setupConnection,
    ]);

    return (
        <>
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
            <div className="fixed right-8 bottom-8 z-50 drop-shadow-2xl">
                {open ? (
                    <>
                        <div className="empty:hidden w-sm h-full flex flex-col rounded p-2 gap-1 max-h-80 overflow-auto bg-background text-foreground">
                            <div
                                className="ml-auto w-8 h-6 bg-foreground text-background cursor-pointer flex items-center justify-center rounded"
                                title="Close Chat Window"
                                onClick={() => setOpen((p) => !p)}
                            >
                                <X />
                            </div>
                            {messages.map((message) => (
                                <div
                                    key={message.timestamp}
                                    className="bg-accent p-2 rounded"
                                >
                                    <p className="text-accent-foreground">
                                        {message.message}
                                    </p>
                                    <div className="text-xs text-muted-foreground flex justify-between">
                                        <span className="">{message.from}</span>
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 ? (
                                <p className="text-center text-muted-foreground">
                                    Chat with others to see messages...
                                </p>
                            ) : null}
                        </div>
                        <form
                            className="w-full bg-background rounded-md"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const message = // @ts-expect-error
                                    e.currentTarget[0].value as string;
                                if (
                                    !message ||
                                    message.trim().length == 0 ||
                                    !myPlayer
                                ) {
                                    e.currentTarget.reset();
                                    return;
                                }
                                setMessages((p) => [
                                    ...p,
                                    {
                                        message: message,
                                        timestamp: Date.now(),
                                        from: "You",
                                    },
                                ]);
                                e.currentTarget.reset();
                                for (const id in peersRef.current) {
                                    if (peersRef.current[id].connected) {
                                        const time = Date.now();
                                        peersRef.current[id].send(
                                            JSON.stringify({
                                                message: message,
                                                timestamp: time,
                                                from: myPlayer.playerName,
                                            })
                                        );
                                    }
                                }
                            }}
                        >
                            <div className="flex items-center justify-center">
                                <Input
                                    className="rounded-r-none"
                                    placeholder="Enter a message"
                                    type="text"
                                    name="message"
                                    required
                                />
                                <Button
                                    size={"icon"}
                                    className="rounded-l-none"
                                >
                                    <Send />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <Button
                        onClick={() => {
                            setOpen((p) => !p);
                            setUnread(0);
                        }}
                        className="relative"
                    >
                        Chat Messages
                        {unread > 0 ? (
                            <span className="absolute -top-1 -right-1 text-white font-semibold bg-green-700 rounded-full h-5 w-5 flex items-center justify-center">
                                {unread}
                            </span>
                        ) : null}
                    </Button>
                )}
            </div>
        </>
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
