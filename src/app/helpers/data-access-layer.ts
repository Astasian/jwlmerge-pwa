import { Database } from '../models/database';
import * as initSqlJs from 'sql.js';
import { LastModified } from '../models/last-modified';
import { SqlJs } from 'sql.js/module';

export class DataAccessLayer {

    async readDatabase(data: Uint8Array): Promise<Database> {
        const sql = await initSqlJs();
        const db = new sql.Database(data);
        const database = new Database();
        this.readLastModified(db);
        db.close();
        return database;
    }

    readLastModified(db: SqlJs.Database): LastModified {
        const stmt = db.prepare('SELECT * FROM LastModified');
        stmt.step();
        const ret = stmt.getAsObject();
        console.log(ret);
        return { LastModified: ''};
    }
}