import { Request, Response } from "express";

import { askToLLM } from "../services/askToLLM";
import { platforms } from "@/platforms/index";
import { processInfoForChat } from "./utils/embeddingProcessor";
import { setPlatform } from "@/platforms/context";
import { AuthRequest } from "@/middleware/Auth.middleware";
import { sendAnswerToSheets } from "@/services/chat/sendAnswerToSheets";
import { getAnswer } from "@/services/chat/getAnswer";

export async function ChatController(req: AuthRequest, res: Response) {
  const { question, conversationId } = req.body;

  const { name, platformName } = req.customer;

  if (!platformName) {
    return res
      .status(500)
      .json({ error: "O cliente não tem uma plataforma definida." });
  }

  if (!conversationId || !question) {
    return res.status(400).json({
      error: "É necessário passar todos os dados (question e conversationId).",
    });
  }

  try {
    const answer = await getAnswer(question, conversationId);

    if (!answer) throw new Error("Não houve resposta do chat.");

    let textBuffer = ""; // Armazena o buffer completo em string

    for await (const chunk of answer) {
      const chunkContent = chunk.choices[0]?.delta?.content;

      textBuffer += chunkContent || "";

      const rgxToGetOnlyFinalResponseContent = new RegExp(
        /"final_response"\s*:\s*"\w*/
      );

      const isFinalResponse = textBuffer.match(
        rgxToGetOnlyFinalResponseContent
      );

      const isEndOfResponse = textBuffer.match(/",/);

      if (isFinalResponse && !isEndOfResponse) {
        res.write(
          chunkContent?.replace('":"', "").replace(/\n/g, "<br/>") || ""
        );
      }
    }

    res.write(textBuffer);

    sendAnswerToSheets(name, question, textBuffer);

    res.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Ocorreu um erro interno" });
  }
}
