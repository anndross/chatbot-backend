import { Request, Response } from "express";

import { AuthRequest } from "@/middlewares/Auth.middleware.ts";
import { sendAnswerToSheets } from "@/services/chat/sendAnswerToSheets.ts";
import { AskToLLM } from "@/services/chat/ask-to-llm/index.ts";
import { getProductDataAsVector } from "@/services/chat/vectorizer-product-data/index.ts";
import { getHostName } from "@/utils/getHostName.ts";
import {
  cacheProductData,
  getCachedProductData,
} from "@/services/chat/vectorizer-product-data/cache";

export async function chatController(
  req: Request,
  res: Response
): Promise<void> {
  const { question, conversationId, slug } = req.body;

  const { name, host, platformName } = (req as AuthRequest).customer || {};

  if (!platformName) {
    res
      .status(500)
      .json({ error: "O cliente não tem uma plataforma definida." });
    return;
  }

  if (!host) {
    res.status(500).json({ error: "O cliente não tem um host definido." });
    return;
  }

  if (!conversationId || !question) {
    res.status(400).json({
      error: "É necessário passar todos os dados (question e conversationId).",
    });
    return;
  }

  try {
    const hostName = getHostName(host);

    const cacheProductDataKey = `${platformName}-${hostName}-${slug}`;

    const cachedProductData = await getCachedProductData(cacheProductDataKey);

    let productDataAsVector: string[] = [];

    if (!cachedProductData) {
      productDataAsVector =
        (await getProductDataAsVector(platformName, hostName, slug)) || [];

      await cacheProductData(cacheProductDataKey, productDataAsVector);
    } else {
      productDataAsVector = cachedProductData;
    }

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

    sendAnswerToSheets(name || host, question, textStore);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocorreu um erro interno" });
  }
}
