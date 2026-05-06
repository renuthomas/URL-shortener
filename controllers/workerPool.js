import { Worker } from 'worker_threads';
import os from 'os';

class WorkerPool {
    constructor(workerFile) {
        this.workerFile = workerFile;
        this.poolSize = os.cpus().length - 1;
        this.freeWorkers = [];
        this.pendingTasks = [];
        this.initialize();
    }

    initialize() {
        // create poolSize workers, add to freeWorkers
        for(let i=0;i<this.poolSize;i++){
            const worker=new Worker(this.workerFile);
            this.freeWorkers.push(worker);
        }
    }

    runTask(data) {
        return new Promise((resolve, reject) => {
            // if free worker available, run immediately
            // else push to pendingTasks with resolve/reject
            if(this.freeWorkers.length>0){
                this.assignTask(this.freeWorkers.pop(),data,resolve,reject);
            }else{
                this.pendingTasks.push({data,resolve,reject});
            }
        });
    }


    assignTask(worker, data, resolve, reject) {
        // send data to worker
        // listen for message/error
        // on completion, check pendingTasks queue

        const onMessage=(result)=>{
            resolve(result);
            cleanup();

            if(this.pendingTasks.length>0){
                const {data,resolve,reject}=this.pendingTasks.shift();
                this.assignTask(worker,data,resolve,reject);
            }else{
                this.freeWorkers.push(worker);
            }
        }

        const onError=(result)=>{
            reject(result);
            cleanup();
            if(this.pendingTasks.length>0){
                const {data,resolve,reject}=this.pendingTasks.shift();
                this.assignTask(worker,data,resolve,reject);
            }else{
                this.freeWorkers.push(worker);
            }
        }


        const cleanup=()=>{
            worker.removeAllListeners('message');
            worker.removeAllListeners('error');
        }

        worker.postMessage(data);
        worker.on('message',onMessage);
        worker.on('error',onError);
    }
}

export {WorkerPool};