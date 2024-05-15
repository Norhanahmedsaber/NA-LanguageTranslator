import Parser from "./parser/parser";
import fs from 'fs'
import path from 'path'
import { all, BinaryExpression, IfStatement, UnaryExpression, WhileStatement } from "./def/nodes";
import ReservedKeywords from "./lexer/reservedKeywords";

const fileString = fs.readFileSync(path.join(__dirname, './testing.na')).toString()
const tree = new Parser(fileString).parseProgram();

console.log(tree.Children[0].Children[2].Children[0]);

