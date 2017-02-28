import { Position } from './source-location';
import { Token } from './token';
export declare abstract class AbstractScanner {
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
    constructIllegalToken(message?: string | string[]): Token;
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
    abstract nextToken(): Token | null;
}
