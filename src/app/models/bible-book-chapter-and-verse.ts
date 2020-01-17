export class BibleBookChapterAndVerse {

    constructor(public BookNumber: number, public ChapterNumber: number, public VerseNumber: number) {
    }

    getHash(){
        return this.BookNumber+"-"+ this.ChapterNumber+"+"+this.VerseNumber;
    }

    static fromHash(hash: string): BibleBookChapterAndVerse {
      const result = hash.split("-").map(h => parseInt(h,10));
      if(result.length !== 3) {
          throw new Error("Can't parse hash: "+ hash);
      }
      const [bn, c, vn] = result;
      return new BibleBookChapterAndVerse(bn,c, vn);
    }
}