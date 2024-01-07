import React, { useState } from 'react';
import { useDataRoomService } from '../../services/DataRoomService';

interface CreateDataRoomModalProps {
    onClose: () => void,
};

const CreateDataRoomModal: React.FC<CreateDataRoomModalProps>  = (props) => {
  const [dataRoomName, setDataRoomName] = useState('');
  const { createDataRoom } = useDataRoomService();

  const handleCreateClick = async () => {
    await createDataRoom(dataRoomName)
    props.onClose();
  };

  return (
    <div>
      <input
        type="text"
        value={dataRoomName}
        onChange={(e) => setDataRoomName(e.target.value)}
      />
      <button onClick={handleCreateClick}>Create</button>
      <button onClick={props.onClose}>Cancel</button>
    </div>
  );
};

export default CreateDataRoomModal;
