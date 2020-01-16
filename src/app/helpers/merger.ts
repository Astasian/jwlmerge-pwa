import { LogService } from '../services/log.service';
import { Database } from '../models/database';
import { IdTranslator } from './IdTranslator';

export class Merger {

    private _translatedLocationIds = new IdTranslator();
    private _translatedTagIds = new IdTranslator();
    private _translatedUserMarkIds = new IdTranslator();
    private _translatedNoteIds = new IdTranslator();

    private _maxLocationId = 0;
    private _maxUserMarkId = 0;
    private _maxNoteId = 0;
    private _maxTagId = 0;
    private _maxTagMapId = 0;
    private _maxBlockRangeId = 0;
    private _maxBookmarkId = 0;

    constructor(private logService: LogService) { }

    mergeMultiple(databasesToMerge: Database[]): Database {
        var result = new Database();

        this.clearMaxIds();

        var databaseIndex = 1;
        for (const database of databasesToMerge) {
            this.logService.progress("MERGING DATABASE " + databaseIndex);
            databaseIndex++;
            this.merge(database, result);
        }

        return result;
    }

    private clearMaxIds()
    {
        this._maxLocationId = 0;
        this._maxUserMarkId = 0;
        this._maxNoteId = 0;
        this._maxTagId = 0;
        this._maxTagMapId = 0;
        this._maxBlockRangeId = 0;
        this._maxBookmarkId = 0;
    }

    merge(source: Database, destination: Database) {
        this.clearTranslators();

        source.FixupAnomalies();

        MergeUserMarks(source, destination);
        MergeNotes(source, destination);
        MergeTags(source, destination);
        MergeTagMap(source, destination);
        MergeBlockRanges(source, destination);
        MergeBookmarks(source, destination);

        ProgressMessage(" Checking validity");
        destination.CheckValidity();
    }

    private clearTranslators()
    {
        this._translatedLocationIds.clear();
        this._translatedTagIds.clear();
        this._translatedUserMarkIds.clear();
        this._translatedNoteIds.clear();
    }
}