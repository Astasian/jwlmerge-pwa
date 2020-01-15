import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { BackupFile } from '../models/backup-file';
import { Manifest } from '../models/manifest';
import { Database } from '../models/database';
import { DataAccessLayer } from '../helpers/data-access-layer';
import { Cleaner } from '../helpers/cleaner';

@Injectable({
  providedIn: 'root'
})
export class BackupFileService {

  constructor() { }

  async load(file: File): Promise<BackupFile> {
    const zip = await JSZip.loadAsync(file);
    const manifest = await this.readManifest(zip);
    console.log(manifest);
    const database = await this.readDatabase(zip, manifest.userDataBackup.databaseName);
    return new BackupFile(manifest, database);
  }

  async readManifest(zip: JSZip): Promise<Manifest> {
    const manifestString = await zip.file('manifest.json').async('string');
    // todo add checks for db version etc
    return JSON.parse(manifestString);
  }

  async readDatabase(zip: JSZip, path: string): Promise<Database> {
    const dbFile = await await zip.file(path).async('uint8array');
    const dal = new DataAccessLayer();
    return await dal.readDatabase(dbFile);
  }

  merge(files: BackupFile[]): BackupFile {
    const fileNumber = 1;
    for (const file of files) {
      this.clean(file);
    }
    
    // just pick the first manifest as the basis for the 
    // manifest in the final merged file...
    //var newManifest = this.updateManifest(files[0].Manifest);
    //var mergedDatabase = this.mergeDatabases(files);
    return null //new BackupFile(newManifest, mergedDatabase);
  }

  updateManifest(Manifest: Manifest) {
    throw new Error("Method not implemented.");
  }

  clean(file: BackupFile) {
    console.log("Cleaning backup file " + file.Manifest.name);

    const cleaner = new Cleaner(file.Database);
    const rowsRemoved = cleaner.clean();
    if (rowsRemoved > 0) {
      console.log("Removed " + rowsRemoved + " inaccessible rows");
    }
  }
}
