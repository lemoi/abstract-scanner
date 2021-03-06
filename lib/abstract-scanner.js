"use strict";
exports.__esModule = true;
var token_1 = require("./token");
var utils = require("./utils");
var AbstractScanner = (function () {
    function AbstractScanner(source, config) {
        this.source = source;
        this.marker = {
            index: 0,
            line: 1,
            column: 1
        };
        this.length = this.source.length;
        if (config) {
            if (config.start !== undefined) {
                this.marker.index = config.start;
            }
            if (config.line !== undefined) {
                this.marker.line = config.line;
            }
            if (config.column !== undefined) {
                this.marker.column = config.column;
            }
            if (config.end !== undefined) {
                this.length = config.end - this.marker.index;
            }
        }
        if (this.length === 0) {
            this.marker.line = 0;
            this.marker.column = 0;
        }
        this.scanStartingMarker = null;
        this.scanEndingMarker = null;
    }
    AbstractScanner.prototype.saveState = function () {
        return {
            index: this.marker.index,
            line: this.marker.line,
            column: this.marker.column
        };
    };
    AbstractScanner.prototype.restoreState = function (state) {
        this.marker = state;
    };
    AbstractScanner.prototype.startScan = function () {
        this.scanStartingMarker = this.saveState();
    };
    AbstractScanner.prototype.endScan = function () {
        this.scanEndingMarker = this.saveState();
    };
    AbstractScanner.prototype.clear = function () {
        this.scanStartingMarker = null;
        this.scanEndingMarker = null;
    };
    AbstractScanner.prototype.getScanLength = function () {
        if (this.scanStartingMarker !== null) {
            return this.marker.index - this.scanStartingMarker.index;
        }
        throw new Error('The scan has not been started. ');
    };
    AbstractScanner.prototype.getScanResult = function () {
        if (this.scanStartingMarker !== null) {
            return this.source.substring(this.scanStartingMarker.index, this.marker.index);
        }
        throw new Error('The scan has not been started. ');
    };
    AbstractScanner.prototype.constructToken = function (type) {
        if (this.scanStartingMarker !== null && this.scanEndingMarker !== null) {
            var token = new token_1.Token(type, this.source.substring(this.scanStartingMarker.index, this.scanEndingMarker.index), this.scanStartingMarker, this.scanEndingMarker);
            this.clear();
            return token;
        }
        throw new Error('The function `startScan` or `endScan` might not have been called. ');
    };
    AbstractScanner.prototype.constructIllegalToken = function (message) {
        if (message === void 0) { message = 'Illegal token. '; }
        var token = this.constructToken('ILLEGAL');
        token.message = message;
        return token;
    };
    AbstractScanner.prototype.eof = function () {
        return this.marker.index >= this.length;
    };
    AbstractScanner.prototype.peek = function (length) {
        if (length === void 0) { length = 1; }
        return this.source.substr(this.marker.index, length);
    };
    AbstractScanner.prototype.move = function (offset) {
        if (offset === void 0) { offset = 1; }
        this.marker.index += offset;
        this.marker.column += offset;
    };
    // note: here is charCode but not codePoint
    AbstractScanner.prototype.moveWhen = function (judge) {
        while (!this.eof()) {
            var ch = this.peek();
            var cc = ch.charCodeAt(0);
            if (!judge(cc, ch)) {
                break;
            }
            this.move(ch.length);
        }
    };
    /* tslint:disable:no-bitwise */
    AbstractScanner.prototype.fromCodePoint = function (cp) {
        return (cp < 0x10000) ? String.fromCharCode(cp) :
            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
                String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
    };
    AbstractScanner.prototype.fromCharCode = function (cc) {
        return String.fromCharCode(cc);
    };
    AbstractScanner.prototype.getCodePoint = function (offset) {
        if (offset === void 0) { offset = 0; }
        var index = this.marker.index + offset;
        var first = this.source.charCodeAt(index);
        var cp = first;
        if (first >= 0xD800 && first <= 0xDBFF) {
            var second = this.source.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }
        return cp;
    };
    AbstractScanner.prototype.getCharCode = function (offset) {
        if (offset === void 0) { offset = 0; }
        return this.source.charCodeAt(this.marker.index + offset);
    };
    AbstractScanner.prototype.scanLineTerminator = function () {
        var str = '';
        var cc = this.getCharCode();
        if (utils.isLineTerminator(cc)) {
            if (cc === 0x0D && this.getCharCode(1) === 0x0A) {
                str = '\r\n';
                this.move(2);
            }
            else {
                str = this.fromCharCode(cc);
                this.move();
            }
            this.marker.line++;
            this.marker.column = 1;
        }
        return str;
    };
    AbstractScanner.prototype.scanBlankSpace = function () {
        var str = '';
        var cc = this.getCharCode();
        while (utils.isWhiteSpace(cc)) {
            str += this.fromCharCode(cc);
            this.move();
            if (this.eof()) {
                break;
            }
            cc = this.getCharCode();
        }
        return str;
    };
    AbstractScanner.prototype.skipSpace = function () {
        while (!this.eof() &&
            (this.scanBlankSpace().length > 0 ||
                this.scanLineTerminator().length > 0))
            ;
    };
    return AbstractScanner;
}());
exports.AbstractScanner = AbstractScanner;
