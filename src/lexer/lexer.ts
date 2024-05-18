import TokensTypes from "../def/tokensTypes";
import Token from "../def/token";
import Digits from "../values/digits";
import Ops from "../values/ops";
import tokenLookup from "./tokenLookup";
import { operator } from "../def/nodes";
import { isIdPart } from "./charCLassifier";
import ReservedKeywords from "./reservedKeywords";


export default class Lexer {
    currentChar: string | undefined;
    pos: number;
    text: string;
    line: number;
    col: number;
    fileName:string;
    constructor(text: string , fileName:string) {
        this.currentChar = text[0]
        this.text = text
        this.pos = 0
        this.line = 1
        this.col = 1
        this.fileName=fileName
    }
    skipWhiteSpaces() {
        while (this.currentChar == " ") {
            this.advance()
        }
    }
    getNextToken(): Token | undefined {
        // console.log(this.currentChar)
        this.skipWhiteSpaces()
        if (this.currentChar === undefined) {
            return {
                type: TokensTypes.EOF,
                line: this.line,
                col: this.col
            }
        }
        let token = tokenLookup[this.text[this.pos].charCodeAt(0)];
        // console.log(this.text[this.pos], token)
        // console.log(this.pos)
        // console.log(this.text[this.pos].charCodeAt(0))
        switch (token) {
            case TokensTypes.LEFTPARENT:
            case TokensTypes.RIGHTPARENT:
            case TokensTypes.LEFTCURL:
            case TokensTypes.RIGHTCURL:
            case TokensTypes.NEWLINE:
            case TokensTypes.SEMI:
            case TokensTypes.COLON:
                this.advance()
                return {
                    type: token,
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.INTEGER:
                return this.scanInteger()
            case TokensTypes.OP:
                const op = this.currentChar
                this.advance()
                return {
                    type: TokensTypes.OP,
                    value: op,
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.IDENTIFIER:
                return this.scanIdentifier()
            case TokensTypes.EQUAL:  // '=', '==', '==='
                this.advance()
                if (this.currentChar === "=") {
                    this.advance()
                    if (this.currentChar === "=") {
                        this.advance()
                        return {
                            type: TokensTypes.STRICT_EQUAL,
                            value: "===",
                            line: this.line,
                            col: this.col
                        }
                    }
                    return {
                        type: TokensTypes.LOOSE_EQUAL,
                        value: "==",
                        line: this.line,
                        col: this.col
                    }
                } else {
                    return {
                        type: TokensTypes.EQUAL,
                        line: this.line,
                        col: this.col
                    }
                }
            case TokensTypes.GREATER_THAN: // '>', '>='
                this.advance()
                if (this.currentChar === "=") {
                    return {
                        type: TokensTypes.GREATER_THAN_EQUAL,
                        value: ">=",
                        line: this.line,
                        col: this.col
                    }
                }
                return {
                    type: TokensTypes.GREATER_THAN,
                    value: ">",
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.AND: // '&&'
                this.advance()
                if (this.currentChar === "&") {
                    this.advance()
                    return {
                        type: TokensTypes.AND,
                        value: "&&",
                        line: this.line,
                        col: this.col
                    }
                }
                this.error()
                return {
                    type: TokensTypes.GREATER_THAN,
                    value: "",
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.OR: // '||'
                this.advance()
                if (this.currentChar == "|") {
                    this.advance()
                    return {
                        type: TokensTypes.OR,
                        value: "||",
                        line: this.line,
                        col: this.col
                    }
                }
                this.error()
                return {
                    type: TokensTypes.GREATER_THAN,
                    value: "",
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.LESS_THAN: // '<', '<='
                this.advance()
                if (this.currentChar === "=") {
                    this.advance()
                    return {
                        type: TokensTypes.LESS_THAN_EQUAL,
                        value: "<=",
                        line: this.line,
                        col: this.col
                    }
                }
                return {
                    type: TokensTypes.LESS_THAN,
                    value: "<",
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.NOT: // '!', '!=',"!==" to dooo
                this.advance()
                if (this.currentChar === "=") {
                    this.advance()
                    return {
                        type: TokensTypes.NOT_EQUAL,
                        value: "!=",
                        line: this.line,
                        col: this.col
                    }
                }
                return {
                    type: TokensTypes.NOT,
                    line: this.line,
                    col: this.col
                }
            case TokensTypes.EOF:
                return {
                    type: TokensTypes.EOF,
                    value: "EOF",
                    line: this.line,
                    col: this.col
                }

        }
        this.error()
    }
    error() {
        throw new Error("Unexpected Character: " + this.currentChar + "\n\tat: " + this.fileName + ":" + this.line + ":" + this.col + "\n")
    }
    advance() {
        if (this.pos >= this.text.length) {
            this.currentChar = undefined
        } else {
            this.pos += 1
            if (this.text[this.pos] == '\n') {
                this.line += 1;
                this.col = 1;
            } else {
                this.col += 1;
            }
            this.currentChar = this.text[this.pos]
        }
    }
    scanInteger(): Token {
        let num = ''
        while (Object.keys(Digits).some((d) => d === this.currentChar)) {
            num += this.currentChar
            this.advance()
        }
        return {
            type: TokensTypes.INTEGER,
            value: parseInt(num),
            line: this.line,
            col: this.col
        }

    }
    scanIdentifier(): Token {
        let id = ""
        while (this.currentChar && isIdPart[this.currentChar.charCodeAt(0)]) {
            id += this.currentChar
            this.advance()
        }
        if (Object.keys(ReservedKeywords).includes(id)) {
            let values = Object.values(ReservedKeywords)
            let keys = Object.keys(ReservedKeywords)
            let type: TokensTypes = TokensTypes.EOF
            keys.forEach((e, index) => {
                if (e === id) {
                    type = values[index]
                }
            })
            return {
                type,
                line: this.line,
                col: this.col
            }
        }
        return {
            type: TokensTypes.IDENTIFIER,
            value: id,
            line: this.line,
            col: this.col
        }
    }
}
