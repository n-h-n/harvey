// src/components/DataRoomList.tsx
import React from 'react';
import { DataRoom } from './DataRoom';
import DataRoomEntry from './DataRoomListItem';

interface DataRoomListProps {
  dataRooms: DataRoom[];
  onDataRoomClick: (dataRoom: DataRoom) => void;
}

const DataRoomList: React.FC<DataRoomListProps> = ( props: DataRoomListProps ) => {
  return (
    <div>
      {props.dataRooms?.length > 0 && (
        <h3>My Data Rooms</h3>
      )}
      {props.dataRooms?.map((dataRoom) => (
        <DataRoomEntry key={dataRoom.id} dataRoom={dataRoom} onDataRoomClick={() => props.onDataRoomClick(dataRoom)} />
      ))}
    </div>
  );
};

export default React.memo(DataRoomList);
