export interface BlockRange {
    blockRangeId: number;
    blockType: number;
    identifier: number;
    startToken: number | null;
    endToken: number | null;
    userMarkId: number;
}