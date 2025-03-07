require('dotenv').config();

import axios from 'axios';

interface Product {
    id: string;
    quantity: number;
    seller: string;
}

export async function addToCart(product: Product, orderFormId: string, storeName: string): Promise<boolean> {
    const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;
    const finalUrl = `https://${storeNameContent}.myvtex.com/api/checkout/pub/orderForm/${orderFormId}/items`;

    console.log('🔍 Full URL', finalUrl);

    try {
        const response = await axios.post(finalUrl, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            orderItems: [product]
        });

        if (!response.data) {
            console.error(`❌ Erro ao adicionar o produto para a loja: ${storeNameContent}`);
            return false;
        }

        // Retorna os dados do produto com a tipagem correta baseada na plataforma
        return true;
    } catch (error: any) {
        console.error(`Erro ao adicionar o produto para a loja: ${storeNameContent}`, error.response?.data || error.message);
        return false;
    }
}