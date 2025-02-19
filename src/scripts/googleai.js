import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 Função para chamar o Gemini se o GPT falhar
export async function askGemini(productData, question) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
            Você é um assistente especializado em responder perguntas sobre produtos com base apenas nestes detalhes: 
            ${JSON.stringify(productData)}.
            - Você **NÃO** pode inventar respostas.
            - Se a resposta não estiver nos detalhes do produto, você **DEVE** responder exatamente com: "Desculpe, mas ainda não tenho essa informação :("
            - Seja breve e objetivo.

            Pergunta: ${question}
        `;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 🔥 Timeout de 45 segundos

        const result = await model.generateContent(prompt, { signal: controller.signal });

        clearTimeout(timeoutId);

        const response = result.response;
        return response.text() || "Desculpe, houve um erro ao obter a resposta.";
    } catch (error) {
        console.error("❌ Erro ao chamar Gemini AI:", error);
        return "Desculpe, houve um erro ao obter a resposta do Gemini.";
    }
}