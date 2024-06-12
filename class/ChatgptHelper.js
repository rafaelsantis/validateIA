const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');
const axios = require('axios');

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

class ChatgptHelper {
  constructor() {
  }

  async callIA(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500, // Ajuste conforme necessário
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao chamar a API do ChatGPT:', error);
      return null;
    }
  }

  async generateUnitTest(method, className) {
    const prompt = `
      Gere um teste unitário usando Mocha para o seguinte método JavaScript:
      Classe: ${className}
      Método:
      ${method}`;

    const result = await this.callIA(prompt);
    return result;
  }

  async identifyIssues(method, className) {
    const prompt = `
    Analise o seguinte método JavaScript para identificar possíveis problemas, como bugs, vulnerabilidades de segurança ou más práticas de codificação:
    Classe: ${className}
    Método:
    ${method}`;

    const result = await this.callIA(prompt);
    return result;
  }

  async analyzeImpactAndGenerateTests(filename, patch, routes = []) {
    let prompt;

    if (routes?.length > 0) {
      prompt = `
        O seguinte arquivo foi alterado durante uma revisão de código (peer review).
        Arquivo: ${filename}
        Alterações:
        ${patch}

        Este arquivo contém as seguintes rotas de API do Express:
        ${routes.map(route => `Método: ${route.method}, Caminho: ${route.path}`).join('\n')}

        Analise os impactos potenciais dessas alterações e gere testes unitários para cada rota de API mencionada.
        `;
    } else {
      prompt = `
        O seguinte arquivo foi alterado durante uma revisão de código (peer review).
        Arquivo: ${filename}
        Alterações:
        ${patch}

        Analise os impactos potenciais dessas alterações e gere um teste unitário que aborde esses impactos.
        `;
    }

    const result = await this.callIA(prompt);
    return result;
  }
}

module.exports = ChatgptHelper;
