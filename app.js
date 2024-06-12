const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');
const axios = require('axios');

const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
const filePath = 'path/to/your/file.js'; // Substitua pelo caminho do seu arquivo JS

async function generateUnitTest(method, className) {
    const prompt = `
    Gere um teste unitário usando Jest para o seguinte método JavaScript:
    Classe: ${className}
    Método:
    ${method}
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150, // Ajuste conforme necessário
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

function extractClassMethods(ast) {
    const methods = [];

    walk.simple(ast, {
        ClassDeclaration(node) {
            node.body.body.forEach(element => {
                if (element.type === 'MethodDefinition') {
                    methods.push({
                        className: node.id.name,
                        methodName: element.key.name,
                        methodCode: generateMethodCode(node, element),
                    });
                }
            });
        }
    });

    return methods;
}

function generateMethodCode(classNode, methodNode) {
    const start = methodNode.start;
    const end = methodNode.end;
    const code = classNode.source().slice(start, end);
    return code;
}

async function parseJavaScriptFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });

    const methods = extractClassMethods(ast);

    for (const method of methods) {
        console.log(`Gerando teste unitário para ${method.className}::${method.methodName}...`);
        const unitTest = await generateUnitTest(method.methodCode, method.className);
        if (unitTest) {
            console.log(`Teste unitário para ${method.className}::${method.methodName}:\n`);
            console.log(unitTest);
        }
    }
}

parseJavaScriptFile(filePath);
