export interface Bookmark {
    BookmarkId: number;
    LocationId: number;
    PublicationLocationId: number;
    Slot: number;
    Title: string;
    Snippet: string;
    BlockType: number;
    BlockIdentifier: number | null;
}