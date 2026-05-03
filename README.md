# URL Shortener Service

A high-performance URL shortener designed for low-latency redirects, efficient caching, and scalable analytics.

---

## Features

- Fast URL redirection
- Rate limiting to prevent abuse
- In-memory analytics buffering
- Redis-based caching
- Collision-free short URL generation using Base62

---

## Setup Instructions

### 1. Clone the Repository

```
git clone <your-repo-url>  
cd url-shortener
```

### 2. Install Dependencies
```
npm install
```
### 3. Configure Environment Variables

Create a `.env` file:

```
PORT=3000  
DB_URL=<your-database-url>  
REDIS_URL=<your-redis-url>  
RATE_LIMIT=10  
WINDOW_SIZE=60  
```

### 4. Start Required Services

Make sure the following services are running:

- Database (PostgreSQL)
- Redis

### 5. Run the Application
```
npm start
```
---

## Design Decisions

### 1. Rate Limiting Algorithm — Sliding Window over Fixed Window

- Chose sliding window (Redis sorted sets, ZADD/ZCOUNT) over fixed window (Redis INCR/EXPIRE)
- Fixed window allows burst attacks at window boundaries  
  Example: A client can make 10 requests at 11:59 and 10 more at 12:00, effectively sending 20 requests in 2 seconds while staying within the per-minute limit
- Sliding window prevents this by counting requests in a true rolling 60-second window

**Tradeoff:**

- Slightly higher Redis memory usage per IP, as each request stores a timestamped member instead of a single counter

**Decision:**

- Acceptable because the abuse prevention is worth the marginal memory cost

---

### 2. Analytics Buffer

- Chose writing analytics data to the database every 2 seconds instead of on every redirect

**Why:**

- Writing to DB every time introduces I/O wait time, slowing down redirects
- Pushing to an in-memory buffer is faster and synchronous

**Tradeoff:**

- If the process crashes, up to 2 seconds of click data may be lost

---

### 3. Redis for Caching

- Used Redis for caching short URL → original URL mappings

**Why:**

- Reading from DB every time leads to unnecessary I/O operations
- Cache access is faster than database reads

**Fallback:**

- When Redis is down, data is read from the database

**Observed Tradeoff:**

- Before adding Redis:
  - 5,132 req/sec at 9.24 ms latency
- After adding Redis:
  - 4,540 req/sec at 10.52 ms latency

**Reason:**

- The database was local and indexed, making it fast
- Redis introduced:
  - Extra network hop
  - Redis client promise overhead

---

### 4. Base62 Encoding for Shortening Algorithm

- Chose Base62 encoding because it is collision-free when using auto-generated database IDs

**Why:**

- Ensures uniqueness without additional checks

**Alternatives Considered:**

- UUID:
  - Solves the chicken-and-egg problem
  - Produces longer URLs
- Random code generation:
  - Does not guarantee uniqueness
  - Requires database checks, adding extra I/O

---

## Benchmark Results

| Scenario        | Throughput (req/sec) | Latency  |
|----------------|----------------------|----------|
| Without Redis  | 5,132 req/sec        | 9.24 ms  |
| With Redis     | 4,540 req/sec        | 10.52 ms |
---

## Observations

- Performance slightly decreased after adding Redis
- Causes:
  - Additional network hop
  - Redis client overhead
- Local database with indexing was already highly efficient

---

## Takeaways

- Redis is beneficial in production environments where:
  - The database is remote
  - The system is read-heavy
  - Horizontal scaling is required

---

## Future Improvements

- Distributed rate limiting
- Persistent analytics queue (Kafka or similar)
- Smarter cache invalidation strategies
- Horizontal scaling

---

## Tech Stack

- Node.js
- Redis
- PostgreSQL
- Base62 Encoding
