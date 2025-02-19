
import { platforms } from "../platforms/index.js";
import { setPlatform } from '../platforms/context.js';
import { askToLLM } from "./askToLLM.js";
import { processInfoForChat } from "./utils/embeddingProcessor.js";

export async function controller(req, res) {
    const { question, slug, storeName, platformName, conversationId } = req.body;
    
    if (!conversationId) {
        return res.status(400).json({ error: "É necessário fornecer um conversationId." });
    }

    if (!slug && process.env.NODE_ENV === "production") {
        return res.status(400).json({ error: "Slug do produto é obrigatório." });
    }

    if (!platformName || !platforms[platformName]) {
        return res.status(400).json({ error: "Plataforma inválida ou não suportada." });
    } else {
        setPlatform(platformName);
    }

    // Obtém informações do produto
    const productDetails = await platforms[platformName].getProductData(storeName, slug);

    // Processar informações essenciais do produto
    const meaningfulInfo = await processInfoForChat(question, productDetails);

    // Agora chamamos a função que faz a requisição à OpenAI,
    // passando o histórico de conversas (para manter contexto)
    const responseText = await askToLLM(meaningfulInfo, question, storeName, slug, conversationId);
    
    return res.json({ response: responseText });
}