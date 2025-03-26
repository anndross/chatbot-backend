import { OpenAI } from "openai";
import dotenv from "dotenv";

import { getSystemInstructions } from "./llmConfigs";

import {
  addMessage,
  getConversation,
} from "../scripts/utils/conversationHistoryController";
import { Message } from "../scripts/utils/conversationHistoryController";

import {
  responseSchema,
  ResponseSchema,
  notReleatedResponse,
  errorResponse,
} from "../scripts/utils/responseSchema";
import { Stream } from "openai/streaming.mjs";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askToLLM(
  meaningfulInfo: string,
  question: string,
  storeName: string,
  slug: string,
  conversationId: string
): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | null> {
  // Adiciona a pergunta do usuário ao histórico
  addMessage(conversationId, {
    role: "user",
    content: question,
  });

  const conversationHistory: Message[] = getConversation(conversationId);
  const messages: Message[] = [
    getSystemInstructions(meaningfulInfo, storeName),
    ...conversationHistory,
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_completion_tokens: 500,
      presence_penalty: -1.0,
      stream: true, // Habilita streaming
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ecommerce_assistant",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    // const llmResponseString: string = completion.choices[0].message.content || '';
    // const llmResponseJson: ResponseSchema = JSON.parse(llmResponseString);
    // const messageToUser: string = llmResponseJson.final_response || '';
    // const cleanedResponseToUser = messageToUser.replace(/```html|```/g, '').trim();

    // // Adiciona a resposta parseada do assistente ao histórico
    // addMessage(conversationId, {
    //     role: 'assistant',
    //     content: cleanedResponseToUser,
    // });

    // Retorna a resposta em JSON para o front-end
    return response;
  } catch (error: any) {
    if (error.response?.data) {
      console.error("📄 Resposta do LLM escolhido:", error.response.data);
    }

    console.error("❌ Erro ao chamar o LLM:", error);
    return null;
  }
}
