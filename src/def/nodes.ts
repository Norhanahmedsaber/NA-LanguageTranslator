export interface Program {
    type: "Program"
    body: Statement[]
}
export interface BinaryExpression{
    type: "BinaryExpression"
    left: Expression
    op: operator
    right: Expression
}
export interface UnaryExpression{
    type: "UnaryExpression",
    operator: UnaryOperator,
    argument: Expression
}
export interface Literal {
    type : "Literal"
    value: number
}
export interface Identifier {
    type : "Identifier"
    name : string
}
export interface AssignmentStatement {
    type : "AssignmentStatement",
    left : Identifier
    right : Expression
}
export interface WhileStatement{
    type : "WhileStatement"
    test: Expression
    body : Statement

}
export interface BlockStatement {
    type: "BlockStatement",
    body: Statement[]
}
export interface SwitchStatement{
    type:"SwitchStatement",
    test : Expression,
    cases : Caseclause[],
    default?: Statement[]
}
export interface Caseclause{
    type:"Caseclause",
    id: Expression,
    body: Statement[]
}
export interface BreakStatement {
    type:"BreakStatement"
}
export interface IfStatement{
    type:"IfStatement",
    test:Expression,
    body:Statement
    else?:Statement
}
export interface CondtionalExpression{
    type:"CondtionalExpression",
    left:Expression,
    right:Expression,
    operand:string
}
export type UnaryOperator = "+" | "-"
export type operator = "+" | "-" | "/" | "*"
export type Expression = 
BinaryExpression | 
UnaryExpression | 
Literal |
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