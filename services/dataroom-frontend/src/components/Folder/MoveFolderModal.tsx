import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

interface MoveFolderModalProps {
  isOpen: boolean;
  moveOptions: { id: number; name: string }[];
  onClose: () => void;
  onSelect: (folderId?: number) => void;
}

const MoveFolderModal: React.FC<MoveFolderModalProps> = (props) => {
  return (
    <Modal show={props.isOpen} onHide={props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Move Folder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Display folder names with solid background and plain text */}
        {props.moveOptions.map((folder) => (
          <Button
            key={folder.id}
            onClick={() => props.onSelect(folder.id)}
            style={{ background: '#fff', color: '#000', padding: '8px', borderRadius: '0', marginBottom: '8px' }}
          >
            {folder.name}
          </Button>
        ))}
        {/* 'Up' Button */}
        <Button
          onClick={() => props.onSelect()}
          style={{ background: '#fff', color: '#000', padding: '8px', borderRadius: '0' }}
        >
          <FontAwesomeIcon icon={faArrowUp} /> Up
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default MoveFolderModal;
