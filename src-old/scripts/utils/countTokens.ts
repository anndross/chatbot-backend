export function countTokens(text: string) {
    return text.split(/\s+/).length; // Conta palavras como aproximação de tokens
}
