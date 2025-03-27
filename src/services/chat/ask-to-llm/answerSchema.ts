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
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false, // 🚀 Evita erros de schema inválido
      },
    },
  },
  required: ["answer", "actions", "recommended_products"],
  additionalProperties: false, // 🚀 Evita que o modelo adicione campos extras
};

export const errorResponse = {
  answer:
    "Desculpe, não conseguir obter sua resposta no momento, sera que você pode tentar mais tarde?.",
  actions: [],
  recommended_products: [],
};

export const notReleatedResponse = {
  answer:
    "Ops! Não achei essa informação, mas posso tentar responder outra pergunta sobre o produto.",
  actions: [],
  recommended_products: [],
};

export interface ResponseSchema {
  answer: string;
  actions: string[];
  recommended_products: {
    id: string;
  }[];
}
