import { SourceLocation, Position } from './source-location';

export class Token {
    type: string;
    loc: SourceLocation;
    source: string;
    value?: any;
    message?: string | string[];
    constructor (type: string, source: string, start: Position, end: Position) {
        this.type = type;
        this.source = source;
        this.loc = { start, end };
    }
}
