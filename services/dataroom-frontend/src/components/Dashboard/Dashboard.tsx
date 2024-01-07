import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useDataRoomService } from '../../services/DataRoomService';
import { useStateContext } from '../../context/StateContext';
import { DataRoom } from '../DataRoom/DataRoom';
import DataRoomList from '../DataRoom/DataRoomList';
import CreateDataRoomModal from '../DataRoom/CreateDataRoomModal';
import DataRoomPage from '../DataRoom/DataRoomPage';

const Dashboard: React.FC = () => {
  const { accessToken, logout } = useAuthContext();
  const { dataRooms, getUserDataRooms } = useDataRoomService();
  const { selectedDataRoom, setSelectedDataRoom } = useStateContext();
  const [showCreateDataRoomModal, setShowCreateDataRoomModal] = useState(false);

  useEffect(() => {
    getUserDataRooms();
  }, [dataRooms, getUserDataRooms, selectedDataRoom, showCreateDataRoomModal, accessToken]);

  // Click handlers
  const handleNewDataRoomClick = () => {
    setShowCreateDataRoomModal(true);
  };

  const handleDataRoomListItemClick = (dataRoom: DataRoom) => {
    // Set the selected data room when a data room is clicked
    setSelectedDataRoom(dataRoom);
  };

  const handleLogout = () => {
    // Perform logout logic
    logout();
  };


  return (
    <div style={{marginLeft: "8px"}}>
        {/* Logout button at top right */}
        <button
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px',
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      {/* When a data room is selected */}
      {selectedDataRoom ? (
        <DataRoomPage dataRoom={selectedDataRoom}/>
      ) : (
        <div>
          {/* When no data room is selected */}
          <h2>Dashboard</h2>
          <button onClick={handleNewDataRoomClick}>New Data Room</button>
          {showCreateDataRoomModal && (
            <CreateDataRoomModal
              onClose={() => setShowCreateDataRoomModal(false)} 
            />
          )}
          <DataRoomList dataRooms={dataRooms} onDataRoomClick={handleDataRoomListItemClick}/>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
