# abstract-scanner
Universal scanner for lexical analysis.

The whole program are written with `typescript`, but it's ok to use it as a common nodejs module.
Of course, you can find the `umd` version of this module in `lib/*`.

###Install
```
npm install abstract-scanner --save
```

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
    moveWhen(judge: (cp: number) => boolean): void;
    fromCodePoint(cp: number): string;
    getCodePoint(offset?: number): number;
    getCharCode(offset?: number): number;
    abstract nexToken(): Token | null;
}
```
###Example
Scan the [NumericLiteral](https://tc39.github.io/ecma262/#sec-literals-numeric-literals) of javascript.

```js
import { Token, AbstractScanner } from 'abstract-scanner';

const utils = {
    isHexDigit(cp: number): boolean {
        return (cp >= 0x30 && cp <= 0x39) ||    // 0..9
            (cp >= 0x41 && cp <= 0x46) ||       // A..F
            (cp >= 0x61 && cp <= 0x66);         // a..f
    },
    ...
}

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