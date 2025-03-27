import { Request, Response } from "express";

import { AuthRequest } from "@/middlewares/Auth.middleware";
import { sendAnswerToSheets } from "@/services/chat/sendAnswerToSheets";
import { AskToLLM } from "@/services/chat/ask-to-llm";
import { getProductDataAsVector } from "@/services/chat/vectorizer-product-data";
import { sendOnlyTheAnswerChunkToClient } from "@/services/chat/sendOnlyTheAnswerChunkToClient";

export async function chatController(req: Request, res: Response) {
  const { question, conversationId } = req.body;

  const { pathname } = new URL(req.url);

  const { name, platformName } = (req as AuthRequest).customer || {};

  if (!platformName) {
    return res
      .status(500)
      .json({ error: "O cliente não tem uma plataforma definida." });
  }

  if (!name) {
    return res
      .status(500)
      .json({ error: "O cliente não tem um nome definido." });
  }

  if (!conversationId || !question) {
    return res.status(400).json({
      error: "É necessário passar todos os dados (question e conversationId).",
    });
  }

  try {
    const productDataAsVector =
      (await getProductDataAsVector(platformName, name, pathname)) || [];

    const askToLLM = new AskToLLM(
      question,
      conversationId,
      productDataAsVector
    );

    const streamAnswer = await askToLLM.getStreamAnswer();

    if (!streamAnswer) throw new Error("Não houve resposta do chat.");

    let textStore = ""; // Armazena o buffer completo em string

    for await (const chunk of streamAnswer) {
      sendOnlyTheAnswerChunkToClient(chunk, textStore, res);
    }

    // Envia a resposta para o cliente após estar completa.
    // Envia o json com as actions.
    res.write(textStore);

    sendAnswerToSheets(name, question, textStore);

    res.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Ocorreu um erro interno" });
  }
}
