(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["abs"] = factory();
	else
		root["abs"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var token_1 = __webpack_require__(0);
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
        while (judge(this.getCharCode()) && !this.eof()) {
            this.move();
        }
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var abstract_scanner_1 = __webpack_require__(1);
exports.AbstractScanner = abstract_scanner_1.AbstractScanner;
var token_1 = __webpack_require__(0);
exports.Token = token_1.Token;
exports.version = '1.1.0';


/***/ })
/******/ ]);
});