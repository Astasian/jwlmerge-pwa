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
    private _notesVerseIndex: Map<BibleBookChapterAndVerse, Note[]>;
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
        //this._notesVerseIndex = new Lazy<Dictionary<BibleBookChapterAndVerse, List<Note>>>(NoteVerseIndexValueFactory);
        this._userMarksGuidIndex = new Map(this.UserMarks.map(um => [um.UserMarkGuid, um]));
        this._userMarksIdIndex = new Map(this.UserMarks.map(um => [um.UserMarkId, um]));
        //this._userMarksLocationIdIndex = new Lazy<Dictionary<int, List<UserMark>>>(UserMarksLocationIdIndexValueFactory);
        this._locationsIdIndex = new Map(this.Locations.map(l => [l.LocationId, l]));
        //this._locationsValueIndex = new Lazy<Dictionary<string, Location>>(LocationsByValueIndexValueFactory);
        //this._locationsBibleChapterIndex = new Lazy<Dictionary<string, Location>>(LocationsByBibleChapterIndexValueFactory);
        this._tagsNameIndex = new Map(this.Tags.map(t => [t.Name, t]));
        this._tagsIdIndex = new Map(this.Tags.map(t => [t.TagId, t]));
        this._tagMapIndex = new Lazy<Dictionary<string, TagMap>>(TagMapIndexValueFactory);
        this._blockRangesUserMarkIdIndex = new Lazy<Dictionary<int, List<BlockRange>>>(BlockRangeIndexValueFactory);
        this._bookmarksIndex = new Lazy<Dictionary<string, Bookmark>>(BookmarkIndexValueFactory);
    }

    buildNotesVerseIndex(): Map<BibleBookChapterAndVerse, Note[]> {
        const result = new Map<BibleBookChapterAndVerse, Note[]>();

        // blocktype 2 == bible verse
        const possibleNotes = this.Notes.filter(n => n.BlockType === 2 && n.LocationId !== null && n.BlockIdentifier !== null);
        for (const note of possibleNotes) {
            const location = this.findLocation(note.LocationId);

            if (location !== null && location.BookNumber !== null && location.ChapterNumber !== null) {
                const verseRef = new BibleBookChapterAndVerse();
                verseRef.BookNumber = location.BookNumber;
                verseRef.ChapterNumber = location.ChapterNumber;
                verseRef.VerseNumber = note.BlockIdentifier;

                // todo will not work. We're not in dotnet
                if (!result.has(verseRef)) {
                    result.set(verseRef, []);
                }

                const notesOnVerse = result.get(verseRef)
                notesOnVerse.push(note);
            }
        }

        return result;
    }

    findLocation(locationId: number): Location {
        return this._locationsIdIndex.has(locationId) ? this._locationsIdIndex.get(locationId) : null;
    }
}