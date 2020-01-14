import { Component } from '@angular/core';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  async uploadFile($event: any) {
    const files = $event.target.files as FileList;
    for (let i = 0; i < files.length; i++) {
      const e = files[i];
      this.handleFile(e);
    }
  }


  async handleFile(file: File) {
    const zip = await JSZip.loadAsync(file);
    try {
      zip.forEach((relativePath, zipEntry) => console.log(relativePath, zipEntry));
    } catch (e) {
      console.log(e);
    }
  }

}
