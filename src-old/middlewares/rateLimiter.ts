import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.ip || 'unknown',
    message: 'Você excedeu o limite de perguntas por minuto.',
    handler: (_req, res) => {
        res.status(429).json({
            message: 'Você excedeu o limite de perguntas por minuto.',
            resetTime: new Date(Date.now() + 60 * 1000).toISOString(),
        });
    },
});
