export declare function isWhiteSpace(cp: number): boolean;
export declare function isLineTerminator(cp: number): boolean;
export declare function isDecimalDigit(cp: number): boolean;
export declare function isHexDigit(cp: number): boolean;
export declare function isOctalDigit(cp: number): boolean;
export declare function isBinaryDigit(cp: number): boolean;
export declare const JS: {
    isIdentifierStart(cp: number): boolean;
    isIdentifierPart(cp: number): boolean;
    isKeyword(id: string): boolean;
    isFutureReservedWord(id: string): boolean;
    isStrictModeReservedWord(id: string): boolean;
};
