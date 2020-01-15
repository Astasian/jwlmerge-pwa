import { LastModified } from './last-modified';
import { Note } from './note';
import { Tag } from './tag';
import { TagMap } from './tag-map';
import { BlockRange } from './block-range';
import { Bookmark } from './bookmark';
import { UserMark } from './user-mark';

export class Database {
    LastModified: LastModified;
    Locations: Location[];
    Notes: Note[];
    Tags: Tag[];
    TagMaps: TagMap[];
    BlockRanges:BlockRange[];
    Bookmarks: Bookmark[];
    UserMarks: UserMark[];
}