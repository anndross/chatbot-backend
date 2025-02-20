"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/scripts/utils/conversationHistoryController.ts
var conversationHistoryController_exports = {};
__export(conversationHistoryController_exports, {
  addMessage: () => addMessage,
  clearConversation: () => clearConversation,
  getAllConversations: () => getAllConversations,
  getConversation: () => getConversation
});
module.exports = __toCommonJS(conversationHistoryController_exports);
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
function clearConversation(conversationId) {
  delete conversationHistory[conversationId];
}
function getAllConversations() {
  return conversationHistory;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addMessage,
  clearConversation,
  getAllConversations,
  getConversation
});
