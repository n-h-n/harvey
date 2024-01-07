import { File } from "../File/File";

export interface Folder {
  id: number;
  name: string;
  parent_data_room_id: number;
  parent_folder_id: number | null;
  children_folders: Folder[];
  children_files: File[];
}