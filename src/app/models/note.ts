export interface Note {
    NoteId: number;
    Guid: string;
    UserMarkId: number | null;
    LocationId: number | null;
    Title: string;
    Content: string;
    LastModified: string;
    BlockType: number;
    BlockIdentifier: number | null;
}