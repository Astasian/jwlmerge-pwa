import { Component, OnInit } from '@angular/core';
import { BackupFile } from 'src/app/models/backup-file';
import { BackupFileService } from 'src/app/services/backup-file.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  dings: string;

  files: BackupFile[] = [];

  constructor(private backupFileService: BackupFileService) {
    const old = console.log;
    console.log = (str: string) => {
      this.dings += "\n" + JSON.stringify(str).slice(1, 1000);
      old(str);
    }
  }

  async uploadFile($event: any) {
    console.log($event);
    const files = $event.target.files as FileList;
    for (let i = 0; i < files.length; i++) {
      const e = files[i];
      try {
        const a = await this.backupFileService.load(e);
        this.files.push(a);
      } catch (e) {
        console.log(e);
      }
    }
  }

  merge(){
    this.backupFileService.merge(this.files);
  }

  canMerge(): boolean {
    return this.files.length > 1;
  }
}
