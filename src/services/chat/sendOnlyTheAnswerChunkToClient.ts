import { ChatCompletionChunk } from "openai/resources/index.mjs";
import { Response } from "express";

export function sendOnlyTheAnswerChunkToClient(
  chunk: ChatCompletionChunk,
  textStore: string,
  res: Response
) {
  const chunkContent = chunk.choices[0]?.delta?.content;

  textStore += chunkContent || "";

  const rgxToGetOnlyFinalResponseContent = new RegExp(/"answer"\s*:\s*"\w*/);

  const isFinalResponse = textStore.match(rgxToGetOnlyFinalResponseContent);

  const isEndOfResponse = textStore.match(/",/);

  if (isFinalResponse && !isEndOfResponse) {
    res.write(chunkContent?.replace('":"', "").replace(/\n/g, "<br/>") || "");
  }
}
