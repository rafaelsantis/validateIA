const ChatgptHelper = require('./ChatgptHelper');
const GithubHelper = require('./GithubHelper');
const JsFileParse = require('./JsFileParse');

async function processPullRequest() {
  const ghHelper = new GithubHelper('', '', 1);
  const gptHelper = new ChatgptHelper();
  const changes = await ghHelper.getPullRequestChanges();

  for (const change of changes) {
    console.log(`Analisando impacto e gerando testes unitários para o arquivo: ${change.filename}...`);
    const result = await gptHelper.analyzeImpactAndGenerateTests(change.filename, change.patch);
    if (result) {
      console.log(`Impactos identificados e testes unitários gerados para o arquivo ${change.filename}:\n`);
      console.log(result);
    }
  }
}

async function parseJavaScriptFile(filePath) {
  const JsParser = new JsFileParse();
  const gptHelper = new ChatgptHelper();
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });

  const methods = JsParser.extractClassMethods(ast);

  for (const method of methods) {
    console.log(`Gerando teste unitário para ${method.className}::${method.methodName}...`);
    const unitTest = await gptHelper.generateUnitTest(method.methodCode, method.className);
    if (unitTest) {
      console.log(`Teste unitário para ${method.className}::${method.methodName}:\n`);
      console.log(unitTest);
    }
  }
}