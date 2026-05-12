import express from "express";
import { urlRouter } from "./routes/urls.routes.js";
import { rateLimiterObj } from "./utils/redis/initRateLimiter.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { pool } from "./utils/database.utils.js";

const app=express();
const PORT=process.env.PORT ||3000;

await rateLimiterObj.loadScript();

app.set('trust proxy',true);
app.use(express.json());
app.use(rateLimiter);

app.use("/api/urls",urlRouter);

app.use((err, req, res, next) => {
    console.log(err);
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});

const server=app.listen(PORT,()=>{
    console.log(`Server is runnning in port ${PORT}`);
})

// catches synchronous throws not caught anywhere
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    
    server.close(() => {
        pool.end().finally(() => process.exit(1));
    });

    // force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000).unref();
});

// catches unhandled Promise rejections
process.on('unhandledRejection',(reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => {
        pool.end().finally(() => process.exit(1));
    });

    // force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000).unref();
});