import { Manifest } from './manifest';
import { Database } from './database';

export class BackupFile {
    constructor(public Manifest: Manifest, public Database: Database) {
    }
}