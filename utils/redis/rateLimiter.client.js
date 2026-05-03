import fs from "fs";

class RateLimiterClient{
    constructor(redisClient,luaPath){
        this.redisClient=redisClient;
        this.luaPath=luaPath;
        this.sha=null;
    }

    async loadScript(){
        if(this.sha==null){
            const luaScript=fs.readFileSync(this.luaPath,'utf-8');
            this.sha=await this.redisClient.script('load',luaScript);
        }
    }

    async callRateLimiter(ip_address,timestamp,window,limit){
        try {
            return await this.redisClient.evalsha(this.sha,1,ip_address,timestamp,window,limit);
        } catch (error) {
            if(error.message.includes('NOSCRIPT')){
                await this.loadScript();
                return await this.callRateLimiter(ip_address,timestamp,window,limit);
            }else{
                throw error;
            }
        }
    }
}

export {RateLimiterClient}
