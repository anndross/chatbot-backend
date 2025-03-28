export function getHostName(url: string) {
  const hostname = new URL(url).hostname; // Obtém "www.casamaisfacil.com.br"
  const parts = hostname.split(".").reverse(); // ["br", "com", "casamaisfacil", "www"]

  if (parts.length > 2 && parts[1].length <= 3) {
    return parts[2]; // Para domínios como ".com.br"
  }
  return parts[1]; // Para domínios como ".com"
}
