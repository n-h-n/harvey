// UploadFileModal.tsx
import React, { useState } from 'react';
import { useFileService } from '../../services/FileService';

interface UploadFileModalProps {
  dataRoomId: number;
  folderId?: number;
  onClose: () => void;
  onUpload: () => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = (props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile } = useFileService();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUploadClick = async (dataRoomId: number, folderId?: number) => {
    if (selectedFile) {
      try {
        // Use the uploadFile method from the service
        await uploadFile(selectedFile, dataRoomId, folderId);

        // After successful upload, close the modal and trigger the onUpload callback
        props.onClose();
        props.onUpload();
      } catch (error) {
        // Handle error appropriately (e.g., show a message to the user)
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={() => handleUploadClick(props.dataRoomId, props.folderId)}>Upload</button>
      <button onClick={props.onClose}>Cancel</button>
    </div>
  );
};

