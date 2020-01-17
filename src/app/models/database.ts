import { LastModified } from './last-modified';
import { Note } from './note';
import { Tag } from './tag';
import { TagMap } from './tag-map';
import { BlockRange } from './block-range';
import { Bookmark } from './bookmark';
import { UserMark } from './user-mark';
import { Location } from './location';
import { BibleBookChapterAndVerse } from './bible-book-chapter-and-verse';

export class Database {

    LastModified: LastModified = new LastModified();
    Locations: Location[] = [];
    Notes: Note[] = [];
    Tags: Tag[] = [];
    TagMaps: TagMap[] = [];
    BlockRanges: BlockRange[] = [];
    Bookmarks: Bookmark[] = [];
    UserMarks: UserMark[] = [];

    private _notesGuidIndex: Map<string, Note>;
    private _notesIdIndex: Map<number, Note>;
    private _notesVerseIndex: Map<string, Note[]>;
    private _userMarksGuidIndex: Map<string, UserMark>;
    private _userMarksIdIndex: Map<number, UserMark>;
    private _userMarksLocationIdIndex: Map<number, UserMark[]>;
    private _locationsIdIndex: Map<number, Location>;
    private _locationsValueIndex: Map<string, Location>;
    private _locationsBibleChapterIndex: Map<string, Location>;
    private _tagsNameIndex: Map<string, Tag>;
    private _tagsIdIndex: Map<number, Tag>;
    private _tagMapIndex: Map<string, TagMap>;
    private _blockRangesUserMarkIdIndex: Map<number, BlockRange[]>;
    private _bookmarksIndex: Map<string, Bookmark>;

    constructor() {
        this.reinitializeIndexes();
    }

    private reinitializeIndexes(): void {
        this._notesGuidIndex = new Map(this.Notes.map(n => [n.Guid, n]));
        this._notesIdIndex = new Map(this.Notes.map(n => [n.NoteId, n]));
        this._notesVerseIndex = this.buildNotesVerseIndex();
        this._userMarksGuidIndex = new Map(this.UserMarks.map(um => [um.UserMarkGuid, um]));
        this._userMarksIdIndex = new Map(this.UserMarks.map(um => [um.UserMarkId, um]));
        this._userMarksLocationIdIndex = this.buildMarksLocationIdIndex();
        this._locationsIdIndex = new Map(this.Locations.map(l => [l.LocationId, l]));
        this._locationsValueIndex = this.buildLocationsValueIndex();
        this._locationsBibleChapterIndex = this.buildLocationsBibleChapterIndex();
        this._tagsNameIndex = new Map(this.Tags.map(t => [t.Name, t]));
        this._tagsIdIndex = new Map(this.Tags.map(t => [t.TagId, t]));
        this._tagMapIndex = this.buildTagMapIndexValue();
        this._blockRangesUserMarkIdIndex = this.buildBlockRangeIndexValue();
        this._bookmarksIndex = this.buildBookmarkIndexValue();
    }

    buildNotesVerseIndex(): Map<string, Note[]> {
        const result = new Map<string, Note[]>();

        // blocktype 2 == bible verse
        const possibleNotes = this.Notes.filter(n => n.BlockType === 2 && n.LocationId !== null && n.BlockIdentifier !== null);
        for (const note of possibleNotes) {
            const location = this.findLocation(note.LocationId);

            if (location !== null && location.BookNumber !== null && location.ChapterNumber !== null) {
                const verseRef = new BibleBookChapterAndVerse(location.BookNumber, location.ChapterNumber, note.BlockIdentifier);
                const hash = verseRef.getHash();

                if (!result.has(hash)) {
                    result.set(hash, []);
                }
                result.get(hash).push(note);
            }
        }
        return result;
    }

    buildMarksLocationIdIndex(): Map<number, UserMark[]> {
        const result = new Map<number, UserMark[]>();

        for (const userMark of this.UserMarks) {

            if (!result.has(userMark.LocationId)) {
                result.set(userMark.LocationId, []);
            }

            result.get(userMark.LocationId).push(userMark);
        }

        return result;
    }

    buildLocationsValueIndex(): Map<string, Location> {
        const result = new Map<string, Location>();

        for (const location of this.Locations) {
            const key = this.getLocationByValueKey(location);
            if (!result.has(key)) {
                result.set(key, location);
            }
        }

        return result;
    }

    buildLocationsBibleChapterIndex(): Map<string, Location> {
        const result = new Map<string, Location>();

        for (const location of this.Locations.filter(l => location.BookNumber && location.ChapterNumber)) {
            const key = this.getLocationByBibleChapterKey(location.BookNumber, location.ChapterNumber, location.KeySymbol);
            if (!result.has(key)) {
                result.set(key, location);
            }
        }

        return result;
    }

    buildTagMapIndexValue(): Map<string, TagMap> {
        const result = new Map<string, TagMap>();

        for (const tagMap of this.TagMaps) {
            const key = this.getTagMapKey(tagMap.TagId, tagMap.TypeId);
            result.set(key, tagMap);
        }
        return result;
    }

    buildBlockRangeIndexValue(): Map<number, BlockRange[]> {
        const result = new Map<number, BlockRange[]>();

        for (const range of this.BlockRanges) {
            if (!result.has(range.UserMarkId)) {
                result.set(range.UserMarkId, []);
            }

            result.get(range.UserMarkId).push(range);
        }

        return result;
    }


    buildBookmarkIndexValue(): Map<string, Bookmark> {
        const result = new Map<string, Bookmark>();

        for (const bookmark of this.Bookmarks) {
            const key = this.getBookmarkKey(bookmark.LocationId, bookmark.PublicationLocationId);
            if (!result.has(key)) {
                result.set(key, bookmark);
            }
        }
        return result;
    }

    getBookmarkKey(locationId: number, publicationLocationId: number): string {
        return `${locationId}-${publicationLocationId}`;
    }

    getTagMapKey(tagId: number, noteId: number) {
        return `${tagId}-${noteId}`;
    }

    getLocationByValueKey(location: Location): string {
        if (!location.BookNumber) {
            location.BookNumber = -1;
        }
        if (!location.ChapterNumber) {
            location.ChapterNumber = -1;
        }
        if (!location.DocumentId) {
            location.DocumentId = -1;
        }
        if (!location.Track) {
            location.Track = -1;
        }
        return [location.KeySymbol, location.IssueTagNumber, location.MepsLanguage, location.Type, location.BookNumber, location.ChapterNumber, location.DocumentId, location.Track].join('|');
    }

    getLocationByBibleChapterKey(bibleBookNumber: number, chapterNumber: number, bibleKeySymbol: string): string {
        return `${bibleBookNumber}-${chapterNumber}-${bibleKeySymbol}`;
    }

    fixupAnomalies(): void {
        let count = 0;

        count += this.fixupBlockRangeValidity();
        count += this.fixupBookmarkValidity();
        count += this.fixupNoteValidity();
        count += this.fixupTagMapValidity();
        count += this.fixupUserMarkValidity();

        if (count > 0) {
            this.reinitializeIndexes();
        }
    }

    private fixupBlockRangeValidity(): number {
        let fixupCount = 0;

        for (let n = this.BlockRanges.length - 1; n >= 0; --n) {
            const range = this.BlockRanges[n];

            if (this.findUserMarkById(range.UserMarkId) === null) {
                ++fixupCount;
                this.BlockRanges.splice(n, 1);

                console.error(`Removed invalid block range ${range.BlockRangeId}`);
            }
        }

        return fixupCount;
    }



    private fixupBookmarkValidity(): number {
        let fixupCount = 0;

        for (let n = this.Bookmarks.length - 1; n >= 0; --n) {
            const bookmark = this.Bookmarks[n];

            if (this.findLocation(bookmark.LocationId) === null ||
                this.findLocation(bookmark.PublicationLocationId) === null) {
                ++fixupCount;
                this.Bookmarks.splice(n, 1);

                console.error(`Removed invalid bookmark ${bookmark.BookmarkId}`);
            }
        }

        return fixupCount;
    }

    private fixupNoteValidity(): number {
        let fixupCount = 0;

        for (let n = this.Notes.length - 1; n >= 0; --n) {
            const note = this.Notes[n];

            if (note.UserMarkId != null && this.findUserMarkById(note.UserMarkId) == null) {
                ++fixupCount;
                note.UserMarkId = null;

                console.error(`Cleared invalid user mark ID for note ${note.NoteId}`);
            }

            if (note.LocationId != null && this.findLocation(note.LocationId) == null) {
                ++fixupCount;
                note.LocationId = null;

                console.error(`Cleared invalid location ID for note ${note.NoteId}`);
            }
        }

        return fixupCount;
    }

    private fixupTagMapValidity(): number {
        let fixupCount = 0;

        for (let n = this.TagMaps.length - 1; n >= 0; --n) {
            const tagMap = this.TagMaps[n];

            if (tagMap.Type == 1 && (this.findTagById(tagMap.TagId) == null || this.findNote(tagMap.TypeId) == null)) {
                ++fixupCount;
                this.TagMaps.splice(n, 1);

                console.error(`Removed invalid tag map ${tagMap.TagMapId}`);
            }
        }

        return fixupCount;
    }

    private fixupUserMarkValidity(): number {
        var fixupCount = 0;

        for (let n = this.UserMarks.length - 1; n >= 0; --n) {
            const userMark = this.UserMarks[n];

            if (this.findLocation(userMark.LocationId) == null) {
                ++fixupCount;
                this.UserMarks.splice(n, 1);

               console.error(`Removed invalid user mark ${userMark.UserMarkId}`);
            }
        }

        return fixupCount;
    }

    findTagById(tagId: number): Tag {
        return this._tagsIdIndex.has(tagId) ? this._tagsIdIndex.get(tagId) : null;
    }

    findUserMarkById(userMarkId: number): UserMark {
        return this._userMarksIdIndex.has(userMarkId) ? this._userMarksIdIndex.get(userMarkId) : null;
    }

    findLocation(locationId: number): Location {
        return this._locationsIdIndex.has(locationId) ? this._locationsIdIndex.get(locationId) : null;
    }

    findNote(noteId: number): Note {
        return this._notesIdIndex.has(noteId) ? this._notesIdIndex.get(noteId) : null;
    }
}