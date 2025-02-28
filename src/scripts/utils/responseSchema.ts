export const responseSchema = {
    type: "object",
    properties: {
        final_response: { type: "string" },
        actions: {
            type: "array",
            items: { 
                type: "string",
                enum: ["add_to_cart", "see_more"]
            },
            additionalItems: false // 🚀 Evita erros de schema inválido
        },
        recommended_products: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    url: { type: "string" },
                    price: { type: "number" }
                },
                required: ["id", "name", "url", "price"],
                additionalProperties: false // 🚀 Evita erros de schema inválido
            }
        }
    },
    required: ["final_response", "actions", "recommended_products"],
    additionalProperties: false // 🚀 Evita que o modelo adicione campos extras
};

export const errorResponse = {
   final_response: "Desculpe, não conseguir obter sua resposta no momento, sera que você pode tentar mais tarde?.",
   actions: [],
   recommended_products: []
};

export const notReleatedResponse = {
    final_response: "Ops! Não achei essa informação, mas posso tentar responder outra pergunta sobre o produto.",
    actions: [],
    recommended_products: []
};

export interface ResponseSchema {
    final_response: string;
    actions: string[];
    recommended_products: {
        id: string;
        name: string;
        url: string;
        price: number;
    }[];
}