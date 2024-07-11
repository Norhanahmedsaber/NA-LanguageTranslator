export interface Node {
    Node: string
    Children: Node[]
    value?: string | number
}
export interface Factor extends Node {
    Node: "Factor"
}
export interface DoWhileStatement extends Node{
    Node : "DoWhileStatement"
}
export interface Term extends Node {
    Node: "Term"
}
export interface Expr extends Node {
    Node: "Expr"
}
export interface Program extends Node {
    Node: "Program"
}
export interface UnaryExpression extends Node{ 
    Node: "UnaryExpression"
}
export interface Number extends Node {
    Node: "Number"
    value: number
}
export interface Identifier extends Node {
    Node: "Identifier"
    value: string
}
export interface AssignmentStatement extends Node {
    Node: "AssignmentStatement"
}
export interface WhileStatement extends Node{
    Node: "WhileStatement"
}
export interface BlockStatement extends Node {
    Node: "BlockStatement"
}
export interface SwitchStatement extends Node{
    Node: "SwitchStatement"
}
export interface Caseclause extends Node{
    Node: "Caseclause"
}
export interface BreakStatement extends Node {
    Node: "BreakStatement"
}
export interface IfStatement extends Node {
    Node: "IfStatement"
}
export interface CondtionalExpression extends Node {
    Node: "CondtionalExpression"
}
export interface LogicalExpression extends Node {
    Node: "LogicalExpression"
}
export interface ExpressionStatement extends Node {
    Node: "ExpressionStatement"
}
export interface Cases extends Node {
    Node: "Cases"
}
export interface Default extends Node {
    Node: "Default"
}
export interface Expression extends Node {
    Node: "Expression"
}
export interface ElseStatement extends Node {
    Node: "ElseStatement"
}
export interface SyntaxNode extends Node {
    Node: ";" | ":" | "{" | "}" | "+" | "-" | "*" | "/" | "=" | "!" | ">" | "<" | "(" | ")" | "lw" | "else" | "while" | "switch" | "case" | "break" | "default" | "do" | "for"
}
export type UnaryOperator = "+" | "-"
export type operator = "+" | "-" | "/" | "*"
export type Statement = 
AssignmentStatement |
WhileStatement | 
BlockStatement |
SwitchStatement|
BreakStatement |
IfStatement