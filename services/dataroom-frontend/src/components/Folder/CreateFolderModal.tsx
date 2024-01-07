import React, { useState } from 'react';
import { useFolderService } from '../../services/FolderService';
import { useStateContext } from '../../context/StateContext';

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: () => void; 
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = (props) => {
  const [folderName, setFolderName] = useState('');
  const { createFolder } = useFolderService();
  const { selectedFolder, selectedDataRoom } = useStateContext();


  const handleCreateClick = async () => {
    if (folderName.trim() !== '') {
      // Selection can't be null for this component to render
      await createFolder(folderName, selectedDataRoom!.id, selectedFolder?.id || undefined);
      props.onCreate();
      props.onClose();
    }
  };

  return (
    <div>
      <h2>Create Folder</h2>
      <input
        type="text"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
      />
      <button onClick={handleCreateClick}>Create Folder</button>
      <button onClick={props.onClose}>Cancel</button>
    </div>
  );
};

export default CreateFolderModal;
