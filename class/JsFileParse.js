const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

class JsFileParse {
  constructor() { }

  extractClassMethods(ast) {
    const methods = [];

    walk.simple(ast, {
      ClassDeclaration(node) {
        node.body.body.forEach(element => {
          if (element.type === 'MethodDefinition') {
            methods.push({
              className: node.id.name,
              methodName: element.key.name,
              start: element.start,
              end: element.end
            });
          }
        });
      }
    });

    return methods;
  }

  extractExpressRoutes(ast) {
    const routes = [];

    walk.simple(ast, {
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'app' &&
          ['get', 'post', 'put', 'delete'].includes(node.callee.property.name)) {
          routes.push({
            method: node.callee.property.name.toUpperCase(),
            path: node.arguments[0].value,
            start: node.start,
            end: node.end
          });
        }
      }
    });

    return routes;
  }

  generateMethodCode(classNode, methodNode) {
    const start = methodNode.start;
    const end = methodNode.end;
    const code = classNode.source().slice(start, end);
    return code;
  }

  parseJavaScriptFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });

    const methods = this.extractClassMethods(ast);
    const routes = this.extractExpressRoutes(ast);

    return { methods, routes };
  }
}

module.exports = JsFileParse;
