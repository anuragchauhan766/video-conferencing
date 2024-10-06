import { socketEvents } from "@repo/shared/constant";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import logger from "@repo/logger";
import { } from "mediasoup";
import { handleSocket } from "./websocket";

const app = express();
const httpServer = createServer(app);
const PORT = 5000;



const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
  /* options */
});


io.on("connection", handleSocket);

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});


