export interface Bookmark {
    bookmarkId: number;
    locationId: number;
    publicationLocationId: number;
    slot: number;
    title: string;
    snippet: string;
    blockType: number;
    blockIdentifier: number | null;
}