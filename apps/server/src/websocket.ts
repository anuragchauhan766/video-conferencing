import { Socket } from "socket.io";
import { initializeWorkers } from "./mediasoup";
import logger from "@repo/logger";
import { socketEvents } from "@repo/shared/constant";

export const handleSocket = async (socket: Socket) => {
    logger.info("New connection established with client. Socket Id: " + socket.id)
    const mediaSoupRouter = await initializeWorkers();

    socket.on(socketEvents.ROUTERTPCAPABILITY, (data) => {
        if (logger.isDebugEnabled()) {
            logger.debug(`socket Event: ${socketEvents.ROUTERTPCAPABILITY}`)
        }
        socket.emit(socketEvents.ROUTERTPCAPABILITY, mediaSoupRouter.rtpCapabilities);
    })
}