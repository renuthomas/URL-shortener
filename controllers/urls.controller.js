import {pool} from "../utils/database.utils.js";
import { isURLValid } from "../utils/testUrls.utils.js";
import { base62encoding } from "../utils/base62.utils.js";
import redisClient from "../utils/redis/redis.utils.js";
import crypto from "crypto";


const clickBuffer=[];

const shortenURL=async(req,res)=>{
    console.log("in here");
    const {originalUrl}=req.body;
    
    if(isURLValid(originalUrl)){
        const client=await pool.connect();
        try {
            await client.query('BEGIN');
            const result=await client.query('INSERT INTO urls(short_code,original_url) values($1,$2) returning id',['placeholder',originalUrl]);
            const urlID=result.rows[0].id;
            const shortCode=base62encoding(urlID);
            await client.query('UPDATE urls set short_code=$1 where id=$2',[shortCode,urlID]);
            await client.query('COMMIT');
            res.status(201).json({shortCode:shortCode,shortUrl:`http://localhost:3000/${shortCode}`});
        } catch (error) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Rollback failed:',rollbackError);
            }
            if(error.code === '23505'){
                res.status(409).json({message:'Alias already exists'});
                return;
            }
            res.status(500).json({message:'Internal server error'});
        }finally{
            client.release();
        }
    }else{
        res.status(400).json({message:"It is an invalid URL"})
    }

}

const getURL=async(req,res)=>{
    const {shortCode}=req.params;
    const referrer=req.get('Referrer')|| 'Direct';
    const ip_address=req.ip|| req.headers['x-forwareded-for']|| req.socket.remoteAddress;
    const hashedIP=crypto.createHash('sha256').update(ip_address).digest('base64');
    const shortCodeRegex=/^[a-zA-Z0-9]{1,12}$/gm;
    if(!shortCodeRegex.test(shortCode)){
        return res.status(400).json({message:'Invalid short code format'});
    }

    const client=await pool.connect();
    try{
        try {
            const redisResult=await redisClient.get(`url:${shortCode}`);
            if(redisResult){
                const {urlId,originalURL}=JSON.parse(redisResult);
                clickBuffer.push({url_id:urlId,clicked_at:new Date(),referrer,ip_hash:hashedIP});
                res.set('Cache-Control','no-store, no-cache');
                return res.redirect(302,originalURL);
            }
        } catch (error) {
            console.log("Redis failed,falling to DB",error.message);
        }
        const result=await client.query('SELECT id,original_url,expires_at from urls where short_code=$1',[shortCode]);
        const url=result?.rows[0];
        const originalURL=url?.original_url;
        const id=url?.id;
        const ttl=url?.expires_at ? Math.floor((new Date(url.expires_at)-Date.now())/1000):86400;
        if (url?.expires_at && ttl <= 0) {
            return res.status(410).json({ message: 'URL has expired' });
        }
        if(originalURL){
            await redisClient.set(`url:${shortCode}`,JSON.stringify({urlId:id,originalURL}),'EX',ttl);
            clickBuffer.push({url_id:id,clicked_at:new Date(),referrer,ip_hash:hashedIP});
            res.set('Cache-Control','no-store, no-cache');
            return res.redirect(302,originalURL);
        }else{
            return res.status(404).json({message:'Original URL is not found for the shorten URL'});
        }
    }catch(err){
        console.error('Database error:',err);
        return res.status(500).json({message:'Internal server error'});
    }finally{

        client.release();
    }
}

const analytics = async (req, res) => {
    const { shortCode } = req.params;
    
    const shortCodeRegex = /^[a-zA-Z0-9]{1,12}$/;
    if (!shortCodeRegex.test(shortCode)) {
        return res.status(400).json({ message: 'Invalid short code format' });
    }

    const client = await pool.connect();
    try {
    
        const result = await client.query('SELECT urls.short_code,urls.created_at,urls.original_url, COUNT(clicks.clicked_at) as total_clicks FROM urls LEFT JOIN clicks ON urls.id = clicks.url_id WHERE urls.short_code = $1 GROUP BY urls.short_code, urls.created_at, urls.original_url', [shortCode]);
        const row = result.rows[0];
        if (!row) {
            return res.status(404).json({ message: 'The short code does not exist' });
        }

        return res.status(200).json({
            shortCode: row.short_code,
            originalUrl: row.original_url,
            totalClicks: row.total_clicks,
            createdAt: row.created_at
        });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

const flushClickBuffer=async()=>{
    if(clickBuffer.length==0) return;
    const toFlush = clickBuffer.splice(0, clickBuffer.length);
    const values=toFlush.map((click,i)=>`($${i*4+1},$${i*4+2},$${i*4+3},$${i*4+4})`).join(',');
    const params=toFlush.flatMap(click=>[click.url_id,click.clicked_at,click.referrer,click.ip_hash]);
    try{
        const client=await pool.connect();
        await client.query(`INSERT INTO clicks(url_id,clicked_at,referrer,ip_hash) VALUES ${values}`,params);
        client.release();
    }catch(error){
        console.error("Failed to flush click buffer:",error);
        // if failed to insert into DB, put the clicks back to buffer for next attempt
        clickBuffer.unshift(...toFlush);
    }
   
}
setInterval(flushClickBuffer,2000);



export {shortenURL,getURL,analytics};