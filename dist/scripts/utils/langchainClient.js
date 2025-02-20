"use strict";
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

// src/scripts/utils/langchainClient.ts
var langchainClient_exports = {};
__export(langchainClient_exports, {
  addProductEmbeddings: () => addProductEmbeddings,
  searchRelevantInfo: () => searchRelevantInfo
});
module.exports = __toCommonJS(langchainClient_exports);
var import_openai = require("@langchain/openai");
var import_memory = require("langchain/vectorstores/memory");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var openaiEmbeddings = new import_openai.OpenAIEmbeddings({
  modelName: "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY
});
var vectorStore = new import_memory.MemoryVectorStore(openaiEmbeddings);
async function addProductEmbeddings(productTexts) {
  const embeddings = await openaiEmbeddings.embedDocuments(productTexts);
  console.log("\u{1F50D} Dimens\xE3o do vetor de embedding gerado:", embeddings[0].length);
  await vectorStore.addDocuments(productTexts.map((text, index) => ({
    pageContent: text,
    embedding: embeddings[index],
    metadata: {}
  })));
}
async function searchRelevantInfo(question, topK = 10) {
  const embeddingQuestion = await openaiEmbeddings.embedQuery(question);
  console.log("\u{1F50D} Dimens\xE3o do vetor da pergunta:", embeddingQuestion.length);
  const results = await vectorStore.similaritySearchVectorWithScore(embeddingQuestion, topK);
  console.log("\u{1F4CA} Resultados da busca sem\xE2ntica:", results.map((result) => result[1]));
  return results.map((res) => res[0].pageContent).join(" ");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addProductEmbeddings,
  searchRelevantInfo
});
