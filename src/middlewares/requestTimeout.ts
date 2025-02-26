import { Request, Response, NextFunction } from 'express';

export const requestTimeout = (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(60000, () => {
        console.warn('⏳ Tempo limite atingido para a requisição.');
        res.status(504).json({ error: 'Tempo limite atingido. Tente novamente mais tarde.' });
    });
    next();
};
