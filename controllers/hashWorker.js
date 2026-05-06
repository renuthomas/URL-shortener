import {workerData,parentPort} from "worker_threads"
import crypto from "node:crypto";

const hash=crypto.createHash('sha256')
                .update(JSON.stringify(workerData))
                .digest('hex');

parentPort.postMessage({
    sha256:hash
})