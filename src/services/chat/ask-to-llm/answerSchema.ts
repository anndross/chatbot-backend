export const answerSchema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "string",
        enum: ["add_to_cart", "see_more", "recommend_product"],
      },
      additionalItems: false, // 🚀 Evita erros de schema inválido
    },
    recommended_products: {
      type: "array",
      items: {
        type: "string",
        additionalProperties: false, // 🚀 Evita erros de schema inválido
      },
    },
  },
  required: ["answer", "actions", "recommended_products"],
  additionalProperties: false, // 🚀 Evita que o modelo adicione campos extras
};

export const errorResponse = {
  final_response:
    "Desculpe, não conseguir obter sua resposta no momento, sera que você pode tentar mais tarde?.",
  actions: [],
  recommended_products: [],
};

export const notReleatedResponse = {
  final_response:
    "Ops! Não achei essa informação, mas posso tentar responder outra pergunta sobre o produto.",
  actions: [],
  recommended_products: [],
};

export interface ResponseSchema {
  final_response: string;
  actions: string[];
  recommended_products: {
    id: string;
  }[];
}
