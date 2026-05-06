import {parentPort} from "worker_threads"
import crypto from "node:crypto";

parentPort.on('message',(data)=>{
    const hash=crypto.createHash('sha256')
                    .update(JSON.stringify(data))
                    .digest('hex');
    
    parentPort.postMessage({
        sha256:hash
    })

})