-- pass ip address,timestamp,windows(ms),limit
local key=KEYS[1];
local timestamp=tonumber(ARGV[1]);
local window=tonumber(ARGV[2]);
local limit=tonumber(ARGV[3]);

-- remove old entries
redis.call('ZREMRANGEBYSCORE', key ,'-inf',timestamp-window)

-- count the last 60 sec request
local count=redis.call('ZCOUNT',key,timestamp-window,'+inf')

if count<limit then
    -- add current request
    -- .. represent string concatenation
    redis.call('ZADD', key, timestamp, tostring(timestamp) .. ":" .. tostring(math.random()))
    -- set expiry
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
else
    return 0
end

