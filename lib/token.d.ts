import { SourceLocation, Position } from './source-location';
export declare class Token {
    type: string;
    loc: SourceLocation;
    source: string;
    value?: any;
    message?: string | string[];
    constructor(type: string, source: string, start: Position, end: Position);
}
