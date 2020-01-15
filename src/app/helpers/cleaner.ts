import { Database } from '../models/database';

export class Cleaner {

    constructor(private _database: Database) {

    }

    clean(): number {
        return this.cleanBlockRanges() + this.cleanLocations();
    }

    cleanBlockRanges(): number {
        const ranges = this._database.BlockRanges;
        if (ranges.length === 0) {
            return 0;
        }

        const userMarkIdsFound = new Set();
        let removed = 0;
        const userMarkIds = this.getUserMarkIdsInUse();

        for (const range of ranges.reverse()) {
            if (!userMarkIds.has(range.UserMarkId)) {
                console.log("Removing redundant range: " + range.BlockRangeId);
                const i = ranges.indexOf(range);
                ranges.splice(i, 1);
                ++removed;
            } else if (userMarkIdsFound.has(range.UserMarkId)) {
                // don't know how to handle this situation - we are expecting 
                // a unique constraint on the UserMarkId column but have found 
                // occasional duplication!
                console.log("Removing redundant range (duplicate UserMarkId): " + range.BlockRangeId);
                const i = ranges.indexOf(range);
                ranges.splice(i, 1);
                ++removed;
            } else {
                userMarkIdsFound.add(range.UserMarkId);
            }
        }
        return removed;
    }

    cleanLocations(): number {
        let removed = 0;
        const locations = this._database.Locations;
        if (locations.length == 0) {
            return 0;
        }
        var locationIds = this.getLocationIdsInUse();

        for(const location of locations.reverse())
        {
            if (!locationIds.has(location.LocationId)) {
                console.log("Removing redundant location id: " + location.LocationId);
                const i = locations.indexOf(location);
                locations.splice(i, 1);
                ++removed;
            }
        }
        return removed;
    }

    getUserMarkIdsInUse(): Set<number> {
        const result = new Set<number>();
        for (const usermark of this._database.UserMarks) {
            result.add(usermark.UserMarkId);
        }
        return result;
    }

    getLocationIdsInUse(): Set<number>
    {
        var result = new Set<number>();

        for (const bookmark of this._database.Bookmarks)
        {
            result.add(bookmark.LocationId);
            result.add(bookmark.PublicationLocationId);
        }
        
        for (const note of this._database.Notes)
        {
            if (note.LocationId !== null)
            {
                result.add(note.LocationId);
            }
        }

        for (const userMark of this._database.UserMarks)
        {
            result.add(userMark.LocationId);
        }

        for (const tagMap of this._database.TagMaps)
        {
            if (tagMap.Type == 0)
            {
                result.add(tagMap.TypeId);
            }
        }

        console.log("Found "+ result.size +" location Ids in use");
        
        return result;
    }
}