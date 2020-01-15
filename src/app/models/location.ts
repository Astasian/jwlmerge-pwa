export interface Location {
    LocationId: number;
    BookNumber: number | null;
    ChapterNumber: number | null;
    DocumentId: number | null;
    Track: number | null;
    IssueTagNumber: number;
    KeySymbol: string;
    MepsLanguage: number;
    Type: number;
    Title: string;
}