// src/components/DataRoom/DataRoom.tsx
import React from 'react';
import { DataRoom } from './DataRoom';

interface DataRoomListItemProps {
  key: number;
  dataRoom: DataRoom;
  onDataRoomClick: () => void;
}

const DataRoomListItem: React.FC<DataRoomListItemProps> = (props) => {
  return (
    <div style={{ borderRadius: '0', boxShadow: 'none', border: '1px solid #ccc', cursor: 'pointer' }}>
      <div onClick={props.onDataRoomClick}>
        <h3>{props.dataRoom.name}</h3>
        <h5>{props.dataRoom.folders && props.dataRoom.folders.length + ' Folders'}</h5>
        <h5>{props.dataRoom.files && props.dataRoom.files.length + ' Files'}</h5>
      </div>
    </div>
  );
};

export default React.memo(DataRoomListItem);
