// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';

export class FileStream {
  declare file: any;
  pos = int(0);
  line = int(1);
  constructor(file) {
         
         this.file = file;
      }
  hasData() {
         return this.file.charAt(this.pos) != "";
      }
  getLineNumber() {
         return int(this.line);
      }
  getc() {
         var text = this.file.charAt(this.pos);
         ++this.pos;
         if(text == "\n")
         {
            ++this.line;
         }
         return text;
      }
  ungetc() {
         --this.pos;
         if(this.file.charAt(this.pos) == "\n")
         {
            --this.line;
         }
         if(this.pos < 0)
         {
            this.pos = int(0);
         }
      }
}
FileStream.prototype.file = null;
bindMethods(FileStream);
