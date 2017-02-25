import { Position } from './source-location';
import { Token } from './token';
import * as utils from './utils';

export abstract class AbstractScanner {
    readonly source: string;
    readonly length: number;
    marker: Position;
    private scanStartingMarker: Position | null;
    private scanEndingMarker: Position | null;

    constructor(source: string) {
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

    saveState(): Position {
        return {
           index: this.marker.index,
           line: this.marker.line,
           column: this.marker.column
        };
    }

    restoreState(state: Position): void {
        this.marker = state;
    }

    startScan(): void {
        this.scanStartingMarker = this.saveState();
    }

    endScan(): void {
        this.scanEndingMarker = this.saveState();
    }

    clear(): void {
        this.scanStartingMarker = null;
        this.scanEndingMarker = null;
    }

    getScanLength(): number {
        if (this.scanStartingMarker !== null) {
            return this.marker.index - this.scanStartingMarker.index;
        }
        throw new Error('The scan has not been started. ');
    }

    constructToken(type: string): Token {
        if (this.scanStartingMarker !== null && this.scanEndingMarker !== null) {
            const token = new Token(
                type,
                this.source.substring(this.scanStartingMarker.index, this.scanEndingMarker.index),
                this.scanStartingMarker, this.scanEndingMarker,
                );
            this.clear();
            return token;
        }
        throw new Error('The function `startScan` or `endScan` might not have been called. ');
    }

    constructInvaildToken(message: string | string[] = 'Invalid or unexpected token. '): Token {
        const token = this.constructToken('Invaild');
        token.message = message;
        return token;
    }

    eof(): boolean {
        return this.marker.index >= this.length;
    }

    peek(length: number = 1): string {
        return this.source.substr(this.marker.index, length);
    }

    move(offset: number = 1): void {
        this.marker.index += offset;
        this.marker.column += offset;
    }

    moveWhen(judge: (cp: number) => boolean): void {
        while (judge(this.getCodePoint()) && !this.eof()) {
            this.move();
        }
    }

    /* tslint:disable:no-bitwise */
    fromCodePoint(cp: number): string {
        return (cp < 0x10000) ? String.fromCharCode(cp) :
            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
            String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
    }
    
    getCodePoint(offset: number = 0): number {
        const index = this.marker.index + offset;
        const first = this.source.charCodeAt(index);
        let cp = first;
        if (first >= 0xD800 && first <= 0xDBFF && !this.eof()) {
            const second = this.source.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }
        return cp;
    }

    getCharCode(offset: number = 0): number {
        return this.source.charCodeAt(this.marker.index + offset);
    }

    scanLineTerminator(): string {
        let str = '';
        const cp = this.getCharCode();
        if (utils.isLineTerminator(cp)) {
            if (cp === 0x0D && this.getCharCode(1) === 0x0A) {
                str = '\r\n';
                this.move(2);
            } else {
                str = String.fromCharCode(cp);
                this.move();
            }
            this.marker.line++;
            this.marker.column = 1;
        }
        return str;
    }

    scanBlankSpace(): string {
        let str = '';
        let cp = this.getCharCode();
        while (utils.isWhiteSpace(cp) && !this.eof()) {
            str += String.fromCharCode(cp);
            this.move();
            cp = this.getCharCode();
        }
        return str;
    }
    
    skipSpace(): void {
        while (!this.eof()) {
            if (!(this.scanBlankSpace() + this.scanLineTerminator())) {
                break;
            }
        }
    }

    abstract nexToken(): Token | null;
}
