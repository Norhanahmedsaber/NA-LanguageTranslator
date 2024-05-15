import Parser from "./parser/astparser";
import fs from 'fs'
import path from 'path'
import { all, BinaryExpression, IfStatement, UnaryExpression, WhileStatement } from "./def/nodes";
import ReservedKeywords from "./lexer/reservedKeywords";

const fileString = fs.readFileSync(path.join(__dirname, './testing.na')).toString()
const AST = new Parser(fileString).parseProgram().body[0] as all;

console.log();

