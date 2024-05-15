const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');

const parser = new Parser();
parser.setLanguage(JavaScript);

const sourceCode = 'x = 1; if(anas > 5) {while(x){x = x + 5 * 2;}}';
const tree = parser.parse(sourceCode);
console.log(tree.rootNode.children[1].children[2].children[1].children[2].children[1].children[0].children[2].children)
// console.log(tree.rootNode.toString());