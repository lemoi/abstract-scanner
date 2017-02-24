"use strict";
exports.__esModule = true;
var token_1 = require("./token");
var AbstractScanner = (function () {
    function AbstractScanner(source) {
        this.source = source;
        this.length = source.length;
        this.marker = {
            index: 0,
            line: this.length > 0 ? 1 : 0,
            column: this.length > 0 ? 1 : 0
        };
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
    AbstractScanner.prototype.constructToken = function (type) {
        if (this.scanStartingMarker !== null && this.scanEndingMarker !== null) {
            var token = new token_1.Token(type, this.source.substring(this.scanStartingMarker.index, this.scanEndingMarker.index), this.scanStartingMarker, this.scanEndingMarker);
            this.clear();
            return token;
        }
        throw new Error('The function `startScan` or `endScan` might not have been called. ');
    };
    AbstractScanner.prototype.constructInvaildToken = function (message) {
        if (message === void 0) { message = 'Invalid or unexpected token. '; }
        var token = this.constructToken('Invaild');
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
    AbstractScanner.prototype.moveWhen = function (judge) {
        while (judge(this.getCodePoint()) && !this.eof()) {
            this.move();
        }
    };
    /* tslint:disable:no-bitwise */
    AbstractScanner.prototype.fromCodePoint = function (cp) {
        return (cp < 0x10000) ? String.fromCharCode(cp) :
            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
                String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
    };
    AbstractScanner.prototype.getCodePoint = function (offset) {
        if (offset === void 0) { offset = 0; }
        var index = this.marker.index + offset;
        var first = this.source.charCodeAt(index);
        var cp = first;
        if (first >= 0xD800 && first <= 0xDBFF && !this.eof()) {
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
    return AbstractScanner;
}());
exports.AbstractScanner = AbstractScanner;
