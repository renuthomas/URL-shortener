import cluster from "node:cluster";
import os from "node:os";

if (cluster.isPrimary) { 
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running. Forking ${numCPUs} workers...`);

  // Fork workers for each core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
  });
} else {
  import("./app.js");

  console.log(`Worker ${process.pid} started`);
}
