import { AbstractScanner, Token, utils } from '../';

/*
   An example of tokenizing JavaScript.
   This scanner will ignore errors and regard the invaild literal as
   a token with type `ILLEGAL`.

   note: The method scanRegularExpressionLiteral() is not implemeted here, so
   this scanner can't handle the regular expression literal properly.
*/

export const TokenType = {
    Identifier: 'Identifier',
    NumericLiteral: 'Numeric',
    Punctuator: 'Punctuator',
    StringLiteral: 'String',
    Template: 'Template',
    Comment: 'Comment'
};

export class Scanner extends AbstractScanner {

    braceStack: string[];

    constructor(source: string) {
        super(source);
        this.braceStack = [];
    }

    scanComment(): Token | null {
        const str = this.peek(2);
        if (str === '//') {
            this.startScan();
            this.move(2);
            while (!this.eof()) {
                if (utils.isLineTerminator(this.getCharCode())) {
                    break;
                }
                this.move();
            }
            this.endScan();
            const token = this.constructToken(TokenType.Comment);
            token.message = 'SingleLineComment';
            return token;
        } else if (str === '/*') {
            this.startScan();
            this.move(2);
            while (!this.eof()) {
                this.scanLineTerminator();
                if (this.peek() === '*') {
                    this.move();
                    if (this.peek() === '/') {
                        this.move();
                        break;
                    } else {
                        continue;
                    }
                }
                this.move();
            }
            this.endScan();
            const token = this.constructToken(TokenType.Comment);
            token.message = 'MultiLineComment';
            return token;
        }
        return null;
    }

    scanHexLiteral(): Token | null {
        const str = this.peek(2);
        if (str[0] === '0' && (str[1] === 'x' || str[1] === 'X')) {
            this.startScan();
            this.move(2);
            this.moveWhen(utils.isHexDigit);
            this.endScan();
            let token: Token;
            if (this.getScanLength() === 2) {
                token = this.constructIllegalToken();
            } else {
                token = this.constructToken(TokenType.NumericLiteral);
                token.value = parseInt(token.source, 16);
            }
            return token;
        }
        return null;
    }

    scanBinaryLiteral(): Token | null {
        const str = this.peek(2);
        if (str[0] === '0' && (str[1] === 'b' || str[1] === 'B')) {
            this.startScan();
            this.move(2);
            this.moveWhen(utils.isBinaryDigit);
            this.endScan();
            let token: Token;
            if (this.getScanLength() === 2) {
                token = this.constructIllegalToken();
            } else {
                token = this.constructToken(TokenType.NumericLiteral);
                token.value = parseInt(token.source.slice(2), 2);
                token.message = 'BinaryLiteral';
            }
            return token;
        }
        return null;
    }

    scanOctalLiteral(): Token | null {
        let str = this.peek(2);
        let pass = false;
        let legacy = false;
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        if (str[0] === '0') {
            if (str[1] === 'o' || str[1] === 'O') {
                pass = true;
            } else if (utils.isOctalDigit(this.getCharCode(1))) {
                pass = true;
                legacy = true;
            }
        }
        if (pass) {
            this.startScan();
            this.move(2);
            this.moveWhen(utils.isOctalDigit);
            this.endScan();
            let token: Token;
            if (!legacy && this.getScanLength() === 2) {
                token = this.constructIllegalToken();
            } else {
                token = this.constructToken(TokenType.NumericLiteral);
                str = token.source;
                if (!legacy) {
                    str = str.slice(2);
                }
                token.value = parseInt(str, 8);
                token.message = 'OctalLiteral';
            }
            return token;
        }
        return null;
    }

    scanDecimalLiteral(): Token | null {
        let ch = this.peek();
        if (utils.isDecimalDigit(this.getCodePoint()) || (ch === '.' &&
            utils.isDecimalDigit(this.getCharCode(1)))) {
            this.startScan();
            this.move();
            this.moveWhen(utils.isDecimalDigit);
            if (this.peek() === '.') {
                this.move();
                this.moveWhen(utils.isDecimalDigit);
            }
            ch = this.peek();
            if (ch === 'e' || ch === 'E') {
                this.move();
                ch = this.peek();
                if (ch === '-' || ch === '+') {
                    this.move();
                }
                this.moveWhen(utils.isDecimalDigit);
            }
            this.endScan();
            const token = this.constructToken(TokenType.NumericLiteral);
            token.value = parseFloat(token.source);
            token.message = 'DecimalLiteral';
            return token;
        }
        return null;
    }

    scanNumericLiteral(): Token | null {
        return this.scanHexLiteral() || this.scanOctalLiteral()
        || this.scanBinaryLiteral() || this.scanDecimalLiteral();
    }

    scanPunctuator(): Token | null {
        let str = this.peek();
        this.startScan();
        // Check for most common single-character punctuators.
        if ('({});,[]:?~'.indexOf(str) >= 0) {
            if (str === '{') {
                this.braceStack.push('{');
            } else if (str === '}') {
                this.braceStack.pop();
            }
            this.move();
        } else {
            str = this.peek(4);
            // 4-character punctuator.
            if (str === '>>>=') {
                this.move(4);
            } else {
                // 3-character punctuators.
                str = str.substr(0, 3);
                if (str === '===' || str === '!==' || str === '>>>' ||
                    str === '<<=' || str === '>>=' || str === '**=' ||
                    str === '...') {
                    this.move(3);
                } else {
                    // 2-character punctuators.
                    str = str.substr(0, 2);
                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                        str === '<=' || str === '>=' || str === '=>' || str === '**') {
                        this.move(2);                      
                    } else {
                        // 1-character punctuators.
                        str = str[0];
                        if ('.<>=!+-*%&|^/'.indexOf(str) >= 0) {
                            this.move();
                        }
                    }
                }
            }           
        }
        this.endScan();
        if (this.getScanLength() > 0) {
            const token = this.constructToken(TokenType.Punctuator);
            token.value = token.source;
            return token;
        } else {
            this.clear();
            return null;
        }
    }

    scanUnicodeEscapeSequence(errs: string[]): string;
    scanUnicodeEscapeSequence(errs: string[], gcp: boolean): [number, string];
    scanUnicodeEscapeSequence(errs: string[], gcp?: boolean): any {
        let seq = '';
        let str = '';
        let cp = -1;
        if (this.peek() === '{') {
            this.move();
            // max 0x10FFFF
            while (!this.eof() &&
                utils.isHexDigit(this.getCharCode())) {
                seq += this.peek();
                this.move();
            }
            cp = parseInt(seq, 16);
            str = this.peek();
                            // NaN
            if (str !== '}' || cp !== cp || cp > 0x10FFFF) {
                if (str === '}') {
                    this.move();
                }
                cp = -1;
                str = '';
                errs.push('Invalid Unicode escape sequence > '
                    + this.getScanLength() + ': \\u{ HexDigits }. ');
            } else {
                str = this.fromCodePoint(cp);
                this.move();
            }
        } else {
            seq = this.peek(4);
            if (utils.isHexDigit(seq.charCodeAt(0)) &&
                utils.isHexDigit(seq.charCodeAt(1)) &&
                utils.isHexDigit(seq.charCodeAt(2)) &&
                utils.isHexDigit(seq.charCodeAt(3))) {
                cp = parseInt(seq, 16);
                str = String.fromCharCode(cp);
                this.move(4);
            } else {
                errs.push('Invalid Unicode escape sequence > '
                    + this.getScanLength() + ': \\u HexDigit * 4. ');                                
            }
        }
        if (gcp) {
            return [cp, str];
        } else {
            return str;
        }
    } 

    scanStringLiteral(): Token | null {
        let ch = this.peek();
        if (ch === '\'' || ch === '"') {
            this.startScan();
            this.move();
            let str = '';
            const errs: string[] = [];
            let quote = ch;
            while (!this.eof()) {
                ch = this.peek();
                if (ch === quote) {
                    quote = '';
                    this.move();
                    break;
                } else if (ch === '\\') {
                    this.move();
                    if (this.eof()) {
                        break;
                    }
                    if (this.scanLineTerminator()) {
                        continue;
                    }
                    ch = this.peek();
                    if (ch === 'x') {
                        this.move();
                        const seq = this.peek(2);
                        if (utils.isHexDigit(seq.charCodeAt(0)) &&
                            utils.isHexDigit(seq.charCodeAt(1))) {
                            str += String.fromCharCode(parseInt(seq, 16));
                            this.move(2);
                        } else {
                            errs.push('Invalid hexadecimal escape sequence > '
                                + this.getScanLength() + ': \\x HexDigit * 2. ');
                        }
                    } else if (ch === 'u') {
                        this.move();
                        str += this.scanUnicodeEscapeSequence(errs);
                    } else {
                        let tp = 'nrtbfv'.indexOf(ch);
                        if (tp >= 0) {
                            str += '\n\r\t\b\f\v'[tp];
                            this.move();
                        } else {
                            tp = ch.charCodeAt(0);
                            if (utils.isOctalDigit(tp)) {
                                // https://tc39.github.io/ecma262/#prod-annexB-LegacyOctalEscapeSequence
                                // LegacyOctalEscapeSequence
                                // max \377
                                let seq = ch;
                                this.move();
                                // `3` U+0x33
                                if (tp <= 0x33 && utils.isOctalDigit(this.getCharCode())) {
                                    seq += this.peek();
                                    this.move();
                                    if (utils.isOctalDigit(this.getCharCode())) {
                                        seq += this.peek();
                                        this.move();
                                    }
                                }
                                str += String.fromCharCode(parseInt(seq, 16));
                            } else {
                                str += ch;
                                this.move();
                            }
                        }
                    }
                } else if (utils.isLineTerminator(ch.charCodeAt(0))) {
                    break;
                } else {
                    str += ch;
                    this.move();
                }
            }
            this.endScan();
            if (quote !== '') {
                errs.push('Unterminated string literal. ');
            }
            if (errs.length > 0) {
                return this.constructIllegalToken(errs);
            } else {
                const token = this.constructToken(TokenType.StringLiteral);
                token.value = str;
                return token;
            }
        }
        return null;
    }

    scanIdentifier(): Token | null {
        let cp = this.getCodePoint();
        if (utils.JS.isIdentifierStart(cp)) {
            const errs: string[] = [];
            let str = '';
            let ch = this.fromCodePoint(cp);
            this.startScan();
            this.move();
            // `\`
            if (cp === 0x5C) {
                cp = this.getCodePoint();
                // `u`
                if (cp === 0x75) {
                    this.move();
                    [cp, ch] = this.scanUnicodeEscapeSequence(errs, true);
                    if (utils.JS.isIdentifierStart(cp)) {
                        str += ch;
                    } else {
                        errs.push('Invalid identifier starter > '
                        + this.getScanLength() + '. ');
                    }
                } else {
                    errs.push('Unrecongnised  character `\\` > 0. ');
                }
            } else {
                str += ch;
            }
            while (!this.eof()) {
                cp = this.getCodePoint();
                if (!utils.JS.isIdentifierPart(cp)) {
                    break;
                }
                ch = this.fromCodePoint(cp);
                if (cp === 0x5C) {
                    this.move();
                    cp = this.getCodePoint();
                    if (cp === 0x75) {
                        this.move();
                        [cp, ch] = this.scanUnicodeEscapeSequence(errs, true);
                        if (utils.JS.isIdentifierPart(cp)) {
                            str += ch;
                        } else {
                            errs.push('Invalid identifier parter > '
                            + this.getScanLength() + '. ');
                        }
                    } else {
                        errs.push('Unrecongnised character `\\` > '
                            + this.getScanLength() + '. ');
                    }
                } else {
                    str += ch;
                    this.move(ch.length);
                }
            }
            this.endScan();
            if (errs.length > 0) {
                return this.constructIllegalToken(errs);
            } else {
                const token = this.constructToken(TokenType.Identifier);
                token.value = str;
                if (utils.JS.isKeyword(str)) {
                    token.message = 'Keyword';
                } else if (str === 'true' || str === 'false') {
                    token.message = 'Boolean';
                } else if (str === 'null') {
                    token.message = 'Null';
                }
                return token;
            }
        }
        return null;
    }

// https://tc39.github.io/ecma262/#sec-template-literal-lexical-components
    scanTemplate(): Token | null {
        let ch = this.peek();
        const head = (ch === '`');
        if (head || (ch === '}' && this.braceStack[this.braceStack.length - 1] === '${')) {
            this.startScan();
            this.move();
            let str = '';
            let middle = false;
            let tail = false;
            const errs: string[] = [];
            while (!this.eof()) {
                if (this.peek(2) === '${') {
                    middle = true;
                    this.braceStack.push('${');
                    this.move(2);
                    break;
                } else {
                    ch = this.scanLineTerminator();
                    if (ch) {
                        str += ch;
                        continue;
                    }
                    ch = this.peek();
                    if (ch === '`') {
                        this.move();
                        tail = true;
                        break;
                    } else if (ch === '\\') {
                        this.move();
                        if (this.eof()) {
                            break;
                        }
                        if (this.scanLineTerminator()) {
                            continue;
                        }
                        ch = this.peek();
                        if (ch === 'x') {
                            this.move();
                            const seq = this.peek(2);
                            if (utils.isHexDigit(seq.charCodeAt(0)) &&
                                utils.isHexDigit(seq.charCodeAt(1))) {
                                str += String.fromCharCode(parseInt(seq, 16));
                                this.move(2);
                            } else {
                                errs.push('Invalid hexadecimal escape sequence > '
                                    + this.getScanLength() + ': \\x HexDigit * 2. ');
                            }
                        } else if (ch === 'u') {
                            this.move();
                            str += this.scanUnicodeEscapeSequence(errs);
                        } else if (ch === '0') {
                            this.move();
                            if (utils.isDecimalDigit(this.getCharCode())) {
                                errs.push('Octal literals are not allowed in template strings > '
                                    + this.getScanLength() + '. ');
                            } else {
                                str += '\0';
                            }
                        } else {
                            let tp = 'nrtbfv'.indexOf(ch);
                            if (tp >= 0) {
                                str += '\n\r\t\b\f\v'[tp];
                                this.move();
                            } else {
                                tp = ch.charCodeAt(0);
                                if (utils.isOctalDigit(tp)) {
                                    errs.push('Octal literals are not allowed in template strings > '
                                        + this.getScanLength() + '. ');
                                    this.move();                                   
                                } else {
                                    str += ch;
                                    this.move();
                                }
                            }
                        }                       
                    } else {
                        str += ch;
                        this.move();
                    }
                }
            }
            this.endScan();
            if (!middle && !tail) {
                errs.push('Unterminated string literal. ');
            }
            if (!head) {
                this.braceStack.pop();
            }
            if (errs.length > 0) {
                return this.constructIllegalToken(errs);
            } else {
                const token = this.constructToken(TokenType.Template);
                token.value = str;
                let msg = 'NoSubstitutionTemplate';
                if (head) {
                    if (middle) {
                        msg = 'TemplateHead';
                    }
                } else {
                    if (middle) {
                        msg = 'TemplateMiddle';
                    } else {
                        msg = 'TemplateTail';
                    }
                }
                token.message = msg;
                return token;
            }
        }
        return null;
    }

    nextToken(): Token | null {
        if (!this.eof()) {
            return this.scanStringLiteral() || this.scanIdentifier() ||
            this.scanNumericLiteral() || this.scanComment() ||
            this.scanTemplate() || this.scanPunctuator(); 
        }
        return null;
    }
}
