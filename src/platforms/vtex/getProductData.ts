require('dotenv').config();

import { PlatformProductDataMap, ProductData } from '@/platforms/types';

import axios from 'axios';
import { getPlatform } from '@/platforms/context';
import { platforms } from '@/platforms/index';

// Função para obter detalhes do produto dinamicamente com base na plataforma selecionada
export async function getProductData<P extends keyof PlatformProductDataMap>(storeName?: string, slug?: string): Promise<ProductData<P> | null> {
    const platformName = getPlatform(); // Obtém a plataforma dinâmica (ex: "vtex", "shopify")

    if (!platforms[platformName]) {
        console.error(`❌ Plataforma "${platformName}" não suportada.`);
        return null;
    }

    const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;
    const slugContent = slug || process.env.VTEX_LOCAL_SLUG;
    const finalUrl = `https://${storeNameContent}.myvtex.com/api/catalog_system/pub/products/search/${slugContent}/p`;

    console.log('🔍 Full URL', finalUrl);

    try {
        const response = await axios.get(finalUrl, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        if (!response.data || response.data.length === 0) {
            console.error(`❌ Produto não encontrado para a loja: ${storeNameContent}, slug: ${slugContent}`);
            return null;
        }

        // Retorna os dados do produto com a tipagem correta baseada na plataforma
        return response.data?.[0] as ProductData<P>;
    } catch (error: any) {
        console.error(`Erro ao buscar informações do produto para a loja: ${storeNameContent}, slug: ${slugContent}`, error.response?.data || error.message);
        return null;
    }
}
