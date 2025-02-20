/**
 * Objeto que armazena os históricos de conversa.
 * Cada chave é um conversationId e o valor é um array de mensagens.
 */
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const conversationHistory: { [conversationId: string]: Message[] } = {};

/**
 * Adiciona uma mensagem à conversa identificada por conversationId.
 *
 * @param {string} conversationId - Identificador único da conversa.
 * @param {object} message - Objeto da mensagem, por exemplo: { role: "user", content: "Sua mensagem" }.
 */
export function addMessage(conversationId: string, message: Message): void {
  if (!conversationHistory[conversationId]) {
    conversationHistory[conversationId] = [];
  }
  conversationHistory[conversationId].push(message);
}

/**
 * Retorna o histórico completo da conversa para um dado conversationId.
 *
 * @param {string} conversationId - Identificador único da conversa.
 * @returns {Array} Array com o histórico de mensagens ou um array vazio caso não exista histórico.
 */
export function getConversation(conversationId: string): Message[] {
  return conversationHistory[conversationId] || [];
}

/**
 * Limpa o histórico da conversa para um dado conversationId.
 *
 * @param {string} conversationId - Identificador único da conversa.
 */
export function clearConversation(conversationId: string): void {
  delete conversationHistory[conversationId];
}

/**
 * Retorna o objeto completo com todas as conversas armazenadas.
 * (Caso seja necessário, por exemplo, para depuração)
 *
 * @returns {object} Objeto com todos os conversationHistory.
 */
export function getAllConversations(): { [conversationId: string]: Message[] } {
  return conversationHistory;
}
