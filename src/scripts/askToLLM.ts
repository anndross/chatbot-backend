import { OpenAI } from "openai/index.mjs";
// import { GoogleGenerativeAI } from "@google/generative-ai";

import { addMessage, getConversation } from "./utils/conversationHistoryController.js";

import { Message } from "./utils/conversationHistoryController.js";

import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const openRouter = new OpenAI({ 
//     baseURL: "https://openrouter.ai/api/v1", 
//     apiKey: process.env.OPENROUTER_API_KEY
// });

// 🔥 Função principal para chamar a IA
export async function askToLLM(
    meaningfulInfo: string, 
    question: string, 
    storeName: string, 
    slug: string, 
    conversationId: string
): Promise<string> {
    // Adiciona a pergunta do usuário ao histórico
    addMessage(conversationId, {
        role: "user",
        content: question
    });
    
    const conversationHistory: Message[] = getConversation(conversationId);

    const systemInstructions: Message = {
        role: "system", 
        content: `
            You are an assistant that answers questions about products based only on the following details: ${meaningfulInfo}

            - Your response must always be formatted exclusively in valid HTML. No Markdown, plain text, or any other format—only raw HTML tags.
            - Whenever you want to emphasize text in bold, use <strong>text</strong>.
            - If you need to return a list, use <ul> for unordered lists or <ol> for ordered lists, with each item inside <li>.
            - Always structure paragraphs inside <p>.
            - You MUST NOT include triple backticks like (\`\`\`html or \`\`\`).
            - Under no circumstances should you generate a response in any format other than pure HTML.

            ### **About reasoning:**
            - You **CANNOT** invent information that is not in the provided product details.
            If you found any product details that closely match the question, use that information without the "missing information" text.
            - However, you may **infer** or provide general recommendations based on what you know (for example, general washing instructions for cotton items), clearly indicating that it is a suggestion based on general knowledge rather than confirmed data from the provided details.
            - If the question concerns durability, material, color compatibility, or washing instructions, use the available details to give the best possible answer. If those details are insufficient, provide general advice based on your knowledge, making it clear that it is not confirmed by the provided details.
            - If the user asks for something that depends on information not contained in the product details, state that the specific information was not found, but offer a suggestion based on your general knowledge, always clarifying that it is a general recommendation or inference.

            ### **About calculation instructions:**
            - If the user requests a calculation (e.g., how many products are needed to cover a certain area), use the provided details and/or user input to perform the calculation.
            - Present the final result in valid HTML, following the same formatting rules (such as using <p> for paragraphs).
            - Do not reveal your internal step-by-step reasoning; only provide the final result (and minimal explanatory text if necessary) in HTML.
            - Only give the aswer if the context is clearly about the product.


            ### **How to handle missing information:**
            - If you found any product details that closely match the question, use that information without the "missing information" text.
            - If the requested information is not found in the provided product details, respond in this format:
            "<p>Ops! Não achei essa informação nos detalhes do produto, mas com base no que sei, posso sugerir algo:</p>"
            - Provide relevant insights **based on the available details**.
            - If no useful insight is possible, respond with "<p>Ops! Não tenho essa informação, mas posso tentar ajudar com outra dúvida sobre o produto.</p>"

            Keep your answers short, direct, and helpful. Remember: responses must always be in pure HTML, with no additional formatting.
        ` 
    }

    const messages: Message[] = [systemInstructions, ...conversationHistory]

    try {
        // Opção com a openrouter:
        // openRouter.chat.completions.create

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.5,
            response_format: { "type": "text" },
            max_completion_tokens: 500,
            presence_penalty: 0.3,
            messages,
        });

        if (!completion.choices || completion.choices.length === 0) {
            console.error("Resposta inesperada do LLM:", completion);
            return "Desculpe, não conseguir obter sua resposta no momento, sera que você pode tentar mais tarde?.";
        }

        console.log("Resposta do OpenRouter:", completion);
        const responseText: string = completion.choices[0].message.content || "";
        const cleanedResponse = responseText.replace(/```html|```/g, "").trim();

        // Adiciona a resposta do assistente ao histórico
        addMessage(conversationId, {
            role: "assistant",
            content: cleanedResponse
        });


        return responseText || "Ops! Não achei essa informação, mas posso tentar responder outra pergunta sobre o produto.";
    } catch (error: any) {
        console.error("❌ Erro ao chamar o modelo de LLM escolhido:", error);

        if (error.response?.data) {
            console.error("📄 Resposta do LLM escolhido:", error.response.data);
        }

        return "Desculpe, não conseguir obter sua resposta no momento, sera que você pode tentar mais tarde?.";
    }
}