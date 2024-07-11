import TokensTypes from "../def/tokensTypes";
import Tokens from "../def/tokensTypes";
import Lexer from "../lexer/lexer";
import Digits from "../values/digits";
import Ops from "../values/ops";
import Token from "../def/token";
import { AssignmentStatement, BlockStatement, BreakStatement, Caseclause, Cases, CondtionalExpression, Default, DoWhileStatement, ElseStatement, Expr, Expression, ExpressionStatement, Identifier, IfStatement, LogicalExpression, operator, Program, Statement, SwitchStatement, SyntaxNode, Term, UnaryExpression, UnaryOperator, WhileStatement } from "../def/parseTreeNodes";
import conditionalOperands from "../lexer/conditionalOperands";
import { Factor, Node } from "../def/parseTreeNodes";
import tokenMap from "../tokenSyntax/tokenMap";
import logicalOperands from "../lexer/logicalOperands";

export default class Parser {
    currentToken: Token | undefined;
    scanner: Lexer;
    fileName: string
    constructor(text: string, fileName: string) {
        this.currentToken = undefined
        this.scanner = new Lexer(text, fileName)
        this.fileName = fileName
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
        // if (expectedToken) {
        //     throw new Error("Expected Token: " + tokenMap[expectedToken] + "\n\tat: " + this.fileName + ":" + this.currentToken?.line + ":" + this.currentToken?.col + "\n")
        // }
        const currentTokenType = this.currentToken?.type!
        const errorMessage = (this.currentToken?.value) ? (this.currentToken?.value)?.toString() : (tokenMap[currentTokenType])
        throw new Error("Unexpected Token: " + errorMessage + "\n\tat: " + this.fileName + ":" + this.currentToken?.line + ":" + this.currentToken?.col + "\n")
    }
    parseProgram(): Program {
        !this.currentToken && (this.currentToken = this.scanner.getNextToken())
        const statments = this.parseStatements();
        return {
            Node: "Program",
            Children: statments
        }
    }
    parseStatements(): Node[] {
        const statments: Node[] = []
        while (this.currentToken?.type !== TokensTypes.EOF) {
            if (this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            } else {
                statments.push(this.parseStatement());
            }
        }

        return statments
    }
    parseStatement(): Node {
        // console.log(this.currentToken)
        // Stmt: Assignstmt | expr
        // BinaryExpression -> OP | INTEGER | LEFTPARENT | IDENTIFIER
        this.skipNewLines()
        switch (this.currentToken?.type) {
            case TokensTypes.OP:
            case TokensTypes.LEFTPARENT:
            case TokensTypes.INTEGER:
                return this.parseExpressionStatement()
            case TokensTypes.IDENTIFIER:
                return this.parseExpressionOrAssignmentStatement()
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
            case TokensTypes.DO_KEYWORD:
                return this.parseDoWhileStatement()

        }
        this.error()
        return {
            Node: "AssignmentStatement",
            Children: []
        }

    }
    parseDoWhileStatement(): DoWhileStatement {
        const Children: Node[] = []
        this.eat(TokensTypes.DO_KEYWORD)
        Children.push({
            Node: "do",
            Children: []
        } as SyntaxNode)
        const stmt = this.parseStatement()
        Children.push(stmt)
        this.eat(TokensTypes.WHILE_KEYWORD)
        Children.push({
            Node: "while",
            Children: []
        } as SyntaxNode)
        this.eat(TokensTypes.LEFTPARENT)
        Children.push({
            Node: "(",
            Children: []
        })
        const test = this.parseExpression()
        Children.push(test)
        this.eat(TokensTypes.RIGHTPARENT)
        Children.push({
            Node: ")",
            Children: []
        })
        return {
            Node: "DoWhileStatement",
            Children
        }
    }

    parseExpressionStatement(left?: Identifier): ExpressionStatement {
        const Children: Node[] = []
        let expression = this.parseExpression(left);
        Children.push(expression)
        this.eat(TokensTypes.SEMI)
        Children.push({
            Node: ";",
            Children: []
        } as SyntaxNode)

        return {
            Node: "ExpressionStatement",
            Children
        }
    }
    parseExpression(left?: Node): Expression {
        let node: Node = this.expr(left)
        if (conditionalOperands.includes(this.currentToken?.value as string)) {
            node = this.parseConditionalExpression(node)
        }
        if (logicalOperands.includes(this.currentToken?.value as string)) {
            node = this.parseLogical(node)
        }
        const Children: Node[] = []
        Children.push(node)
        return {
            Node: "Expression",
            Children
        }
    }
    parseIfStatement(): IfStatement {
        const Children: Node[] = []
        this.eat(TokensTypes.IF_KEYWORD)
        Children.push({
            Node: "lw",
            Children: []
        })
        this.eat(TokensTypes.LEFTPARENT)
        Children.push({
            Node: "(",
            Children: []
        })
        const test = this.parseExpression()
        Children.push(test)
        this.eat(TokensTypes.RIGHTPARENT)
        Children.push({
            Node: ")",
            Children: []
        })
        this.skipNewLines()
        const body = this.parseStatement()
        Children.push(body)
        this.skipNewLines()
        if (this.currentToken?.type === TokensTypes.ELSE_KEYWORD) {
            this.eat(TokensTypes.ELSE_KEYWORD)
            const Else = this.parseElseStatement()
            Children.push(Else)
        }
        return {
            Node: "IfStatement",
            Children
        }
    }
    parseElseStatement(): ElseStatement {
        const Children: Node[] = []
        Children.push({
            Node: "else",
            Children: []
        })
        let elseBody = this.parseStatement()
        Children.push(elseBody)
        return {
            Node: "ElseStatement",
            Children
        }
    }

    parseConditionalExpression(left?: Node): CondtionalExpression {
        let node
        // console.log("expr")
        if (left) {
            node = left
        }
        else {
            node = this.expr()
        }
        const Children: Node[] = []
        Children.push(node)
        const operand = this.currentToken?.value as string
        if (conditionalOperands.includes(operand)) {
            this.eat(this.currentToken?.type!)
            Children.push({
                Node: operand,
                Children: []
            })
            const right = this.expr()
            Children.push(right)
        }

        return {
            Node: "CondtionalExpression",
            Children
        }
    }
    parseSwitchStatement(): SwitchStatement {
        // SWITCH_KEYWORD LEFTPARENT expr RIGHTPARENT LEFTCURL cases RIGHTCURL
        const Children: Node[] = []
        this.eat(TokensTypes.SWITCH_KEYWORD)
        Children.push({
            Node: "switch",
            Children: []
        })
        this.eat(TokensTypes.LEFTPARENT)
        Children.push({
            Node: "(",
            Children: []
        })
        const id: Identifier = {
            Node: "Identifier",
            Children: [],
            value: this.currentToken?.value as string
        }
        this.eat(TokensTypes.IDENTIFIER)
        Children.push(id)
        this.eat(TokensTypes.RIGHTPARENT)
        Children.push({
            Node: ")",
            Children: []
        })
        this.skipNewLines()
        this.eat(TokensTypes.LEFTCURL)
        Children.push({
            Node: "{",
            Children: []
        })
        const cases: Cases = {
            Node: "Cases",
            Children: this.parseCases()
        }
        Children.push(cases)
        if (this.currentToken?.type === TokensTypes.DEFAULT_KEYWORD) {
            const defaultt: Default = this.parseDefault()
            Children.push(defaultt)
        }
        this.eat(TokensTypes.RIGHTCURL)
        Children.push({
            Node: "}",
            Children: []
        })
        return {
            Node: "SwitchStatement",
            Children
        }
    }
    parseDefault(): Default {
        const Children: Node[] = []
        this.skipNewLines()
        this.eat(TokensTypes.DEFAULT_KEYWORD)
        Children.push({
            Node: "default",
            Children: []
        })
        this.eat(TokensTypes.COLON)
        Children.push({
            Node: ":",
            Children: []
        })
        this.skipNewLines()
        while (this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if (this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            } else {
                Children.push(this.parseStatement());
            }
        }
        return {
            Node: "Default",
            Children
        }
    }
    parseCases(): Caseclause[] {
        const cases: Caseclause[] = []
        while (this.currentToken?.type !== TokensTypes.DEFAULT_KEYWORD && this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if (this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            } else {
                cases.push(this.parseCase());
            }
        }
        return cases
    }
    parseCase(): Caseclause {
        const Children: Node[] = []
        this.eat(TokensTypes.CASE_KEYWORD)
        Children.push({
            Node: "case",
            Children: []
        })
        const id = this.factor()
        Children.push(id)
        this.eat(TokensTypes.COLON)
        Children.push({
            Node: ":",
            Children: []
        })
        this.skipNewLines()
        while (this.currentToken?.type !== TokensTypes.CASE_KEYWORD && this.currentToken?.type !== TokensTypes.DEFAULT_KEYWORD && this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if (this.currentToken?.type == TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            } else {
                Children.push(this.parseStatement());
            }
        }
        return {
            Node: "Caseclause",
            Children
        }
    }
    parseBreakStatement(): BreakStatement {
        const Children: Node[] = []
        this.eat(TokensTypes.BREAK_KEYWORD)
        Children.push({
            Node: "break",
            Children: []
        })
        this.eat(TokensTypes.SEMI)
        Children.push({
            Node: ";",
            Children: []
        })
        return {
            Node: "BreakStatement",
            Children
        }
    }
    parseBlockStatement(): BlockStatement {
        const Children: Node[] = []
        this.eat(TokensTypes.LEFTCURL)
        Children.push({
            Node: "{",
            Children: []
        })
        while (this.currentToken?.type !== TokensTypes.RIGHTCURL) {
            if (this.currentToken?.type === TokensTypes.NEWLINE) {
                this.eat(TokensTypes.NEWLINE)
            }
            else {
                Children.push(this.parseStatement())
            }
        }
        this.eat(TokensTypes.RIGHTCURL)
        Children.push({
            Node: "}",
            Children: []
        })
        return {
            Node: "BlockStatement",
            Children
        }
    }
    parseWhileStatement(): WhileStatement {
        const Children: Node[] = []
        this.eat(TokensTypes.WHILE_KEYWORD)
        Children.push({
            Node: "while",
            Children: []
        })
        this.eat(TokensTypes.LEFTPARENT)
        Children.push({
            Node: "(",
            Children: []
        })
        const test = this.parseExpression()
        Children.push(test)
        this.eat(TokensTypes.RIGHTPARENT)
        Children.push({
            Node: ")",
            Children: []
        })
        const body = this.parseStatement()
        Children.push(body)
        return {
            Node: "WhileStatement",
            Children
        }
    }
    parseExpressionOrAssignmentStatement(): Node {
        // First Token Identifier
        const leftIdToken: Identifier = {
            Node: "Identifier",
            Children: [],
            value: this.currentToken?.value as string
        }
        this.eat(TokensTypes.IDENTIFIER)
        switch (this.currentToken?.type) {
            case TokensTypes.EQUAL:
                return this.parseAssignmentStatment(leftIdToken)
            default:
                return this.parseExpressionStatement(leftIdToken)
        }
    }
    parseAssignmentStatment(left: Identifier): AssignmentStatement {
        const Children: Node[] = []
        Children.push(left)
        this.eat(TokensTypes.EQUAL)
        Children.push({
            Node: "=",
            Children: []
        })
        const right = this.expr()
        Children.push(right)
        this.eat(TokensTypes.SEMI)
        Children.push({
            Node: ";",
            Children: []
        })
        return {
            Node: "AssignmentStatement",
            Children
        }
    }
    parseLogical(left?: Node): LogicalExpression {
        let node
        if (left) {
            node = left
        }
        else {
            node = this.parseConditionalExpression()
        }
        const Children: Node[] = []
        Children.push(node)
        // console.log(this.currentToken?.value)
        if (this.currentToken?.type === TokensTypes.OR || this.currentToken?.type === TokensTypes.AND) { // Binary
            const lop = this.currentToken.value as string
            if (this.currentToken.type === TokensTypes.AND) {
                this.eat(TokensTypes.AND)
                Children.push({
                    Node: lop,
                    Children: []
                })
            }
            else {
                this.eat(TokensTypes.OR)
                Children.push({
                    Node: lop,
                    Children: []
                })
            }

            const right = this.parseLogical()
            Children.push(right)
        }
        return {
            Node: "LogicalExpression",
            Children
        }
    }

    expr(left?: Node): Expr {
        let node
        // console.log("expr")
        if (left) {
            node = left
        }
        else {
            node = this.term()
        }
        const Children: Node[] = []
        Children.push(node)
        // console.log(this.currentToken?.value)
        if (this.currentToken?.value === "+" || this.currentToken?.value === "-") { // Binary
            const op = this.currentToken.value
            this.eat(TokensTypes.OP)
            Children.push({
                Node: op,
                Children: []
            })
            const right = this.expr()
            Children.push(right)
        }
        return {
            Node: "Expr",
            Children
        }
    }
    term(): Term {
        // console.log("term")
        const Children: Node[] = []
        let node = this.factor()!
        Children.push(node)
        // console.log(this.currentToken)
        if (this.currentToken?.value === "*" || this.currentToken?.value === "/") {
            const op = this.currentToken.value
            this.eat(TokensTypes.OP)
            Children.push({
                Node: op,
                Children: []
            })
            const right = this.term()
            Children.push(right)

        }
        return {
            Node: "Term",
            Children
        }
    }
    factor(): Factor {
        // console.log("factor")
        // console.log(this.currentToken)
        // ( expr )
        if (this.currentToken?.type == TokensTypes.LEFTPARENT) {
            const Children: Node[] = []
            this.eat(TokensTypes.LEFTPARENT)
            Children.push({
                Node: "(",
                Children: []
            })
            const node = this.expr()
            Children.push(node)
            this.eat(TokensTypes.RIGHTPARENT)
            Children.push({
                Node: ")",
                Children: []
            })
            return {
                Node: "Factor",
                Children
            }
        }
        // -factor | +factor
        else if (this.currentToken?.value === "-" || this.currentToken?.value === "+") { // Unary
            const Children: Node[] = []
            const unary = this.parseUnaryExpression()
            Children.push(unary)
            return {
                Node: "Factor",
                Children
            };
        }
        // number
        else if (this.currentToken?.type == TokensTypes.INTEGER) {
            // this.error()
            const Children: Node[] = []
            Children.push({
                Node: "Number",
                Children: [],
                value: this.currentToken.value
            })
            this.eat(TokensTypes.INTEGER)
            return {
                Node: "Factor",
                Children
            }
        }
        // IDENTIFIER
        else if (this.currentToken?.type == TokensTypes.IDENTIFIER) {
            const Children: Node[] = []
            Children.push({
                Node: "Identifier",
                Children: [],
                value: this.currentToken.value
            })
            this.eat(TokensTypes.IDENTIFIER)
            return {
                Node: "Factor",
                Children
            }
        }
        this.error()
        return {
            Node: "Factor",
            Children: []
        }
    }
    parseUnaryExpression(): UnaryExpression {
        const Children: Node[] = []
        const op = this.currentToken!.value as string
        this.eat(TokensTypes.OP)
        Children.push({
            Node: op,
            Children: []
        })
        const argument = this.factor()!
        Children.push(argument)
        return {
            Node: "UnaryExpression",
            Children
        }
    }
    skipNewLines() {
        while (this.currentToken?.type === TokensTypes.NEWLINE) {
            this.eat(TokensTypes.NEWLINE)
        }
    }
}