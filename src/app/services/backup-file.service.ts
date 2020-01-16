import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { BackupFile } from '../models/backup-file';
import { Manifest } from '../models/manifest';
import { Database } from '../models/database';
import { Cleaner } from '../helpers/cleaner';
import { DataAccessService } from './data-access.service';
import { LogService } from './log.service';
import { format } from 'date-fns';
import { MergeService } from './merge.service';

@Injectable({
  providedIn: 'root'
})
export class BackupFileService {

  private ManifestVersionSupported = 1;
  private DatabaseVersionSupported = 5;
  private ManifestEntryName = "manifest.json";
  private DatabaseEntryName = "userData.db";

  constructor(private dataAccessService: DataAccessService, private logService: LogService, private mergeService: MergeService) { }

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
    return await this.dataAccessService.readDatabase(dbFile);
  }

  merge(files: BackupFile[]): BackupFile {
    let fileNumber = 1;
    this.logService.progress("Merging " + files.length + " backup files");
    for (const file of files) {

      this.logService.log("Merging backup file " + fileNumber + " = " + file.Manifest.name);
      this.logService.log("===================");
      this.clean(file);
      fileNumber++;
    }
    // just pick the first manifest as the basis for the 
    // manifest in the final merged file...
    const newManifest = this.updateManifest(files[0].Manifest);

    const mergedDatabase = this.mergeDatabases(files);
    return new BackupFile(newManifest, mergedDatabase);
  }

  mergeDatabases(jwlibraryFiles: BackupFile[]): Database {
    this.logService.progress("Merging databases");
    return this.mergeService.Merge(jwlibraryFiles.map(x => x.Database));
  }

  updateManifest(manifestToBaseOn: Manifest): Manifest {
    this.logService.log("Updating manifest");

    // quick copy
    const result: Manifest = JSON.parse(JSON.stringify(manifestToBaseOn));
    const simpleDateString = format(Date.now(), 'yyyy-mm-dd');

    result.name = "merged_"+ simpleDateString;
    result.creationDate = simpleDateString;
    result.userDataBackup.deviceName = "JWLMergeWeb";
    result.userDataBackup.databaseName = this.DatabaseEntryName;
    this.logService.log("Updated manifest");
    return result;
  }

  clean(file: BackupFile) {
    this.logService.log("Cleaning backup file " + file.Manifest.name);

    const cleaner = new Cleaner(file.Database);
    const rowsRemoved = cleaner.clean();
    if (rowsRemoved > 0) {
      this.logService.log("Removed " + rowsRemoved + " inaccessible rows");
    }
  }
}
