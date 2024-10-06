"use client";
import { MyAccount } from "@/components/Auth/MyAccount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSocket from "@/lib/hook/useSocket";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { socketEvents } from "@repo/shared/constant";
import { useRouter } from "next/navigation";

export default function Home() {
  const [meetingCode, setMeetingCode] = useState("");
  const router = useRouter();
  const socket = useSocket();
  const handleCreateNewMeeting = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("create new meeting");
    socket.emit(socketEvents.STARTMEETING, {
      meetId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
    });
  };
  const handleMeeting = (data: any) => {
    console.log("meeting started", data);
    router.push(`/${data.meetId}`);
  };
  useEffect(() => {
    socket.on(socketEvents.STARTMEETING, handleMeeting);
    socket.on(socketEvents.JOINMEETING, handleMeeting);

    return () => {
      socket.off(socketEvents.STARTMEETING, handleMeeting);
      socket.off(socketEvents.JOINMEETING, handleMeeting);
    };
  }, [socket]);

  const handleJoinMeeting = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("join meeting with code: ", meetingCode);
    socket.emit(socketEvents.JOINMEETING, {
      meetId: meetingCode,
      userId: crypto.randomUUID(),
    });
    setMeetingCode("");
  };
  return (
    <div className="flex flex-col min-h-screen max-w-screen-xl w-full ">
      <header className="h-20  w-full">
        <nav className="flex h-full w-full justify-between items-center px-6 py-2">
          <div className="font-bold text-2xl">
            <Link href="/">Meet Now</Link>
          </div>
          <div>
            <MyAccount />
          </div>
        </nav>
      </header>
      <main className="flex-1 flex  flex-col items-center justify-center w-full">
        <h1 className="text-4xl font-bold mb-4">Meet, Connect, Collaborate</h1>
        <h2 className="text-2xl mb-8 font-semibold">
          Where Every Face Finds Its Place
        </h2>
        <div className="flex items-center justify-center gap-4 w-full">
          <Button onClick={handleCreateNewMeeting}>Create a New Meeting</Button>
          <div className="flex itesms-center gap-4 justify-center">
            <Input
              placeholder="Enter a Code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <Button onClick={handleJoinMeeting}>Join</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
