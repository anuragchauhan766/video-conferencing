import logger from "@repo/logger";

import { createWorker } from "mediasoup";
import { config } from "./config";
import { Worker } from "mediasoup/node/lib/Worker";
import { Router } from "mediasoup/node/lib/Router";

const workers: Array<{ worker: Worker, router: Router }> = []

const initializeWorkers = async () => {
  const worker = await createWorker({
    logLevel: config.mediasoup.worker.logLevel,
    logTags: config.mediasoup.worker.logTags,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
  });
  worker.on("died", () => {
    logger.error("mediasoup worker died, exiting in 2 seconds...")
    setTimeout(() => process.exit(1), 2000);
  });

  const router = await worker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs });
  workers.push({ worker, router });
  return router;
}

export { initializeWorkers, workers }