export interface Node {
    Node: string
    Childern: Node[]
}
export interface Factor extends Node {
    Node: "Factor"
}
export interface Term extends Node {
    Node: "Term"
}
export interface Program extends Node {
    Node: "Program"
}
export interface BinaryExpression extends Node {
    Node: "BinaryExpression"
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
export interface SyntaxNode extends Node {
    Node: ";" | "{" | "}" | "+" | "-" | "*" | "/" | "=" | "!" | ">" | "<" | "(" | ")" | "if" | "else" | "while" | "switch" | "case" | "break" | "default" | "do" | "for"
}
export type UnaryOperator = "+" | "-"
export type operator = "+" | "-" | "/" | "*"
export type Expression = 
BinaryExpression | 
UnaryExpression | 
Number |
CondtionalExpression|
Identifier
export type Statement = 
AssignmentStatement | 
Expression     |
WhileStatement | 
BlockStatement |
SwitchStatement|
BreakStatement |
IfStatement