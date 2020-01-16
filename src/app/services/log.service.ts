import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor() { }

  log(str: string){
    console.log(str);
  }


  progress(str: string) {
    console.log(str);
  }
}
