import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Função para obter detalhes do produto na VTEX
export async function getProductData(storeName, slug) {
    const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;
    const slugContent = slug || process.env.VTEX_LOCAL_SLUG;
    const finalUrl = `https://www.${storeNameContent}.com.br/api/catalog_system/pub/products/search/${slugContent}/p`;

    console.log("Full URL", finalUrl);

    try {
        const response = await axios.get(finalUrl, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });

        if (!response.data || response.data.length === 0) {
            console.error(`❌ Produto não encontrado para a loja: ${storeNameContent}, slug: ${slugContent}`);
            return null;
        }

        return response.data?.[0];
    } catch (error) {
        console.error(`Erro ao buscar informações do produto para a loja: ${storeNameContent}, slug: ${slugContent}`, error.response?.data || error.message);
        return null;
    }
}

