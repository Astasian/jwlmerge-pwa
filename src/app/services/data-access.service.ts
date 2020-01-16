import { Injectable } from '@angular/core';
import { Database } from '../models/database';
import * as initSqlJs from 'sql.js';
import { LastModified } from '../models/last-modified';
import { SqlJs } from 'sql.js/module';
import { Note } from '../models/note';
import { BlockRange } from '../models/block-range';
import { Tag } from '../models/tag';
import { TagMap } from '../models/tag-map';
import { Bookmark } from '../models/bookmark';
import { UserMark } from '../models/user-mark';
import { Location } from '../models/location';
@Injectable({
  providedIn: 'root'
})
export class DataAccessService {

  SqlJs: Promise<SqlJs.SqlJsStatic>;

  constructor() {
    this.SqlJs = initSqlJs();
  }

  async readDatabase(data: Uint8Array): Promise<Database> {
    const sql = await this.SqlJs;
    const db = new sql.Database(data);
    const database = new Database();
    database.LastModified = this.readScalar(db, 'LastModified') as LastModified;
    database.Locations = this.readTable(db, 'Location') as Location[];
    database.Notes = this.readTable(db, 'Note') as Note[];
    database.Tags = this.readTable(db, 'Tag') as Tag[];
    database.TagMaps = this.readTable(db, 'TagMap') as TagMap[];
    database.BlockRanges = this.readTable(db, 'BlockRange') as BlockRange[];
    database.Bookmarks = this.readTable(db, 'Bookmark') as Bookmark[];
    database.UserMarks = this.readTable(db, 'UserMark') as UserMark[];
    db.close();
    return database;
}


readScalar(db: SqlJs.Database, table: string): unknown {
    // todo this should not be 😢
    const stmt = db.prepare('SELECT * FROM ' + table);
    stmt.step();
    const obj = stmt.getAsObject();
    stmt.free();
    return obj;
}

readTable(db: SqlJs.Database, table: string): unknown {
    // todo this should not be 😢
    const stmt = db.prepare('SELECT * FROM ' + table);
    const arr = [];
    while(stmt.step()) {
        arr.push(stmt.getAsObject() as unknown)
    }
    stmt.free();
    return arr;
}
}
