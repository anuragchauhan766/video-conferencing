import SocketContext from "@/context/SocketProvider";
import { useContext } from "react";

function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket)
    throw new Error("useSocket must be used within a SocketProvider");
  return socket;
}
export default useSocket;
