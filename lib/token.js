"use strict";
exports.__esModule = true;
var Token = (function () {
    function Token(type, source, start, end) {
        this.type = type;
        this.source = source;
        this.loc = { start: start, end: end };
    }
    return Token;
}());
exports.Token = Token;
