// useFileService.tsx
import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { api } from './api';

export const useFileService = (): {
  getFile: (fileId: number) => Promise<Blob>;
  uploadFile: (file: File, parentDataRoomId: number, parentFolderId?: number) => Promise<void>;
  moveFile: (fileId: number, newName: string, parentDataRoomId: number, parentFolderId?: number) => Promise<void>;
  deleteFile: (fileId: number) => Promise<void>; 
} => {
  const { accessToken } = useAuthContext();

  const getFile = useCallback(async (fileId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/file/${fileId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status !== 200) {
        console.error('Error fetching file:', response);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }, [accessToken]);

  const uploadFile = useCallback(async (file: File, parentDataRoomId: number, parentFolderId?: number): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('name', file.name);
      formData.append('parent_data_room_id', parentDataRoomId.toString());
      if (parentFolderId) {
        formData.append('parent_folder_id', parentFolderId.toString());
      }

      await api.post('/file', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }, [accessToken]);

  const moveFile = useCallback(async (fileId: number, newName: string, parentDataRoomId: number, parentFolderId?: number): Promise<void> => {
    try {
      await api.put(`/file/${fileId}`, {
        name: newName,
        parent_data_room_id: parentDataRoomId,
        parent_folder_id: parentFolderId,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  }, [accessToken]);

  const deleteFile = useCallback(async (fileId: number): Promise<void> => {
    try {
      await api.delete(`/file/${fileId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }, [accessToken]);

  return {
    getFile,
    uploadFile,
    moveFile,
    deleteFile,
  };
};
