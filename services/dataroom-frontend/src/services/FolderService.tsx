import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { api } from './api';
import { Folder } from '../components/Folder/Folder';

export const useFolderService = (): {
	getFolder: (folderId: number) => Promise<Folder|undefined>;
	createFolder: (name: string, parentDataRoomId: number, parentFolderId?: number) => Promise<void>;
    moveFolder: (folderId: number, newName: string, parentDataRoomId: number, parentFolderId?: number) => Promise<Folder|undefined>;  
    deleteFolder: (folderId: number) => Promise<void>;
} => {
	const { accessToken } = useAuthContext();

	const getFolder = useCallback(async (folderId: number): Promise<Folder | undefined> => {
		try {
            if (!folderId) {
                return;
            }
			const response = await api.get<Folder>(`/folder/${folderId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
            if (response.status !== 200) {
                console.error('Error fetching folder:', response);
                return;
            }
            const data = response.data;
            if (data) {
                return {
                    "id": data.id, 
                    "name": data.name, 
                    "parent_data_room_id": data.parent_data_room_id, 
                    "parent_folder_id": data.parent_folder_id, 
                    "children_folders": data.children_folders, 
                    "children_files": data.children_files,
                    } as Folder;
                }
            } catch (error) {
                console.error('Error fetching folder:', error);
            }
        }, [accessToken]);

	const createFolder = useCallback(async (name: string, parentDataRoomId: number, parentFolderId?: number): Promise<void> => {
		try {
			const response = await api.post('/folder', { name, parent_data_room_id: parentDataRoomId, parent_folder_id: parentFolderId }, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
            if (response.status !== 201) {
                return;
            }
		} catch (error) {
			console.error('Error creating folder:', error);
		}
	}, [accessToken]);

    const moveFolder = useCallback(async (folderId: number, newName: string, parentDataRoomId: number, parentFolderId?: number): Promise<Folder | undefined> => {
        try {
          const response = await api.put(`/folder/${folderId}`, {
            name: newName,
            parent_data_room_id: parentDataRoomId,
            parent_folder_id: parentFolderId,
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
    
          if (response.status !== 200) {
            console.error('Error fetching folder:', response);
            return;
          }
          const data = response.data;
          if (data) {
            return {
                "id": data.id, 
                "name": data.name, 
                "parent_data_room_id": data.parent_data_room_id, 
                "parent_folder_id": data.parent_folder_id, 
                "children_folders": data.children_folders, 
                "children_files": data.children_files,
                } as Folder;
            }
        } catch (error) {
          console.error('Error moving folder:', error);
        }
      }, [accessToken]);

      const deleteFolder = useCallback(async (folderId: number): Promise<void> => {
        try {
          const response = await api.delete(`/folder/${folderId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (response.status !== 200) {
            console.error('Error deleting folder:', response);
          }
        } catch (error) {
          console.error('Error deleting folder:', error);
        }
      }, [accessToken]);

	return {
		getFolder,
		createFolder,
        moveFolder,
        deleteFolder,
	};
};
