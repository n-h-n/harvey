import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFolderOpen, faEdit, faTrash, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Folder } from './Folder';
import { Dropdown } from 'react-bootstrap';
import { faHandPaper } from '@fortawesome/free-solid-svg-icons';
import { useStateContext } from '../../context/StateContext';
import { useDataRoomService } from '../../services/DataRoomService';
import { useFolderService } from '../../services/FolderService';
import EditFolderModal from './EditFolderModal';

interface FolderDisplayItemProps {
  moveOptions: Folder[]
  folder: Folder;
  onFolderClick: () => void;  
  onDelete: () => void;
}

const FolderDisplayItem: React.FC<FolderDisplayItemProps> = (props) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const { selectedDataRoom, setSelectedDataRoom, selectedFolder, setSelectedFolder } = useStateContext();
  const { getDataRoom } = useDataRoomService();
  const { getFolder, moveFolder } = useFolderService();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  }

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

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleEditModalSave = async (folder: Folder, newName: string) => {
    try {
      await moveFolder(folder.id, newName, selectedDataRoom!.id, selectedFolder?.id);
      refreshState();
    } catch (error) {
      console.error('Error updating file:', error);
    }
    setEditModalOpen(false);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleDropdownSelect = async (targetFolderId?: number) => {
    try {
      if (!targetFolderId) {
        targetFolderId = selectedFolder?.parent_folder_id || undefined;
      }
      await moveFolder(props.folder.id, props.folder.name, selectedDataRoom!.id, targetFolderId);
      refreshState();
    } catch (error) {
      console.error('Error moving file:', error);
    }
    setDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div
        style={{
          margin: '8px',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <FontAwesomeIcon icon={faFolder} style={{ marginRight: '8px' }} />
      <span>{props.folder.name}</span>
      {isHovered && (
        <>
          {/* Open Button */}
          <button onClick={(props.onFolderClick)} style={{ marginLeft: '8px' }}>
            <FontAwesomeIcon icon={faFolderOpen} />
          </button>
          {/* Edit Button */}
          <button onClick={handleEditClick}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
          {/* Delete Button */}
          <button onClick={props.onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
          {/* Hand Button with Styled Dropdown */}
          {props.moveOptions && <Dropdown show={dropdownOpen}
            onToggle={handleDropdownToggle}
          >
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              <FontAwesomeIcon icon={faHandPaper} />
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ borderRadius: '0', boxShadow: 'none', border: '1px solid #ccc' }}>
              {/* Display folder names with solid background and plain text */}
              {props.moveOptions.map((folder) => (
                <Dropdown.Item
                  key={folder.id}
                  onClick={() => handleDropdownSelect(folder.id)}
                  style={{ background: '#fff', color: '#000', padding: '8px', borderRadius: '0' }}
                >
                  {folder.name}
                </Dropdown.Item>
              ))
            }
            {/* 'Up' Item */}
            {selectedFolder && <Dropdown.Item
                  key={props.folder.parent_folder_id} 
                  style={{ background: '#fff', color: '#000', padding: '8px', borderRadius: '0' }}
                  onClick={() => handleDropdownSelect()}
                >
                  <FontAwesomeIcon icon={faArrowUp} /> Up
              </Dropdown.Item>
              }
            </Dropdown.Menu>
          </Dropdown>
      }
        </>
      )}
      <EditFolderModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onSave={(newName: string) => handleEditModalSave(props.folder, newName)}
        initialName={props.folder.name}
      />
    </div>
  );
};

export default FolderDisplayItem;
