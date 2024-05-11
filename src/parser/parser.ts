import TokensTypes from "../def/tokensTypes";
import Tokens from "../def/tokensTypes";
import Lexer from "../lexer/lexer";
import Digits from "../values/digits";
import Ops from "../values/ops";
import Token from "../def/token";
import { AssignmentStatement, BinaryExpression, BlockStatement, BreakStatement, Caseclause, CondtionalExpression, Expression, Identifier, IfStatement, Literal, operator, Program, Statement, SwitchStatement, UnaryExpression, UnaryOperator, WhileStatement } from "../def/nodes";
import conditionalOperands from "../lexer/conditionalOperands";

export default class Parser {
    currentToken: Token | undefined;
    scanner: Lexer
    constructor(text: string) {
        this.currentToken = undefined
        this.scanner=new Lexer(text)
    }

    eat(TokenType: TokensTypes) {
        // console.log(TokenType, this.currentToken?.type)
        if (this.currentToken?.type === TokenType) {
            this.currentToken = this.scanner.getNextToken()
        }
        else {
            this.error(TokenType)
        }

    }
    error(expectedToken?: TokensTypes) {
        if(expectedToken) {
            throw new Error("Expected Token: " + expectedToken)
        }
        throw new Error("Unexpected Token: " + this.currentToken?.type)
    }
    parseProgram(): Program {
        !this.currentToken && (this.currentToken = this.scanner.getNextToken())
        const statments = this.parseStatements();
        return {
            type: "Program",
            body: statments
        }
    }
    parseStatements(): Statement[] {
        const statments: Statement[] = []
        while(this.currentToken?.type !== TokensTypes.EOF) {
            if(this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            }else {
                statments.push(this.parseStatement());
            }
        }

        return statments
    }
    parseStatement():Statement{
        console.log(this.currentToken)
        // Stmt: Assignstmt | expr
        // BinaryExpression -> OP | INTEGER | LEFTPARENT | IDENTIFIER
        this.skipNewLines()
        switch (this.currentToken?.type){
            case TokensTypes.OP:
            case TokensTypes.LEFTPARENT:
            case TokensTypes.INTEGER:
                return this.expr()
            case TokensTypes.IDENTIFIER:
                return this.parseBinaryOrAssignment()
            case TokensTypes.WHILE_KEYWORD:
                return this.parseWhileStatement()
            case TokensTypes.LEFTCURL:
                return this.parseBlockStatement()
            case TokensTypes.SWITCH_KEYWORD:
                return this.parseSwitchStatement()
            case TokensTypes.BREAK_KEYWORD:
                return this.parseBreakStatement()
            case TokensTypes.IF_KEYWORD:
                return this.parseIfStatement()

        }
        this.error()
        return {
            type :"AssignmentStatement",
            left : this.identifier(),
            right: this.identifier()
        }

    }
    parseIfStatement():IfStatement{
        this.eat(TokensTypes.IF_KEYWORD)
        this.eat(TokensTypes.LEFTPARENT)
        const test = this.parseConditionalExpression()
        this.eat(TokensTypes.RIGHTPARENT)
        this.skipNewLines()
        const body = this.parseStatement()
        this.skipNewLines()
        let elseBody : Statement | undefined = undefined 
        if(this.currentToken?.type === TokensTypes.ELSE_KEYWORD) {
            this.eat(TokensTypes.ELSE_KEYWORD)
            elseBody = this.parseStatement()
        }
        return {
            type: "IfStatement",
            test,
            body,
            else: elseBody
        }
    }
    parseConditionalExpression(): CondtionalExpression{
        const left= this.expr()
        const operand=this.currentToken?.value as string
        if(!conditionalOperands.includes(operand)) {
            this.error()
        }
        this.eat(this.currentToken?.type!)
        const right=this.expr()
        return {
            type: "CondtionalExpression",
            left,
            operand,
            right
        }
    }
    parseSwitchStatement():SwitchStatement{
        // SWITCH_KEYWORD LEFTPARENT expr RIGHTPARENT LEFTCURL cases RIGHTCURL
        this.eat(TokensTypes.SWITCH_KEYWORD)
        this.eat(TokensTypes.LEFTPARENT)
        const id = this.identifier()
        this.eat(TokensTypes.RIGHTPARENT)
        this.skipNewLines()
        this.eat(TokensTypes.LEFTCURL)
        const cases = this.parseCases()
        let defaultt: Statement[] = []
        if(this.currentToken?.type===TokensTypes.DEFAULT_KEYWORD){
            defaultt = this.parseDefault()
        }
        this.eat(TokensTypes.RIGHTCURL)
        return{
            type:"SwitchStatement",
            test: id,
            cases,
            default: defaultt
        }
     }
     parseDefault(): Statement[] {
        this.skipNewLines()
        this.eat(TokensTypes.DEFAULT_KEYWORD)
        this.eat(TokensTypes.COLON)
        this.skipNewLines()
        const statments: Statement[] = []
        while(this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if(this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            }else {
                statments.push(this.parseStatement());
            }
        }
        return statments
     }
     parseCases():Caseclause[]{
        const cases: Caseclause[] = []
        while(this.currentToken?.type !== TokensTypes.DEFAULT_KEYWORD && this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if(this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            }else {
                cases.push(this.parseCase());
            }
        }
        return cases
     }
     parseCase():Caseclause{
        this.eat(TokensTypes.CASE_KEYWORD)
        const id = this.expr()
        this.eat(TokensTypes.COLON)
        this.skipNewLines()
        const body: Statement[] = []
        while(this.currentToken?.type !== TokensTypes.CASE_KEYWORD && this.currentToken?.type !== TokensTypes.DEFAULT_KEYWORD && this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if(this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            }else {
                body.push(this.parseStatement());
            }
        }
        return {
            type: "Caseclause",
            id,
            body
        }
     }
     parseBreakStatement():BreakStatement{
        this.eat(TokensTypes.BREAK_KEYWORD)
        this.eat(TokensTypes.SEMI)
        return {
            type:"BreakStatement"
        }
     }
    parseBlockStatement():BlockStatement{
        this.eat(TokensTypes.LEFTCURL)
        const body:Statement[] = []
        while(this.currentToken?.type!==TokensTypes.RIGHTCURL){
            if(this.currentToken?.type=== TokensTypes.NEWLINE){
                this.eat(TokensTypes.NEWLINE)
            }
            else {
                body.push(this.parseStatement())
            }
        }
        this.eat(TokensTypes.RIGHTCURL)
        return{
            type:"BlockStatement",
            body
        }
    }
    parseWhileStatement():WhileStatement{
        this.eat(TokensTypes.WHILE_KEYWORD)
        this.eat(TokensTypes.LEFTPARENT)
        const test=this.expr()
        this.eat(TokensTypes.RIGHTPARENT)
        const body = this.parseStatement()
        return{
            type:"WhileStatement",
            test,
            body
        }
    }
    parseBinaryOrAssignment(): Statement {
        // First Token Identifier
        const leftIdentifier = this.identifier()
        switch(this.currentToken?.type) {
            case TokensTypes.EQUAL:
                return this.parseAssignmentStatment(leftIdentifier)
            default :
                return this.expr(leftIdentifier)
        }
    }
    parseAssignmentStatment(left: Identifier): AssignmentStatement {
        this.eat(TokensTypes.EQUAL)
        const right = this.expr()
        this.eat(TokensTypes.SEMI)
        return {
            type: "AssignmentStatement",
            left,
            right
        }
    }
    expr(left?:Identifier): Expression  {
        let node
        // console.log("expr")
        if(left){
            node= left 
        }
        else {
             node = this.term()
        }
        // console.log(this.currentToken?.value)
        while(this.currentToken?.value === "+" || this.currentToken?.value === "-"){ // Binary
            const op = this.currentToken.value
            this.eat(TokensTypes.OP)
            node = this.parseBinaryExpression(op, node, this.term())
        }

        return node
    }
    term(): Expression {
        // console.log("term")
        let node = this.factor()!
        // console.log(this.currentToken)
        while(this.currentToken?.value === "*" || this.currentToken?.value === "/"){
            const op = this.currentToken.value
            this.eat(TokensTypes.OP)
            node = this.parseBinaryExpression(op, node, this.factor()!);
            
        }
        return node
    }
    factor(): Expression | undefined{
        // console.log("factor")
        // console.log(this.currentToken)
        // ( expr )
        if(this.currentToken?.type==TokensTypes.LEFTPARENT){
            this.eat(TokensTypes.LEFTPARENT)
            const node = this.expr()
            this.eat(TokensTypes.RIGHTPARENT)
            return node
        }
        // -factor | +factor
        else if(this.currentToken?.value === "-" || this.currentToken?.value === "+") { // Unary
            const op = this.currentToken.value
            this.eat(TokensTypes.OP)
            const argument = this.factor()!
            return this.parseUnaryExpression(op, argument);
        }
        // number
        else if(this.currentToken?.type == TokensTypes.INTEGER) {
            // this.error()
          const  result = this.number()
          return result
        }
        // IDENTIFIER
        else if( this.currentToken?.type ==TokensTypes.IDENTIFIER){
            return this.identifier()
        }
        this.error()
    }
    identifier(): Identifier {
        const name = this.currentToken?.value as string
        this.eat(TokensTypes.IDENTIFIER)
        return this.parseId(name)
    }
    number():Literal {
        const value = this.currentToken?.value as number
        this.eat(TokensTypes.INTEGER)
        return this.parseLiteral(value)
    }
    parseBinaryExpression(op: operator, left: Expression, right: Expression): BinaryExpression {
        return {
            type: "BinaryExpression",
            op,
            left,
            right
        }
    }
    parseUnaryExpression(operator: UnaryOperator, argument: Expression): UnaryExpression {
        return {
            type: "UnaryExpression",
            operator,
            argument
        }
    }
    parseLiteral(value: number):Literal {
        return  {
            type: "Literal",
            value: value
        }
    }
    parseId(name:string):Identifier{
        return {
            type : "Identifier",
            name
        }
    }
    skipNewLines(){
        while(this.currentToken?.type===TokensTypes.NEWLINE){
            this.eat(TokensTypes.NEWLINE)
        }
    }
}