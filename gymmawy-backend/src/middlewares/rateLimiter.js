// Lightweight IP-based rate limiter to protect auth and general endpoints
const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 300);

const ipBuckets = new Map();

export function rateLimiter(req, res, next) {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = ipBuckets.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + WINDOW_MS;
    }
    bucket.count += 1;
    ipBuckets.set(ip, bucket);
    if (bucket.count > MAX_REQUESTS) {
      return res.status(429).json({ error: { message: "Too many requests" } });
    }
    res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, MAX_REQUESTS - bucket.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.floor(bucket.resetAt / 1000)));
    next();
  } catch (e) {
    next();
  }
}

