// FolderPage.tsx
import React from 'react';
import { useFolderService } from '../../services/FolderService';
import { useStateContext } from '../../context/StateContext';
import DisplayList from '../DisplayList/DisplayList';
import { Folder } from './Folder';

interface FolderPageProps {
  folder: Folder;
}

const FolderPage: React.FC<FolderPageProps> = (props) => {
  const { getFolder } = useFolderService();
  const { setSelectedFolder } = useStateContext();

  // Combine folders and files into one collection
  const handleFolderListItemClick = async (folder: Folder) => {
    const fetchedFolder = await getFolder(folder.id);
    if (fetchedFolder) {
      setSelectedFolder(fetchedFolder);
    }
  };

  return (
    <div>
      <h3>Folder: {props.folder.name}</h3>
      <div>
        <DisplayList displayFolders={props.folder.children_folders} displayFiles={props.folder.children_files} onFolderClick={handleFolderListItemClick} />
      </div>
    </div>
  );
};

export default FolderPage;
