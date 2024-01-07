import React, { createContext, useState, ReactNode, useContext } from 'react';
import { DataRoom } from '../components/DataRoom/DataRoom';
import { Folder } from '../components/Folder/Folder';
import { File } from '../components/File/File';

interface StateContextProps {
  selectedDataRoom: DataRoom | null;
  selectedFolder: Folder | null;
  selectedFile: File | null;
  setSelectedDataRoom: (dataRoom: DataRoom | null) => void;
  setSelectedFolder: (folder: Folder | null) => void;
  setSelectedFile: (file: File | null) => void;
  clearAppState: () => void;
}

export const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDataRoom, setSelectedDataRoom] = useState<DataRoom | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const clearAppState = () => {
    setSelectedDataRoom(null);
    setSelectedFolder(null);
    setSelectedFile(null);
  };

  return (
    <StateContext.Provider
      value={{
        selectedDataRoom,
        selectedFolder,
        selectedFile,
        setSelectedDataRoom,
        setSelectedFolder,
        setSelectedFile,
        clearAppState,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};
