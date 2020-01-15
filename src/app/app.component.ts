import { Component } from '@angular/core';
import { BackupFileService } from './services/backup-file.service';
import { BackupFile } from './models/backup-file';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  dings: string;

  files: BackupFile[] = [];

  constructor(private backupFileService: BackupFileService) {
    console.log = (str) => {
      this.dings += "\n" + JSON.stringify(str).slice(1, 1000);
    }
  }

  async uploadFile($event: any) {
    const files = $event.target.files as FileList;
    for (let i = 0; i < files.length; i++) {
      const e = files[i];
      try {
        const a = await this.backupFileService.load(e);
        this.files.push(a);
        console.log(a);
      } catch (e) {
        console.log(e);
      }
    }
  }

  merge(){
    this.backupFileService.merge(this.files);
  }
}


