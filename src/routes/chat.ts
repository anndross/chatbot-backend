import express, { Request, Response} from "express";
import { controller } from '@/scripts/controller';

const router = express.Router();

router.post('/api/chat', async (req: Request, res: Response) => {
    try {
        await controller(req, res);
    } catch (error) {
        console.error('Erro na rota /api/chat:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao processar sua solicitação.' });
    }
});

export default router;
