export interface Position {
    index: number;
    line: number;
    column: number;
}

export interface SourceLocation {
    readonly start: Position;
    readonly end: Position;
}
