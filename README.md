# abstract-scanner
Universal scanner for lexical analysis.

The whole project are written with `typescript`, but it's ok to use it as a common nodejs module.
Of course, you can find the `umd` version of this module in `lib/*`.

###Install
```
npm install abstract-scanner --save
```

###Exports
- `Token`: scan result wrapper.
- `AbstractScanner`: abstract scanner needed to be extended. 
- `utils`: namespace of some helpful functions .
- `version`: project version.

###Interface
```js
class Token {
    type: string;
    loc: SourceLocation;
    source: string;
    value?: any;
    message?: string | string[];
    constructor(type: string, source: string, start: Position, end: Position);
}

interface Position {
    index: number;
    line: number;
    column: number;
}

interface SourceLocation {
    readonly start: Position;
    readonly end: Position;
}

abstract class AbstractScanner {
    readonly source: string;
    readonly length: number;
    marker: Position;
    private scanStartingMarker;
    private scanEndingMarker;
    constructor(source: string);
    saveState(): Position;
    restoreState(state: Position): void;
    startScan(): void;
    endScan(): void;
    clear(): void;
    getScanLength(): number;
    constructToken(type: string): Token;
    constructInvaildToken(message?: string | string[]): Token;
    eof(): boolean;
    peek(length?: number): string;
    move(offset?: number): void;
    moveWhen(judge: (cp: number, ch?: string) => boolean): void;
    fromCodePoint(cp: number): string;
    getCodePoint(offset?: number): number;
    getCharCode(offset?: number): number;
    scanLineTerminator(): string;
    scanBlankSpace(): string;
    skipSpace(): void;
    abstract nexToken(): Token | null;
}

namespace utils {
    function isWhiteSpace(cp: number): boolean;
    function isLineTerminator(cp: number): boolean;
    function isDecimalDigit(cp: number): boolean;
    function isHexDigit(cp: number): boolean;
    function isOctalDigit(cp: number): boolean;
    function isBinaryDigit(cp: number): boolean;
    namespace JS {
        isIdentifierStart(cp: number): boolean;
        isIdentifierPart(cp: number): boolean;
        isKeyword(id: string): boolean;
        isFutureReservedWord(id: string): boolean;
        isStrictModeReservedWord(id: string): boolean;
    };
}
```
###Example
Scan the [NumericLiteral](https://tc39.github.io/ecma262/#sec-literals-numeric-literals) of javascript.

```js
import { Token, AbstractScanner, utils } from 'abstract-scanner';

class Scanner extends AbstractScanner {
    scanHexLiteral(): Token | null {
        const str = this.peek(2);
        if (str[0] === '0' && (str[1] === 'x' || str[1] === 'X')) {
            this.startScan();
            this.move(2);
            this.moveWhen(cp => utils.isHexDigit(cp));
            this.endScan();
            if (this.getScanLength() === 2) {
                return this.constructInvaildToken();
            } else {
                const token = this.constructToken('NumericLiteral');
                token.value = parseInt(token.source, 16);
                return token;
            }
        }
        return null;
    }

    scanBinaryLiteral(): Token | null {...}

    scanOctalLiteral(): Token | null {...}

    scanDecimalLiteral(): Token | null {...}

    nextToken(): Token | null {
        return this.scanHexLiteral() || this.scanOctalLiteral()
        || this.scanBinaryLiteral() || this.scanDecimalLiteral();
    }
}
```