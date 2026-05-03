import {rateLimiterObj} from "../utils/redis/initRateLimiter.js";


const rateLimiter=async(req,res,next)=>{
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp=Date.now();
    try {
        console.log(clientIp);
        const sanitizedIp = clientIp.replace(/:/g, '_'); 
        const key = `rate_limit:${sanitizedIp}`;
        const allow=await rateLimiterObj.callRateLimiter(key,timestamp,60000,10);
        if(allow){
            return next();
        }else{
            res.set('Retry-After','60');
            return res.status(429).json({message:"Too many request. Please try again later"});
        }
    } catch (error) {
        console.error('Rate limiter error:',error);
        return next();
    }
}

export {rateLimiter};