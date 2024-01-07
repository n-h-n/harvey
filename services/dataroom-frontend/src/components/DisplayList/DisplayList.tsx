// DisplayList.tsx
import React from 'react';
import FileDisplayItem from '../File/FileDisplayItem';
import FolderListItem from '../Folder/FolderDisplayItem';
import { Folder } from '../Folder/Folder';
import { File } from '../File/File';
import { useFileService } from '../../services/FileService';
import { useStateContext } from '../../context/StateContext';
import { useDataRoomService } from '../../services/DataRoomService';
import { useFolderService } from '../../services/FolderService';

interface DisplayListProps {
  displayFolders: Folder[];
  displayFiles: File[];
  onFolderClick: (folder: Folder) => void;
  onFileClick?: (file: File) => void;
}

const DisplayList: React.FC<DisplayListProps> = (props) => {
  const { selectedDataRoom, setSelectedDataRoom, selectedFolder, setSelectedFolder } = useStateContext();
  const { getDataRoom } = useDataRoomService();
  const { getFolder, deleteFolder } = useFolderService();
  const { deleteFile } = useFileService();

  const refreshState = async () => {
    const refreshed_data_room = await getDataRoom(selectedDataRoom?.id as number);
    if (refreshed_data_room) {
      setSelectedDataRoom(refreshed_data_room);
    }
    const refreshed_folder = await getFolder(selectedFolder?.id as number);
    if (refreshed_folder) {
      setSelectedFolder(refreshed_folder);
    }
  };

  const handleFolderDelete = async (folderId: number) => {
    try {
      // Call the delete endpoint
      await deleteFolder(folderId);
      refreshState();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      // Call the delete endpoint
      await deleteFile(fileId);
      refreshState();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  return (
    <div>
      {props.displayFiles.length > 0 && (
        <div>
          <p>Files:</p>
          {props.displayFiles.map((item) => (
            <FileDisplayItem
              key={`file-${item.id}`}
              file={item as File}
              moveOptions={props.displayFolders}
              onDelete={() => handleFileDelete(item.id)}
            />
          ))}
        </div>
      )}

      {props.displayFolders.length > 0 && (
        <div>
          <p>Folders:</p>
          {props.displayFolders.map((item) => (
            <FolderListItem
              key={`folder-${item.id}`}
              moveOptions={props.displayFolders.filter((folder) => folder.id !== item.id)}
              folder={item as Folder}
              onFolderClick={() => props.onFolderClick(item as Folder)}
              onDelete={() => handleFolderDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayList;
