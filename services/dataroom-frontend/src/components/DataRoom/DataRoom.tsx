import { File } from '../File/File';
import { Folder } from '../Folder/Folder';

export interface DataRoom {
  id: number;
  name: string;
  files: File[];
  folders: Folder[];
}
