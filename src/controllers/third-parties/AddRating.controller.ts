import { AuthRequest } from "@/middlewares/Auth.middleware";
import { sendAnswerToSheets } from "@/third-parties/sendAnswerToSheets";
import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";

export const addRatingController = async (req: Request, res: Response) => {
  const { name, host } = (req as AuthRequest).customer || {};

  if (!host) {
    res.status(400).json({ error: "O cliente não tem um host definido." });
    return;
  }

  try {
    // Recebe a pergunta e resposta pelo body pois os dois vem do frontend.
    // A pergunta é sobre o que achou do produto e a resposta é retornada pelo cliente ao enviar a avaliação.
    const { question, answer, slug } = req.body;

    const { browser, device, os } = UAParser(req.headers["user-agent"]);

    const deviceType = device?.type || "";
    const browserNameWithVersion = `${browser?.name} ${browser?.version || ""}`;
    const osNameWithVersion = `${os?.name} ${os?.version || ""}`;

    const result = await sendAnswerToSheets(
      name || host,
      question,
      answer,
      slug,
      deviceType,
      browserNameWithVersion,
      osNameWithVersion
    );

    if (result?.ok) {
      res.status(200).json({ message: "Avaliação enviada com sucesso" });
    } else {
      throw new Error("Ocorreu um erro ao enviar a avaliação.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocorreu um erro interno" });
  }
};
