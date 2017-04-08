"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var _1 = require("../");
/*
   An example of tokenizing JavaScript.
   This scanner will ignore errors and regard the invaild literal as
   a token with type `ILLEGAL`.

   note: The method scanRegularExpressionLiteral() is not implemeted here, so
   this scanner can't handle the regular expression literal properly.
*/
exports.TokenType = {
    Identifier: 'Identifier',
    NumericLiteral: 'Numeric',
    Punctuator: 'Punctuator',
    StringLiteral: 'String',
    Template: 'Template',
    Comment: 'Comment'
};
var Scanner = (function (_super) {
    __extends(Scanner, _super);
    function Scanner(source) {
        var _this = _super.call(this, source) || this;
        _this.braceStack = [];
        return _this;
    }
    Scanner.prototype.scanComment = function () {
        var str = this.peek(2);
        if (str === '//') {
            this.startScan();
            this.move(2);
            while (!this.eof()) {
                if (_1.utils.isLineTerminator(this.getCharCode())) {
                    break;
                }
                this.move();
            }
            this.endScan();
            var token = this.constructToken(exports.TokenType.Comment);
            token.message = 'SingleLineComment';
            return token;
        }
        else if (str === '/*') {
            this.startScan();
            this.move(2);
            while (!this.eof()) {
                this.scanLineTerminator();
                if (this.peek() === '*') {
                    this.move();
                    if (this.peek() === '/') {
                        this.move();
                        break;
                    }
                    else {
                        continue;
                    }
                }
                this.move();
            }
            this.endScan();
            var token = this.constructToken(exports.TokenType.Comment);
            token.message = 'MultiLineComment';
            return token;
        }
        return null;
    };
    Scanner.prototype.scanHexLiteral = function () {
        var str = this.peek(2);
        if (str[0] === '0' && (str[1] === 'x' || str[1] === 'X')) {
            this.startScan();
            this.move(2);
            this.moveWhen(_1.utils.isHexDigit);
            this.endScan();
            var token = void 0;
            if (this.getScanLength() === 2) {
                token = this.constructIllegalToken();
            }
            else {
                token = this.constructToken(exports.TokenType.NumericLiteral);
                token.value = parseInt(token.source, 16);
            }
            return token;
        }
        return null;
    };
    Scanner.prototype.scanBinaryLiteral = function () {
        var str = this.peek(2);
        if (str[0] === '0' && (str[1] === 'b' || str[1] === 'B')) {
            this.startScan();
            this.move(2);
            this.moveWhen(_1.utils.isBinaryDigit);
            this.endScan();
            var token = void 0;
            if (this.getScanLength() === 2) {
                token = this.constructIllegalToken();
            }
            else {
                token = this.constructToken(exports.TokenType.NumericLiteral);
                token.value = parseInt(token.source.slice(2), 2);
                token.message = 'BinaryLiteral';
            }
            return token;
        }
        return null;
    };
    Scanner.prototype.scanOctalLiteral = function () {
        var str = this.peek(2);
        var pass = false;
        var legacy = false;
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        if (str[0] === '0') {
            if (str[1] === 'o' || str[1] === 'O') {
                pass = true;
            }
            else if (_1.utils.isOctalDigit(this.getCharCode(1))) {
                pass = true;
                legacy = true;
            }
        }
        if (pass) {
            this.startScan();
            this.move(2);
            this.moveWhen(_1.utils.isOctalDigit);
            this.endScan();
            var token = void 0;
            if (!legacy && this.getScanLength() === 2) {
                token = this.constructIllegalToken();
            }
            else {
                token = this.constructToken(exports.TokenType.NumericLiteral);
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
    };
    Scanner.prototype.scanDecimalLiteral = function () {
        var ch = this.peek();
        if (_1.utils.isDecimalDigit(this.getCodePoint()) || (ch === '.' &&
            _1.utils.isDecimalDigit(this.getCharCode(1)))) {
            this.startScan();
            this.move();
            this.moveWhen(_1.utils.isDecimalDigit);
            if (this.peek() === '.') {
                this.move();
                this.moveWhen(_1.utils.isDecimalDigit);
            }
            ch = this.peek();
            if (ch === 'e' || ch === 'E') {
                this.move();
                ch = this.peek();
                if (ch === '-' || ch === '+') {
                    this.move();
                }
                this.moveWhen(_1.utils.isDecimalDigit);
            }
            this.endScan();
            var token = this.constructToken(exports.TokenType.NumericLiteral);
            token.value = parseFloat(token.source);
            token.message = 'DecimalLiteral';
            return token;
        }
        return null;
    };
    Scanner.prototype.scanNumericLiteral = function () {
        return this.scanHexLiteral() || this.scanOctalLiteral()
            || this.scanBinaryLiteral() || this.scanDecimalLiteral();
    };
    Scanner.prototype.scanPunctuator = function () {
        var str = this.peek();
        this.startScan();
        // Check for most common single-character punctuators.
        if ('({});,[]:?~'.indexOf(str) >= 0) {
            if (str === '{') {
                this.braceStack.push('{');
            }
            else if (str === '}') {
                this.braceStack.pop();
            }
            this.move();
        }
        else {
            str = this.peek(4);
            // 4-character punctuator.
            if (str === '>>>=') {
                this.move(4);
            }
            else {
                // 3-character punctuators.
                str = str.substr(0, 3);
                if (str === '===' || str === '!==' || str === '>>>' ||
                    str === '<<=' || str === '>>=' || str === '**=' ||
                    str === '...') {
                    this.move(3);
                }
                else {
                    // 2-character punctuators.
                    str = str.substr(0, 2);
                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                        str === '<=' || str === '>=' || str === '=>' || str === '**') {
                        this.move(2);
                    }
                    else {
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
            var token = this.constructToken(exports.TokenType.Punctuator);
            token.value = token.source;
            return token;
        }
        else {
            this.clear();
            return null;
        }
    };
    Scanner.prototype.scanUnicodeEscapeSequence = function (errs, gcp) {
        var seq = '';
        var str = '';
        var cp = -1;
        if (this.peek() === '{') {
            this.move();
            // max 0x10FFFF
            while (!this.eof() &&
                _1.utils.isHexDigit(this.getCharCode())) {
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
            }
            else {
                str = this.fromCodePoint(cp);
                this.move();
            }
        }
        else {
            seq = this.peek(4);
            if (_1.utils.isHexDigit(seq.charCodeAt(0)) &&
                _1.utils.isHexDigit(seq.charCodeAt(1)) &&
                _1.utils.isHexDigit(seq.charCodeAt(2)) &&
                _1.utils.isHexDigit(seq.charCodeAt(3))) {
                cp = parseInt(seq, 16);
                str = String.fromCharCode(cp);
                this.move(4);
            }
            else {
                errs.push('Invalid Unicode escape sequence > '
                    + this.getScanLength() + ': \\u HexDigit * 4. ');
            }
        }
        if (gcp) {
            return [cp, str];
        }
        else {
            return str;
        }
    };
    Scanner.prototype.scanStringLiteral = function () {
        var ch = this.peek();
        if (ch === '\'' || ch === '"') {
            this.startScan();
            this.move();
            var str = '';
            var errs = [];
            var quote = ch;
            while (!this.eof()) {
                ch = this.peek();
                if (ch === quote) {
                    quote = '';
                    this.move();
                    break;
                }
                else if (ch === '\\') {
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
                        var seq = this.peek(2);
                        if (_1.utils.isHexDigit(seq.charCodeAt(0)) &&
                            _1.utils.isHexDigit(seq.charCodeAt(1))) {
                            str += String.fromCharCode(parseInt(seq, 16));
                            this.move(2);
                        }
                        else {
                            errs.push('Invalid hexadecimal escape sequence > '
                                + this.getScanLength() + ': \\x HexDigit * 2. ');
                        }
                    }
                    else if (ch === 'u') {
                        this.move();
                        str += this.scanUnicodeEscapeSequence(errs);
                    }
                    else {
                        var tp = 'nrtbfv'.indexOf(ch);
                        if (tp >= 0) {
                            str += '\n\r\t\b\f\v'[tp];
                            this.move();
                        }
                        else {
                            tp = ch.charCodeAt(0);
                            if (_1.utils.isOctalDigit(tp)) {
                                // https://tc39.github.io/ecma262/#prod-annexB-LegacyOctalEscapeSequence
                                // LegacyOctalEscapeSequence
                                // max \377
                                var seq = ch;
                                this.move();
                                // `3` U+0x33
                                if (tp <= 0x33 && _1.utils.isOctalDigit(this.getCharCode())) {
                                    seq += this.peek();
                                    this.move();
                                    if (_1.utils.isOctalDigit(this.getCharCode())) {
                                        seq += this.peek();
                                        this.move();
                                    }
                                }
                                str += String.fromCharCode(parseInt(seq, 16));
                            }
                            else {
                                str += ch;
                                this.move();
                            }
                        }
                    }
                }
                else if (_1.utils.isLineTerminator(ch.charCodeAt(0))) {
                    break;
                }
                else {
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
            }
            else {
                var token = this.constructToken(exports.TokenType.StringLiteral);
                token.value = str;
                return token;
            }
        }
        return null;
    };
    Scanner.prototype.scanIdentifier = function () {
        var cp = this.getCodePoint();
        if (_1.utils.JS.isIdentifierStart(cp)) {
            var errs = [];
            var str = '';
            var ch = this.fromCodePoint(cp);
            this.startScan();
            this.move();
            // `\`
            if (cp === 0x5C) {
                cp = this.getCodePoint();
                // `u`
                if (cp === 0x75) {
                    this.move();
                    _a = this.scanUnicodeEscapeSequence(errs, true), cp = _a[0], ch = _a[1];
                    if (_1.utils.JS.isIdentifierStart(cp)) {
                        str += ch;
                    }
                    else {
                        errs.push('Invalid identifier starter > '
                            + this.getScanLength() + '. ');
                    }
                }
                else {
                    errs.push('Unrecongnised  character `\\` > 0. ');
                }
            }
            else {
                str += ch;
            }
            while (!this.eof()) {
                cp = this.getCodePoint();
                if (!_1.utils.JS.isIdentifierPart(cp)) {
                    break;
                }
                ch = this.fromCodePoint(cp);
                if (cp === 0x5C) {
                    this.move();
                    cp = this.getCodePoint();
                    if (cp === 0x75) {
                        this.move();
                        _b = this.scanUnicodeEscapeSequence(errs, true), cp = _b[0], ch = _b[1];
                        if (_1.utils.JS.isIdentifierPart(cp)) {
                            str += ch;
                        }
                        else {
                            errs.push('Invalid identifier parter > '
                                + this.getScanLength() + '. ');
                        }
                    }
                    else {
                        errs.push('Unrecongnised character `\\` > '
                            + this.getScanLength() + '. ');
                    }
                }
                else {
                    str += ch;
                    this.move(ch.length);
                }
            }
            this.endScan();
            if (errs.length > 0) {
                return this.constructIllegalToken(errs);
            }
            else {
                var token = this.constructToken(exports.TokenType.Identifier);
                token.value = str;
                if (_1.utils.JS.isKeyword(str)) {
                    token.message = 'Keyword';
                }
                else if (str === 'true' || str === 'false') {
                    token.message = 'Boolean';
                }
                else if (str === 'null') {
                    token.message = 'Null';
                }
                return token;
            }
        }
        return null;
        var _a, _b;
    };
    // https://tc39.github.io/ecma262/#sec-template-literal-lexical-components
    Scanner.prototype.scanTemplate = function () {
        var ch = this.peek();
        var head = (ch === '`');
        if (head || (ch === '}' && this.braceStack[this.braceStack.length - 1] === '${')) {
            this.startScan();
            this.move();
            var str = '';
            var middle = false;
            var tail = false;
            var errs = [];
            while (!this.eof()) {
                if (this.peek(2) === '${') {
                    middle = true;
                    this.braceStack.push('${');
                    this.move(2);
                    break;
                }
                else {
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
                    }
                    else if (ch === '\\') {
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
                            var seq = this.peek(2);
                            if (_1.utils.isHexDigit(seq.charCodeAt(0)) &&
                                _1.utils.isHexDigit(seq.charCodeAt(1))) {
                                str += String.fromCharCode(parseInt(seq, 16));
                                this.move(2);
                            }
                            else {
                                errs.push('Invalid hexadecimal escape sequence > '
                                    + this.getScanLength() + ': \\x HexDigit * 2. ');
                            }
                        }
                        else if (ch === 'u') {
                            this.move();
                            str += this.scanUnicodeEscapeSequence(errs);
                        }
                        else if (ch === '0') {
                            this.move();
                            if (_1.utils.isDecimalDigit(this.getCharCode())) {
                                errs.push('Octal literals are not allowed in template strings > '
                                    + this.getScanLength() + '. ');
                            }
                            else {
                                str += '\0';
                            }
                        }
                        else {
                            var tp = 'nrtbfv'.indexOf(ch);
                            if (tp >= 0) {
                                str += '\n\r\t\b\f\v'[tp];
                                this.move();
                            }
                            else {
                                tp = ch.charCodeAt(0);
                                if (_1.utils.isOctalDigit(tp)) {
                                    errs.push('Octal literals are not allowed in template strings > '
                                        + this.getScanLength() + '. ');
                                    this.move();
                                }
                                else {
                                    str += ch;
                                    this.move();
                                }
                            }
                        }
                    }
                    else {
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
            }
            else {
                var token = this.constructToken(exports.TokenType.Template);
                token.value = str;
                var msg = 'NoSubstitutionTemplate';
                if (head) {
                    if (middle) {
                        msg = 'TemplateHead';
                    }
                }
                else {
                    if (middle) {
                        msg = 'TemplateMiddle';
                    }
                    else {
                        msg = 'TemplateTail';
                    }
                }
                token.message = msg;
                return token;
            }
        }
        return null;
    };
    Scanner.prototype.nextToken = function () {
        if (!this.eof()) {
            return this.scanStringLiteral() || this.scanIdentifier() ||
                this.scanNumericLiteral() || this.scanComment() ||
                this.scanTemplate() || this.scanPunctuator();
        }
        return null;
    };
    return Scanner;
}(_1.AbstractScanner));
exports.Scanner = Scanner;
