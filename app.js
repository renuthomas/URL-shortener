import express from "express";
import { urlRouter } from "./routes/urls.routes.js";
import { rateLimiterObj } from "./utils/redis/initRateLimiter.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";

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


app.listen(PORT,()=>{
    console.log(`Server is runnning in port ${PORT}`);
})