import { OpenAI } from 'openai';
import dotenv from 'dotenv';

import { getSystemInstructions } from './llmConfigs';

import { addMessage, getConversation } from '../scripts/utils/conversationHistoryController';
import { Message } from '../scripts/utils/conversationHistoryController';

import { responseSchema, ResponseSchema, notReleatedResponse, errorResponse } from '../scripts/utils/responseSchema';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askToLLM(meaningfulInfo: string, question: string, storeName: string, slug: string, conversationId: string): Promise<ResponseSchema | string> {
    // Adiciona a pergunta do usuário ao histórico
    addMessage(conversationId, {
        role: 'user',
        content: question,
    });

    const conversationHistory: Message[] = getConversation(conversationId);
    const messages: Message[] = [getSystemInstructions(meaningfulInfo, storeName), ...conversationHistory];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.3,
            max_completion_tokens: 500,
            presence_penalty: 0.3,
            messages,
            response_format: {
                type: "json_schema",
                json_schema: {
                  name: "ecommerce_assistant",
                  strict: true,
                  schema: responseSchema
                }
            },
        });

        if (!completion.choices || completion.choices.length === 0) {
            console.error('Resposta inesperada do LLM:', completion);
            return errorResponse;
        }

        const llmResponseString: string = completion.choices[0].message.content || '';
        const llmResponseJson: ResponseSchema = JSON.parse(llmResponseString);
        const messageToUser: string = llmResponseJson.final_response || '';
        const cleanedResponseToUser = messageToUser.replace(/```html|```/g, '').trim();

        // Adiciona a resposta parseada do assistente ao histórico
        addMessage(conversationId, {
            role: 'assistant',
            content: cleanedResponseToUser,
        });

        // Retorna a resposta em JSON para o front-end
        return llmResponseJson || notReleatedResponse;
    } catch (error: any) {
        console.error('❌ Erro ao chamar o modelo de LLM escolhido:', error);

        if (error.response?.data) {
            console.error('📄 Resposta do LLM escolhido:', error.response.data);
        }

        return errorResponse;
    }
}
