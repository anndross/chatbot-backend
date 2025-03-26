// Função para buscar os trechos mais relevantes do produto com base na pergunta
export async function searchRelevantInfo(
  openaiEmbeddings: any,
  vectorStore: any,
  question: string,
  topK: number = 15
): Promise<string> {
  const embeddingQuestion: number[] = await openaiEmbeddings.embedQuery(
    question
  );

  const results: [{ pageContent: string }, number][] =
    await vectorStore.similaritySearchVectorWithScore(embeddingQuestion, topK);

  return results.map((res) => res[0].pageContent).join(" ");
}

export async function searchMeaningfulInfos(question: string): Promise<string> {
  const selectedTexts: string = await searchRelevantInfo(question);

  return selectedTexts;
}

export async function processInfoForChat(
  question: string,
  productJsonData: any
): Promise<string> {
  const meaningfulInfo: string = await searchMeaningfulInfos(
    question,
    productJsonData
  );

  return meaningfulInfo;
}
