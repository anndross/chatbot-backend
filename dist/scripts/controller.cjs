var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/scripts/controller.ts
var controller_exports = {};
__export(controller_exports, {
  controller: () => controller
});
module.exports = __toCommonJS(controller_exports);

// src/platforms/vtex/getProductData.ts
var import_axios = __toESM(require("axios"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);

// src/platforms/context.ts
var currentPlatform = null;
function setPlatform(platformName) {
  currentPlatform = platformName;
}
function getPlatform() {
  if (!currentPlatform) throw new Error("Plataforma n\xE3o definida.");
  return currentPlatform;
}

// src/platforms/vtex/getProductData.ts
import_dotenv.default.config();
function getProductData(storeName, slug) {
  return __async(this, null, function* () {
    var _a, _b;
    const platformName = getPlatform();
    if (!platforms[platformName]) {
      console.error(`\u274C Plataforma "${platformName}" n\xE3o suportada.`);
      return null;
    }
    const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;
    const slugContent = slug || process.env.VTEX_LOCAL_SLUG;
    const finalUrl = `https://www.${storeNameContent}.com.br/api/catalog_system/pub/products/search/${slugContent}/p`;
    console.log("\u{1F50D} Full URL", finalUrl);
    try {
      const response = yield import_axios.default.get(finalUrl, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      if (!response.data || response.data.length === 0) {
        console.error(`\u274C Produto n\xE3o encontrado para a loja: ${storeNameContent}, slug: ${slugContent}`);
        return null;
      }
      return (_a = response.data) == null ? void 0 : _a[0];
    } catch (error) {
      console.error(
        `Erro ao buscar informa\xE7\xF5es do produto para a loja: ${storeNameContent}, slug: ${slugContent}`,
        ((_b = error.response) == null ? void 0 : _b.data) || error.message
      );
      return null;
    }
  });
}

// src/platforms/vtex/splitProductData.ts
function splitProductData(data, maxLength = 2e4) {
  const sections = [];
  const formatValue = (value) => typeof value === "string" ? value : JSON.stringify(value, null, 2).replace(/[\n\r]+/g, " ").replace(/\s+/g, " ");
  const addSection = (sectionLabel, content) => {
    let section = `${sectionLabel}: ${content}`;
    if (section.length > maxLength) {
      let warningMessage;
      if (sectionLabel.startsWith("Variation - ")) {
        warningMessage = `\u26A0\uFE0F A se\xE7\xE3o de varia\xE7\xE3o ${sectionLabel.replace(
          "Variation - ",
          ""
        )} foi truncada por exceder ${maxLength} caracteres.`;
      } else if (sectionLabel.startsWith("items[0].sellers[0].commertialOffer.")) {
        warningMessage = `\u26A0\uFE0F A se\xE7\xE3o ${sectionLabel} foi truncada por exceder ${maxLength} caracteres.`;
      } else {
        warningMessage = `\u26A0\uFE0F A propriedade ${sectionLabel} foi truncada por exceder ${maxLength} caracteres.`;
      }
      console.warn(warningMessage);
      section = section.slice(0, maxLength);
    }
    sections.push(section);
  };
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "items") {
      addSection(key, formatValue(value));
    } else {
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (firstItem && typeof firstItem === "object" && Array.isArray(firstItem.sellers) && firstItem.sellers.length > 0) {
          const firstSeller = firstItem.sellers[0];
          if (firstSeller && typeof firstSeller === "object" && firstSeller.commertialOffer && typeof firstSeller.commertialOffer === "object") {
            Object.entries(firstSeller.commertialOffer).forEach(
              ([coKey, coValue]) => {
                if (coKey === "PaymentOptions") return;
                if (coKey === "Installments" && Array.isArray(coValue)) {
                  const installmentsByPaymentSystem = {};
                  coValue.forEach((installment) => {
                    if (installment && typeof installment === "object" && installment.PaymentSystemName) {
                      installmentsByPaymentSystem[installment.PaymentSystemName] = installment;
                    }
                  });
                  const filteredInstallments = Object.values(
                    installmentsByPaymentSystem
                  );
                  addSection(
                    `items[0].sellers[0].commertialOffer.${coKey}`,
                    formatValue(filteredInstallments)
                  );
                } else {
                  addSection(
                    `items[0].sellers[0].commertialOffer.${coKey}`,
                    formatValue(coValue)
                  );
                }
              }
            );
          }
        }
      }
    }
  });
  if (Array.isArray(data.items) && data.items.length > 0) {
    const variationsAggregated = {};
    data.items.forEach((item) => {
      if (Array.isArray(item.variations)) {
        item.variations.forEach((variationKey) => {
          let variationValue = item[variationKey];
          if (variationValue !== void 0 && variationValue !== null) {
            variationValue = typeof variationValue === "string" ? variationValue.trim() : String(variationValue);
            if (!variationsAggregated[variationKey]) {
              variationsAggregated[variationKey] = /* @__PURE__ */ new Set();
            }
            variationsAggregated[variationKey].add(variationValue);
          }
        });
      }
    });
    Object.entries(variationsAggregated).forEach(
      ([variationKey, valuesSet]) => {
        const valuesArray = Array.from(valuesSet);
        const formattedVariation = valuesArray.join(", ");
        addSection(`Variation - ${variationKey}`, formattedVariation);
      }
    );
  }
  return sections;
}

// src/platforms/vtex/index.ts
var vtexPlatform = {
  getProductData,
  splitProductData
};
var vtex_default = vtexPlatform;

// src/platforms/index.ts
var platforms = {
  vtex: vtex_default
};

// src/scripts/askToLLM.ts
var import_openai = require("openai/index.mjs");

// src/scripts/utils/conversationHistoryController.ts
var conversationHistory = {};
function addMessage(conversationId, message) {
  if (!conversationHistory[conversationId]) {
    conversationHistory[conversationId] = [];
  }
  conversationHistory[conversationId].push(message);
}
function getConversation(conversationId) {
  return conversationHistory[conversationId] || [];
}

// src/scripts/askToLLM.ts
var import_dotenv2 = __toESM(require("dotenv"), 1);
import_dotenv2.default.config();
var openai = new import_openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
function askToLLM(meaningfulInfo, question, storeName, slug, conversationId) {
  return __async(this, null, function* () {
    var _a;
    addMessage(conversationId, {
      role: "user",
      content: question
    });
    const conversationHistory2 = getConversation(conversationId);
    const systemInstructions = {
      role: "system",
      content: `
            You are an assistant that answers questions about products based only on the following details: ${meaningfulInfo}

            - Your response must always be formatted exclusively in valid HTML. No Markdown, plain text, or any other format\u2014only raw HTML tags.
            - Whenever you want to emphasize text in bold, use <strong>text</strong>.
            - If you need to return a list, use <ul> for unordered lists or <ol> for ordered lists, with each item inside <li>.
            - Always structure paragraphs inside <p>.
            - You MUST NOT include triple backticks like (\`\`\`html or \`\`\`).
            - Under no circumstances should you generate a response in any format other than pure HTML.

            ### **About reasoning:**
            - You **CANNOT** invent information that is not in the provided product details.
            If you found any product details that closely match the question, use that information without the "missing information" text.
            - However, you may **infer** or provide general recommendations based on what you know (for example, general washing instructions for cotton items), clearly indicating that it is a suggestion based on general knowledge rather than confirmed data from the provided details.
            - If the question concerns durability, material, color compatibility, or washing instructions, use the available details to give the best possible answer. If those details are insufficient, provide general advice based on your knowledge, making it clear that it is not confirmed by the provided details.
            - If the user asks for something that depends on information not contained in the product details, state that the specific information was not found, but offer a suggestion based on your general knowledge, always clarifying that it is a general recommendation or inference.

            ### **About calculation instructions:**
            - If the user requests a calculation (e.g., how many products are needed to cover a certain area), use the provided details and/or user input to perform the calculation.
            - Present the final result in valid HTML, following the same formatting rules (such as using <p> for paragraphs).
            - Do not reveal your internal step-by-step reasoning; only provide the final result (and minimal explanatory text if necessary) in HTML.
            - Only give the aswer if the context is clearly about the product.


            ### **How to handle missing information:**
            - If you found any product details that closely match the question, use that information without the "missing information" text.
            - If the requested information is not found in the provided product details, respond in this format:
            "<p>Ops! N\xE3o achei essa informa\xE7\xE3o nos detalhes do produto, mas com base no que sei, posso sugerir algo:</p>"
            - Provide relevant insights **based on the available details**.
            - If no useful insight is possible, respond with "<p>Ops! N\xE3o tenho essa informa\xE7\xE3o, mas posso tentar ajudar com outra d\xFAvida sobre o produto.</p>"

            Keep your answers short, direct, and helpful. Remember: responses must always be in pure HTML, with no additional formatting.
        `
    };
    const messages = [systemInstructions, ...conversationHistory2];
    try {
      const completion = yield openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        response_format: { "type": "text" },
        max_completion_tokens: 500,
        presence_penalty: 0.3,
        messages
      });
      if (!completion.choices || completion.choices.length === 0) {
        console.error("Resposta inesperada do LLM:", completion);
        return "Desculpe, n\xE3o conseguir obter sua resposta no momento, sera que voc\xEA pode tentar mais tarde?.";
      }
      console.log("Resposta do OpenRouter:", completion);
      const responseText = completion.choices[0].message.content || "";
      const cleanedResponse = responseText.replace(/```html|```/g, "").trim();
      addMessage(conversationId, {
        role: "assistant",
        content: cleanedResponse
      });
      return responseText || "Ops! N\xE3o achei essa informa\xE7\xE3o, mas posso tentar responder outra pergunta sobre o produto.";
    } catch (error) {
      console.error("\u274C Erro ao chamar o modelo de LLM escolhido:", error);
      if ((_a = error.response) == null ? void 0 : _a.data) {
        console.error("\u{1F4C4} Resposta do LLM escolhido:", error.response.data);
      }
      return "Desculpe, n\xE3o conseguir obter sua resposta no momento, sera que voc\xEA pode tentar mais tarde?.";
    }
  });
}

// src/scripts/utils/langchainClient.ts
var import_openai2 = require("@langchain/openai");
var import_memory = require("langchain/vectorstores/memory");
var import_dotenv3 = __toESM(require("dotenv"), 1);
import_dotenv3.default.config();
var openaiEmbeddings = new import_openai2.OpenAIEmbeddings({
  modelName: "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY
});
var vectorStore = new import_memory.MemoryVectorStore(openaiEmbeddings);
function addProductEmbeddings(productTexts) {
  return __async(this, null, function* () {
    const embeddings = yield openaiEmbeddings.embedDocuments(productTexts);
    console.log("\u{1F50D} Dimens\xE3o do vetor de embedding gerado:", embeddings[0].length);
    yield vectorStore.addDocuments(productTexts.map((text, index) => ({
      pageContent: text,
      embedding: embeddings[index],
      metadata: {}
    })));
  });
}
function searchRelevantInfo(question, topK = 10) {
  return __async(this, null, function* () {
    const embeddingQuestion = yield openaiEmbeddings.embedQuery(question);
    console.log("\u{1F50D} Dimens\xE3o do vetor da pergunta:", embeddingQuestion.length);
    const results = yield vectorStore.similaritySearchVectorWithScore(embeddingQuestion, topK);
    console.log("\u{1F4CA} Resultados da busca sem\xE2ntica:", results.map((result) => result[1]));
    return results.map((res) => res[0].pageContent).join(" ");
  });
}

// src/scripts/utils/countTokens.ts
function countTokens(text) {
  return text.split(/\s+/).length;
}

// src/scripts/utils/embeddingProcessor.ts
function searchMeaningfulInfos(question, productData) {
  return __async(this, null, function* () {
    const platformName = getPlatform();
    const texts = platforms[platformName] && platforms[platformName].splitProductData(productData);
    yield addProductEmbeddings(texts);
    console.log("\u{1F50D} Dados do produto adicionados ao banco vetorial!");
    const selectedTexts = yield searchRelevantInfo(question);
    console.log("\u{1F50D} Selected texts:", selectedTexts);
    const tokensAfter = countTokens(selectedTexts);
    console.log(`\u2705 Tokens after filtering: ${tokensAfter}`);
    return selectedTexts;
  });
}
function processInfoForChat(question, productJsonData) {
  return __async(this, null, function* () {
    const meaningfulInfo = yield searchMeaningfulInfos(question, productJsonData);
    const tokensSent = countTokens(meaningfulInfo);
    console.log(`\u{1F680} Tokens sent to OpenAI: ${tokensSent}`);
    return meaningfulInfo;
  });
}

// src/scripts/controller.ts
function controller(req, res) {
  return __async(this, null, function* () {
    const { question, slug, storeName, platformName, conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: "\xC9 necess\xE1rio fornecer um conversationId." });
    }
    if (!slug && process.env.NODE_ENV === "production") {
      return res.status(400).json({ error: "Slug do produto \xE9 obrigat\xF3rio." });
    }
    if (!platformName || !platforms[platformName]) {
      return res.status(400).json({ error: "Plataforma inv\xE1lida ou n\xE3o suportada." });
    } else {
      setPlatform(platformName);
    }
    const productDetails = yield platforms[platformName].getProductData(storeName, slug);
    const meaningfulInfo = yield processInfoForChat(question, productDetails);
    const responseText = yield askToLLM(meaningfulInfo, question, storeName, slug, conversationId);
    return res.json({ response: responseText });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  controller
});
