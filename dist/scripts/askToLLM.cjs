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

// src/scripts/askToLLM.ts
var askToLLM_exports = {};
__export(askToLLM_exports, {
  askToLLM: () => askToLLM
});
module.exports = __toCommonJS(askToLLM_exports);
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
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  askToLLM
});
