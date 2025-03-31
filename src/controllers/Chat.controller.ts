import { Request, Response } from "express";

import { AuthRequest } from "@/middlewares/Auth.middleware.ts";
import { sendAnswerToSheets } from "@/services/chat/sendAnswerToSheets.ts";
import { AskToLLM } from "@/services/chat/ask-to-llm/index.ts";
import { getProductDataAsVector } from "@/services/chat/vectorizer-product-data/index.ts";
import { getHostName } from "@/utils/getHostName.ts";

export async function chatController(
  req: Request,
  res: Response
): Promise<void> {
  const { question, conversationId, slug } = req.body;

  const { name, hostname, platformName } = (req as AuthRequest).customer || {};

  if (!platformName) {
    res
      .status(500)
      .json({ error: "O cliente não tem uma plataforma definida." });
    return;
  }

  if (!hostname) {
    res.status(500).json({ error: "O cliente não tem um hostname definido." });
    return;
  }

  if (!conversationId || !question) {
    res.status(400).json({
      error: "É necessário passar todos os dados (question e conversationId).",
    });
    return;
  }

  try {
    const productDataAsVector =
      (await getProductDataAsVector(
        platformName,
        getHostName(hostname),
        slug
      )) || [];

    const askToLLM = new AskToLLM(
      question,
      conversationId,
      productDataAsVector
    );

    const streamAnswer = await askToLLM.getStreamAnswer();

    if (!streamAnswer) throw new Error("Não houve resposta do chat.");

    let textStore = ""; // Armazena o buffer completo em string

    for await (const chunk of streamAnswer) {
      const chunkContent = chunk.choices[0]?.delta?.content;

      textStore += chunkContent || "";

      const rgxToGetOnlyFinalResponseContent = new RegExp(
        /"answer"\s*:\s*"\w*/
      );

      const isFinalResponse = textStore.match(rgxToGetOnlyFinalResponseContent);

      const isEndOfResponse = textStore.match(/",/);

      if (isFinalResponse && !isEndOfResponse) {
        res.write(
          chunkContent?.replace('":"', "").replace(/\n/g, "<br/>") || ""
        );
      }
    }

    // Envia a resposta para o cliente após estar completa.
    // Envia o json com as actions.
    res.write(textStore);

    sendAnswerToSheets(name || hostname, question, textStore);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocorreu um erro interno" });
  }
}
