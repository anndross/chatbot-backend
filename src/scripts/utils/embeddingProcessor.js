import { platforms } from "../../platforms/index.js";
import { getPlatform } from '../../platforms/context.js';
import { addProductEmbeddings, searchRelevantInfo } from "./langchainClient.js";
import { countTokens } from "./countTokens.js";

export async function searchMeaningfulInfos(question, productData) {
    const platformName = getPlatform();
    const texts = platforms[platformName].splitProductData(productData);

    // Adicionar os embeddings do produto no LangChain
    await addProductEmbeddings(texts);
    console.log("🔍 Dados do produto adicionados ao banco vetorial!");

    // Buscar os trechos mais relevantes da pergunta
    const selectedTexts = await searchRelevantInfo(question);
    console.log("🔍 Selected texts:", selectedTexts);

    // Contar tokens depois da filtragem
    const tokensAfter = countTokens(selectedTexts);
    console.log(`✅ Tokens after filtering: ${tokensAfter}`);

    return selectedTexts;
}

export async function processInfoForChat(question, productJsonData) {
    const meaningfulInfo = await searchMeaningfulInfos(question, productJsonData);

    // Contar tokens enviados para a OpenAI
    const tokensSent = countTokens(meaningfulInfo);
    console.log(`🚀 Tokens sent to OpenAI: ${tokensSent}`);

    return meaningfulInfo;
}
