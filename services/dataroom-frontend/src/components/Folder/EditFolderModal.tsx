import React, { useState } from 'react';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  initialName: string;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({ isOpen, onClose, onSave, initialName }) => {
  const [editedName, setEditedName] = useState(initialName);

  const handleSave = () => {
    onSave(editedName);
    onClose();
  };

  const handleCancel = () => {
    setEditedName(initialName);
    onClose();
  };

  return (
    <div style={{ display: isOpen ? 'block' : 'none', right: '8px', marginLeft: '20px', fontSize: '14px' }}>
      <div>
        <label>Edit Folder Name:</label>
        <div style={{ marginTop: '4px' }}>
          <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: '4px' }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default EditFolderModal;
