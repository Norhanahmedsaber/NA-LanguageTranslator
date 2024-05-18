import Parser from "./parser/parser";
import fs from 'fs'
import path from 'path'
import { all, BinaryExpression, IfStatement, UnaryExpression, WhileStatement } from "./def/nodes";
import ReservedKeywords from "./lexer/reservedKeywords";
import { exec } from "child_process";

const fileString = fs.readFileSync(path.join(__dirname, './testing.na')).toString()
const tree = JSON.stringify(new Parser(fileString, path.join(__dirname, "./testing.na")).parseProgram());

fs.writeFileSync(path.join(__dirname, '../input.txt'), tree)
console.log("done")

exec("python index.py", (error, stdout, stderr) => {
    if(error) {
        console.error(error)
        return
    }
    console.log(stdout)
}) 