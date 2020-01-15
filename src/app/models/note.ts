export interface Note {
    noteId: number;
    guid: string;
    userMarkId: number | null;
    locationId: number | null;
    title: string;
    content: string;
    lastModified: string;
    blockType: number;
    blockIdentifier: number | null;
}