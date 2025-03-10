import { addProductEmbeddings, searchRelevantInfo } from './langchainClient';

import { countTokens } from './countTokens';
import { getPlatform } from '@/platforms/context';
import { platforms } from '@/platforms/index';

export async function searchMeaningfulInfos(question: string, productData: any): Promise<string> {
    const platformName: string = getPlatform();

    const texts: string[] = platforms[platformName] && platforms[platformName].splitProductData(productData);

    // Adicionar os embeddings do produto no LangChain
    await addProductEmbeddings(texts);
    console.log('🔍 Dados do produto adicionados ao banco vetorial!');

    // Buscar os trechos mais relevantes da pergunta
    const selectedTexts: string = await searchRelevantInfo(question);
    console.log('🔍 Question: ', question);
    console.log('🔍 Selected texts:', selectedTexts);

    // Contar tokens depois da filtragem
    const tokensAfter: number = countTokens(selectedTexts);
    console.log(`✅ Tokens after filtering: ${tokensAfter}`);

    return selectedTexts;
}

export async function processInfoForChat(question: string, productJsonData: any): Promise<string> {
    const meaningfulInfo: string = await searchMeaningfulInfos(question, productJsonData);

    // Contar tokens enviados para a OpenAI
    const tokensSent: number = countTokens(meaningfulInfo);
    console.log(`🚀 Tokens sent to OpenAI: ${tokensSent}`);

    return meaningfulInfo;
}
