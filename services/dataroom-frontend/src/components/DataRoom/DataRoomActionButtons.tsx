// DataRoomButtons.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFolderPlus, faEdit, faArrowUp, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useStateContext } from '../../context/StateContext';
import { useDataRoomService } from '../../services/DataRoomService';
import { useFolderService } from '../../services/FolderService';
import CreateFolderModal from '../Folder/CreateFolderModal';
import { UploadFileModal } from '../File/UploadFileModal';

export const DataRoomActionButtons: React.FC = () => {
  const { clearAppState, selectedDataRoom, setSelectedDataRoom, selectedFolder, setSelectedFolder } = useStateContext();
  const { getDataRoom, deleteDataRoom, renameDataRoom } = useDataRoomService();
  const { getFolder, moveFolder, deleteFolder } = useFolderService();
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(selectedDataRoom?.name || '');
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false); 


  useEffect(() => {
    setEditedName(selectedFolder?.name || selectedDataRoom?.name || '');
  }, [selectedFolder, selectedDataRoom]);

  
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
  
  const handleTopLevelClick = () => {
    if (selectedFolder) {
        setSelectedFolder(null);
        return
    }
    clearAppState()
  }

  const handleEditClick = () => {
    setEditMode(true);
    refreshState();
  };

  const handleCancelEditClick = () => {
    setEditedName(selectedFolder?.name || selectedDataRoom?.name || '');
    setEditMode(false);
  };

  const handleSaveEditClick = async () => {
    try {
      // update the folder name if one is selected
      if (selectedFolder) {
        const updatedFolder = await moveFolder(selectedFolder.id, editedName, selectedFolder.parent_data_room_id, selectedFolder.parent_folder_id || undefined);
        if (!updatedFolder) {
          return;
        }
        setSelectedFolder(updatedFolder);
        setEditMode(false);
      }
      else if (selectedDataRoom) {
        const updatedDataRoom = await renameDataRoom(selectedDataRoom.id, editedName);
        if (!updatedDataRoom) {
          return;
        }
        setSelectedDataRoom(updatedDataRoom);
        setEditMode(false);
      }
      refreshState();
    } catch (error) {
      console.error('Error updating data room:', error);
    }
  };

  const handleDeleteClick = async () => {
    try {
      if (selectedFolder) {
        await deleteFolder(selectedFolder.id);
      }
      else if (selectedDataRoom) {
        await deleteDataRoom(selectedDataRoom.id);
      }
      handleGoBack();
      refreshState();
    } catch (error) {
      console.error('Error deleting data room:', error);
    }
  };

  const handleNewFolderClick = () => {
    setShowCreateFolderDialog(true);
  };

  const handleUploadFileClick = () => {
    setShowUploadFileModal(true);
  };

  const handleGoBack = async () => {
    try {
      if (selectedFolder?.parent_folder_id) {
        // Nested folder
        const parentFolder = await getFolder(selectedFolder.parent_folder_id);
        if (parentFolder) {
          setSelectedFolder(parentFolder);
        }
        // Top level folder
      } else if (selectedFolder) {
        setSelectedFolder(null);
      } else {
        clearAppState();
      }
    } catch (error) {
      console.error('Error getting parent folder:', error);
    }
  };

  return (
    <div style={{marginRight: '20px', position: 'fixed', bottom: '0', right: '0', padding: '20px', background: '#eee'}}>
      <button onClick={handleTopLevelClick}>
          {selectedFolder ? 'Back to Data Room' : ' Back to Dashboard'}
      </button>
        {editMode && (
          <>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <button onClick={handleSaveEditClick}>Save</button>
            <button onClick={handleCancelEditClick}>Cancel</button>
          </>
        )}
        <button onClick={handleEditClick}>
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button onClick={handleDeleteClick}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button onClick={handleUploadFileClick}>
        <FontAwesomeIcon icon={faUpload} />
        </button>
        <button onClick={handleNewFolderClick}>
          <FontAwesomeIcon icon={faFolderPlus} />
        </button>
        {selectedFolder && <button onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
        }
        {showCreateFolderDialog && (
              <CreateFolderModal
                onClose={() => setShowCreateFolderDialog(false)}
                onCreate={refreshState}
              />
          )}
        {showUploadFileModal && (
          <UploadFileModal
            dataRoomId={selectedDataRoom!.id}
            folderId={selectedFolder?.id}
            onClose={() => setShowUploadFileModal(false)}
            onUpload={refreshState} // Assuming you want to refresh the state after uploading
          />
      )}
    </div>
  );
};
