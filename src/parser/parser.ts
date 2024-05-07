import TokensTypes from "../def/tokensTypes";
import Tokens from "../def/tokensTypes";
import Digits from "../values/digits";
import Ops from "../values/ops";
import Token from "./token";

export default class Parser {
    text: string;
    pos: number;
    currentChar: string | undefined;
    currentToken: Token | undefined;
    constructor(text: string) {
        this.currentChar = text[0]
        this.text = text
        this.pos = 0
        this.currentToken = undefined
    }
    skipWhiteSpaces() {
        while(this.currentChar == " ") {
            this.advance()
        }
    }
    getNextToken(): Token | undefined {
        while (this.currentChar != undefined) {
            if(this.currentChar == " ") {
                this.skipWhiteSpaces()
            }
            if (Object.keys(Digits).some((d) => d === this.currentChar)) {
                return this.integer()
            }
            if (this.currentChar == "+") {
                this.advance()
                return {
                    type: TokensTypes.OP,
                    value: Ops["+"]
                }
            }
            if (this.currentChar == "-") {
                this.advance()
                return {
                    type: TokensTypes.OP,
                    value: Ops["-"]
                }
            }
            if (this.currentChar === undefined) {
                return {
                    type: TokensTypes.EOF,
                    value: "EOF"
                }
            }
            this.error()
        }
    }
    eat(TokenType: TokensTypes) {
        if (this.currentToken?.type === TokenType) {
            this.currentToken = this.getNextToken()
        }
        else {
            this.error()
        }

    }
    error() {
        throw new Error("Unexpected Token")
    }
    advance() {
        if (this.pos >= this.text.length) {
            this.currentChar = undefined
        } else {
            this.pos += 1
            this.currentChar = this.text[this.pos]
        }
    }
    expr(): number {
        this.currentToken = this.getNextToken()
        const left = this.currentToken?.value
        this.eat(TokensTypes.INTEGER)
        const op = this.currentToken?.value
        this.eat(TokensTypes.OP)
        const right = this.currentToken?.value
        this.eat(TokensTypes.INTEGER)
        if (op == Ops["+"]) {
            return (left as number) + (right as number)
        }
        else {
            return (left as number) - (right as number)
        }
    }
    integer(): Token {
        let num = ''
        while (Object.keys(Digits).some((d) => d === this.currentChar)) {
            num += this.currentChar
            this.advance()
        }
        return {
            type: TokensTypes.INTEGER,
            value: parseInt(num)
        }

    }
}