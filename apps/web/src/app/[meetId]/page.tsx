"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import useSocket from "@/lib/hook/useSocket";
import { socketEvents } from "@repo/shared/constant";
import { Peer, MediaConnection } from "peerjs";

interface PageProps {
  params: { meetId: string };
}

interface RemoteStream {
  peerId: string;
  stream: MediaStream;
}

const Page: React.FC<PageProps> = ({ params }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState<string>("");
  const currentUserVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);
  const socket = useSocket();

  const [joinedUsers, setJoinedUsers] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [activeCalls, setActiveCalls] = useState<{
    [key: string]: MediaConnection;
  }>({});

  const handleGetJoinedUsers = useCallback(
    (data: string[]) => {
      const users = data.filter((user) => user !== currentUserId);
      setJoinedUsers(users);
    },
    [currentUserId],
  );

  useEffect(() => {
    socket.emit(socketEvents.GETLISTOFUSERS, { meetId: params.meetId });
    socket.on(socketEvents.GETLISTOFUSERS, handleGetJoinedUsers);
    return () => {
      socket.off(socketEvents.GETLISTOFUSERS, handleGetJoinedUsers);
    };
  }, [socket, params.meetId, handleGetJoinedUsers]);

  useEffect(() => {
    const peer = new Peer({ debug: 3 });

    peer.on("open", (id: string) => {
      setCurrentUserId(id);
    });

    peer.on("call", async (call: MediaConnection) => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (currentUserVideoRef.current) {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
      }

      call.answer(mediaStream);
      call.on("stream", (remoteStream: MediaStream) => {
        setRemoteStreams((prev) => [
          ...prev.filter((s) => s.peerId !== call.peer),
          { peerId: call.peer, stream: remoteStream },
        ]);
      });

      setActiveCalls((prevCalls) => ({
        ...prevCalls,
        [call.peer]: call,
      }));
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
      Object.values(activeCalls).forEach((call) => call.close());
    };
  }, []);

  const handleUserJoined = useCallback(
    (data: { allUsers: string[] }) => {
      const users = data.allUsers.filter((user) => user !== currentUserId);
      setJoinedUsers(users);
      users.forEach((user) => {
        if (!activeCalls[user]) {
          call(user);
        }
      });
    },
    [currentUserId, activeCalls],
  );

  useEffect(() => {
    socket.on(socketEvents.USERJOINED, handleUserJoined);
    return () => {
      socket.off(socketEvents.USERJOINED, handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  const call = async (remotePeerId: string) => {
    if (activeCalls[remotePeerId]) return; // Avoid calling the same peer multiple times

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (currentUserVideoRef.current) {
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play();
    }

    const call = peerInstance.current?.call(remotePeerId, mediaStream);

    if (call) {
      call.on("stream", (remoteStream: MediaStream) => {
        setRemoteStreams((prev) => [
          ...prev.filter((s) => s.peerId !== remotePeerId),
          { peerId: remotePeerId, stream: remoteStream },
        ]);
      });

      setActiveCalls((prevCalls) => ({
        ...prevCalls,
        [remotePeerId]: call,
      }));
    }
  };

  return (
    <div className="flex-1 w-full h-full min-h-screen p-4">
      <h1 className="text-2xl mb-4">Current user id: {currentUserId}</h1>
      <div className="mb-4">
        <h2 className="text-xl mb-2">Join or Add Users to Meeting</h2>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg mb-2">Available Users to Join</h3>
            <div className="flex flex-wrap gap-2">
              {joinedUsers.map((user) => (
                <Button key={user} onClick={() => call(user)} className="mb-2">
                  Join {user}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg mb-2">Add User to Meeting</h3>
            <input
              type="text"
              value={remotePeerIdValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRemotePeerIdValue(e.target.value)
              }
              placeholder="Enter User ID to Add"
              className="mr-2 p-2 border rounded"
            />
            <Button onClick={() => call(remotePeerIdValue)}>Add User</Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="relative">
          <video
            ref={currentUserVideoRef}
            muted
            autoPlay
            playsInline
            className="w-full h-auto"
          />
          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">
            You
          </span>
        </div>
        {remoteStreams.map((remoteStream) => (
          <div key={remoteStream.peerId} className="relative">
            <video
              autoPlay
              playsInline
              className="w-full h-auto"
              ref={(ref) => {
                if (ref) ref.srcObject = remoteStream.stream;
              }}
            />
            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">
              {remoteStream.peerId}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
