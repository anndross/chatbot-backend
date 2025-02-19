# **Chatbot VTEX** 🤖  

Chatbot para lojas VTEX que fornece respostas personalizadas sobre produtos com base nas informações disponíveis na página.  

## **📌 Funcionalidades**

✅ **Responde perguntas sobre produtos** usando informações da página VTEX.  
✅ **Geração de respostas via OpenAI, Google Gemini e OpenRouter**.  
✅ **Configuração flexível** via `data-attributes` na tag `<script>`.  
✅ **Interface dinâmica** com botão personalizável.  
✅ **Integração com campos de entrada personalizados**.  

---

## **📥 Instalação**

### **1️⃣ Clonar o projeto**

```sh
git clone https://github.com/seu-repositorio/chatbot-vtex.git
cd chatbot-vtex
```

### **2️⃣ Instalar dependências**

```sh
npm install
```

### **3️⃣ Configurar variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais:

``` shell
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_google_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
VTEX_ACCOUNT_NAME=your_vtex_store
VTEX_LOCAL_SLUG=your_default_product_slug
```

### **4️⃣ Rodar localmente**

```sh
npm start
```

O servidor estará disponível em `http://localhost:3001`.

---

## **🚀 Como Usar no Site**

### **1️⃣ Adicione a tag `<script>` ao seu site**

Insira o seguinte código no `<head>` ou antes do `</body>`:

```html
<script 
    src="https://gpt-chatbot-nu-amber.vercel.app/chatbot-loader.js"
    data-offset-x="20px"
    data-offset-y="20px"
    data-custom-input
    defer>
</script>
```

### **2️⃣ Personalização via `data-attributes`**

A tag `<script>` permite configurações dinâmicas através de atributos `data-`:

| **Atributo**          | **Descrição** | **Valores Possíveis** | **Padrão** |
|----------------------|--------------|-----------------|-----------|
| `data-offset-x`      | Margem horizontal do botão | Qualquer valor CSS (ex: `30px`) | `20px` |
| `data-offset-y`      | Margem vertical do botão | Qualquer valor CSS (ex: `30px`) | `20px` |
| `data-custom-input`  | Usa um campo de entrada personalizado | Sem valor (booleano) | `false` |

#### **Exemplo 1: Alterando a posição do botão**

```html
<script 
    src="https://gpt-chatbot-nu-amber.vercel.app/chatbot-loader.js"
    data-offset-x="40px"
    data-offset-y="10px"
    defer>
</script>

```

Isso posicionará o botão no **canto inferior direito** com margem de **40px na horizontal** e **10px na vertical** essas medidas são relacionadas a: `data-offset-x` = propriedade `right` do `position: fixed` e `data-offset-y` = propriedade `bottom` do `position: fixed`.

#### **Exemplo 2: Integrando com um campo de entrada personalizado**

Caso queira que o chatbot utilize um campo de entrada próprio do site:

```html
 <div class="chatbot-custom-input">
        <input type="text">
        <button type="button" id="chatbot-trigger"></button>
    </div>
<script 
    src="https://gpt-chatbot-nu-amber.vercel.app/chatbot-loader.js"
    data-custom-input
    defer>
</script>
```

Agora, ao abrir o chatbot, ele automaticamente enviará a pergunta digitada no campo personalizado.
Note que o botão deve estar dentro da div com a classe `chatbot-custom-input` e conter a o id `chatbot-trigger`.

---

## **⚙️ Como Funciona**

### **📌 Estrutura do Projeto**

``` shell
/chatbot-vtex
├── api/
│   ├── askToLLM.js                        # Integração com a LLM
│   ├── vtexProduct.js                     # Obtém informações do produto na VTEX
│   ├── server.js                          # Servidor Express
│   ├── embeddingProcessor.js              # Processamento de informações do produto
├── api/utils/
│   ├────── countTokens.js                     # Contagem de tokens
│   ├────── langchainClient.js                 # Integração com o LangChain
│   ├────── splitProductData.js            # Separação de dados do produto
│   ├────── conversationHistoryController.js   # Controle do histórico de conversas
├── frontend/
│   ├──  chatbot-api.js                    # Comunicação com o backend
│   ├── chatbot-loader.js                  # Carregamento do chatbot no site
│   ├── chatbot-ui.js                      # Interface do chatbot
│   ├── chatbot-events.js                  # Gerenciamento de eventos do chatbot
│   ├── config.js                          # Configurações e ícones
│   ├── config.js                          # Configurações e ícones
├── package.json                           # Dependências do projeto
└── README.md                              # Documentação
```

### **🔗 Comunicação do Chatbot**

1️⃣ O **usuário clica no botão** para abrir o chat.  
2️⃣ O **chat obtém informações do produto** na página VTEX.  
3️⃣ A **pergunta do usuário é enviada** para a API.  
4️⃣ O **backend consulta OpenAI, Gemini ou OpenRouter** para gerar a resposta.  
5️⃣ A **resposta é formatada e exibida** na interface do chatbot.  

---

## **🛠 Tecnologias Utilizadas**

- **Node.js + Express** → Servidor backend  
- **OpenAI API + Google Gemini + OpenRouter** → Geração de respostas  
- **VTEX API** → Extração de informações do produto  
- **JavaScript + HTML + CSS** → Interface do chatbot  
- **CORS + dotenv + axios** → Integração de API  

---

## **📌 Melhorias Futuras**

- [ ] Adicionar suporte para múltiplos idiomas  
- [ ] Melhorar layout e experiência do chatbot  
- [ ] Implementar cache para respostas mais rápidas  

---

## **🤝 Contribuição**

Sinta-se à vontade para abrir **issues** ou enviar **pull requests** no repositório.

🚀 **Vamos evoluir esse chatbot juntos!**
