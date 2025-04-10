import { Request, Response } from "express";

import { AuthRequest } from "@/middlewares/Auth.middleware.ts";
// import { sendAnswerToSheets } from "@/third-parties/sendAnswerToSheets";
import { AskToLLM } from "@/services/chat/ask-to-llm/index.mcp.ts";
import { getProductDataAsVector } from "@/services/chat/vectorizer-product-data/index.ts";
import { getHostName } from "@/utils/getHostName.ts";
import {
  cacheProductData,
  getCachedProductData,
} from "@/services/chat/vectorizer-product-data/cache";
// import { UAParser } from "ua-parser-js";

export async function chatController(
  req: Request,
  res: Response
): Promise<void> {
  const { question, slug } = req.body;

  const { name, host, platformName } = (req as AuthRequest).customer || {};

  if (!platformName) {
    res
      .status(400)
      .json({ error: "O cliente não tem uma plataforma definida." });
    return;
  }

  if (!host) {
    res.status(400).json({ error: "O cliente não tem um host definido." });
    return;
  }

  if (!question) {
    res.status(400).json({
      error: "É necessário passar a question.",
    });
    return;
  }

  try {
    const hostName = getHostName(host);
    console.log("hostName", hostName);
    const askToLLM = new AskToLLM(question, platformName, hostName, slug);
    await askToLLM.setup();

    res.setHeader("Access-Control-Expose-Headers", "X-Thread-Id");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Thread-Id": askToLLM.getThreadId() || "",
    });

    await askToLLM.getStreamAnswer(res);

    // const { browser, device, os } = UAParser(req.headers["user-agent"]);

    // const deviceType = device?.type || "";
    // const browserNameWithVersion = `${browser?.name} ${browser?.version || ""}`;
    // const osNameWithVersion = `${os?.name} ${os?.version || ""}`;

    // sendAnswerToSheets(
    //   name || host,
    //   question,
    //   textStore,
    //   slug,
    //   deviceType,
    //   browserNameWithVersion,
    //   osNameWithVersion
    // );
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Ocorreu um erro interno" });
    } else {
      res.end("Ocorreu um erro no servidor.");
    }
  }
}
