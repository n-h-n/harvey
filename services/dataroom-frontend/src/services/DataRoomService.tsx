import { useState, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { api } from './api';
import { DataRoom } from '../components/DataRoom/DataRoom';
import { isEqual } from './util';

export const useDataRoomService = () => {
  const { accessToken } = useAuthContext();
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);

  const getUserDataRooms = useCallback(async () => {
    try {
      const response = await api.get('/data-room', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status !== 200) {
        console.error('Error fetching data rooms:', response);
        return;
      }
      // Check if the new data is different from the current state
      const newDataRooms = response.data['user_data_rooms'];
      if (!isEqual(newDataRooms, dataRooms)) {
        setDataRooms(newDataRooms);
      }
    } catch (error) {
      console.error('Error fetching data rooms:', error);
    }
  }, [dataRooms, accessToken]);

  const getDataRoom = useCallback(async (dataRoomId: number): Promise<DataRoom|undefined> => {
    try {
      const response = await api.get(`/data-room/${dataRoomId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status !== 200) {
        console.error('Error fetching data room details:', response);
        return;
      }
      return response.data as DataRoom;
    } catch (error) {
      console.error('Error fetching data room details:', error);
    }
  }, [accessToken]);

  const createDataRoom = useCallback(async (name: string): Promise<void> => {
    try {
      await api.post('/data-room', { name }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await getUserDataRooms(); // Fetch updated data rooms after creating a new one
    } catch (error) {
      console.error('Error creating data room:', error);
    }
  }, [accessToken, getUserDataRooms]);

  const renameDataRoom = useCallback(async (dataRoomId: number, newName: string): Promise<DataRoom|undefined> => {
    try {
      const response = await api.put(`/data-room/${dataRoomId}`, { name: newName }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status !== 200) {
        console.error('Error renaming data room:', response);
      }
      return response.data as DataRoom;
    } catch (error) {
      console.error('Error renaming data room:', error);
    }
  }, [accessToken]);

  // useDataRoomService.t
  const deleteDataRoom = useCallback(async (dataRoomId: number): Promise<void> => {
    try {
      await api.delete(`/data-room/${dataRoomId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await getUserDataRooms(); // Fetch updated data rooms after deletion
    } catch (error) {
      console.error('Error deleting data room:', error);
    }
  }, [accessToken, getUserDataRooms]);

  return {
    dataRooms,
    getUserDataRooms,
    getDataRoom,
    createDataRoom,
    renameDataRoom,
    deleteDataRoom
  };
};