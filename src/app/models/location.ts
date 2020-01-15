export interface Location {
    locationId: number;
    bookNumber: number | null;
    chapterNumber: number | null;
    documentId: number | null;
    track: number | null;
    issueTagNumber: number;
    keySymbol: string;
    mepsLanguage: number;
    type: number;
    title: string;
}