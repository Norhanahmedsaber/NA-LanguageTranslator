import Parser from "./parser/parser";
import fs from 'fs'
import path from 'path'
import { BinaryExpression, UnaryExpression, WhileStatement } from "./def/nodes";
import ReservedKeywords from "./lexer/reservedKeywords";

const fileString = fs.readFileSync(path.join(__dirname, './testing.na')).toString()
const parser= new Parser(fileString);
console.log((parser.parseProgram()));
//console.log("؛".charCodeAt(0))

