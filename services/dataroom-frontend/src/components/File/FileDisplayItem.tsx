import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { File } from './File';
import { Folder } from '../Folder/Folder';
import { faEdit, faFile, faTrash, faEye, faHandPaper } from '@fortawesome/free-solid-svg-icons';
import EditFileModal from './EditFileModal';
import { useFileService } from '../../services/FileService';
import { useStateContext } from '../../context/StateContext';
import { useDataRoomService } from '../../services/DataRoomService';
import { useFolderService } from '../../services/FolderService';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

interface FileDisplayItemProps {
  moveOptions: Folder[]
  file: File;
  onDelete: () => void;
}

const FileDisplayItem: React.FC<FileDisplayItemProps> = (props) => {
  const [isEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { selectedDataRoom, setSelectedDataRoom, selectedFolder, setSelectedFolder } = useStateContext();
  const { getDataRoom } = useDataRoomService();
  const { getFolder } = useFolderService();
  const { moveFile, getFile } = useFileService();

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

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownSelect = async (folderId?: number) => {
    try {
      if (!folderId) {
        folderId = selectedFolder?.parent_folder_id || undefined;
      }
      await moveFile(props.file.id, props.file.name, selectedDataRoom!.id, folderId);
      refreshState();
    } catch (error) {
      console.error('Error moving file:', error);
    }
    setDropdownOpen(false); // Close the dropdown after selection
  };

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleEditModalSave = async (file: File, newName: string) => {
    try {
      await moveFile(file.id, newName, selectedDataRoom!.id, selectedFolder?.id);
      refreshState();
    } catch (error) {
      console.error('Error updating file:', error);
    }
    setEditModalOpen(false);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleViewFile = async () => {
    try {
      const fileContentBlob = await getFile(props.file.id);

      // Convert Blob to data URL
      const fileContentDataUrl = URL.createObjectURL(fileContentBlob);

      // Open a new window with the PDF content
      const newWindow = window.open(fileContentDataUrl, '_blank', 'width=600,height=400');
      if (!newWindow) {
        console.error('Unable to open a new window.');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
    }
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
      <FontAwesomeIcon icon={faFile} style={{ marginRight: '8px' }} />
      <span>{props.file.name}</span>
      {isHovered && !isEditing && (
        <>
          {/* Eye Button */}
          <button onClick={handleViewFile} style={{ marginLeft: '8px' }}>
            <FontAwesomeIcon icon={faEye} />
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
          {props.moveOptions && <Dropdown show={dropdownOpen} onToggle={handleDropdownToggle}>
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
              ))}
              {/* 'Up' Item */}
              {selectedFolder && <Dropdown.Item
                  key={props.file.parentFolderId} 
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
      <EditFileModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onSave={(newName: string) => handleEditModalSave(props.file, newName)}
        initialName={props.file.name}
      />
    </div>
  );
};

export default FileDisplayItem;
