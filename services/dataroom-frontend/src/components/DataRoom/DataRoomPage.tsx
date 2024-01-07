import React from 'react';
import { useStateContext } from '../../context/StateContext';
import { useFolderService } from '../../services/FolderService';
import { DataRoom } from '../DataRoom/DataRoom';
import { DataRoomActionButtons } from '../DataRoom/DataRoomActionButtons';
import { Folder } from '../Folder/Folder';
import FolderPage from '../Folder/FolderPage';
import DisplayList from '../DisplayList/DisplayList'; // Import the DisplayList component

interface DataRoomPageProps {
  dataRoom: DataRoom;
}

const DataRoomPage: React.FC<DataRoomPageProps> = (props) => {
  const { selectedFolder, setSelectedFolder } = useStateContext();
  const { getFolder } = useFolderService();

  const handleFolderListItemClick = async (folder: Folder) => {
    const fetchedFolder = await getFolder(folder.id);
    if (fetchedFolder) {
      setSelectedFolder(fetchedFolder);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{flexGrow: 1 }}>Data Room: {props.dataRoom.name}</h3>
        <DataRoomActionButtons />
      </div>
    {selectedFolder ? (
      <FolderPage folder={selectedFolder} />
    ) : ( 
      <DisplayList displayFiles={props.dataRoom.files} displayFolders={props.dataRoom.folders} onFolderClick={handleFolderListItemClick} />
    )}
  </div>
    );
  };

export default React.memo(DataRoomPage);
