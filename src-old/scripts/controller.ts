import { Request, Response } from "express";

import { askToLLM } from "../services/askToLLM";
import { platforms } from "../platforms/index";
import { processInfoForChat } from "./utils/embeddingProcessor";
import { setPlatform } from "../platforms/context";
import axios from "axios";

export async function controller(req: Request, res: Response) {
  const { question, slug, storeName, platformName, conversationId } = req.body;

  console.log("req.url", req.url);

  if (!conversationId) {
    return res
      .status(400)
      .json({ error: "É necessário fornecer um conversationId." });
  }
  if (!conversationId) {
    return res
      .status(400)
      .json({ error: "É necessário fornecer um conversationId." });
  }

  if (!slug && process.env.NODE_ENV === "production") {
    return res.status(400).json({ error: "Slug do produto é obrigatório." });
  }
  if (!slug && process.env.NODE_ENV === "production") {
    return res.status(400).json({ error: "Slug do produto é obrigatório." });
  }

  if (!platformName || !platforms[platformName]) {
    return res
      .status(400)
      .json({ error: "Plataforma inválida ou não suportada." });
  } else {
    setPlatform(platformName);
  }
  if (!platformName || !platforms[platformName]) {
    return res
      .status(400)
      .json({ error: "Plataforma inválida ou não suportada." });
  } else {
    setPlatform(platformName);
  }

  // Obtém informações do produto
  const productDetails = await platforms[platformName].getProductData(
    storeName,
    slug
  );

  // Processar informações essenciais do produto
  const meaningfulInfo = await processInfoForChat(question, productDetails);

  // Agora chamamos a função que faz a requisição à OpenAI,
  // passando o histórico de conversas (para manter contexto)
  const responseText = await askToLLM(
    meaningfulInfo,
    question,
    storeName,
    slug,
    conversationId
  );

  if (!responseText)
    return res.json({ error: "Erro ao processar sua solicitação." });

  let textBuffer = ""; // Armazena o buffer completo em string

  for await (const chunk of responseText) {
    const chunkContent = chunk.choices[0]?.delta?.content;
    console.log("chunkContent:", chunkContent);

    textBuffer += chunkContent || "";

    const rgxToGetOnlyFinalResponseContent = new RegExp(
      /"final_response"\s*:\s*"\w*/
    );

    const match = textBuffer.match(rgxToGetOnlyFinalResponseContent);

    if (match && !textBuffer.match(/",/)) {
      res.write(chunkContent?.replace('":"', "").replace(/\n/g, "<br/>") || "");
    }
  }

  res.write(textBuffer);

  // Enviar a resposta ao google sheets
  axios.post(
    "https://script.google.com/macros/s/AKfycbyf4YdU6A0EP-hP44A9y-nEy4QyeTjsErKK8yP6KePlTlMJiIgA1fzHmfL3sNOfr4-C/exec",
    {
      store: storeName,
      question: question,
      answer:
        typeof textBuffer === "string" &&
        textBuffer.replace(/(<([^>]+)>)/gi, ""),
    }
  );

  res.end();
}
