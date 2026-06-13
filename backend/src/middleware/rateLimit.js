import rateLimit from 'express-rate-limit';

// Limits brute-force attempts on auth endpoints (login/register).
// 20 requests / 15 min per IP. Tune for your traffic.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later' } },
});

// Limits abuse of the public webhook endpoint (it has no JWT).
// 60 requests / minute per IP.
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Webhook rate limit exceeded' } },
});

// General API limiter applied to everything else.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
