import React, { createContext, useContext, useState } from 'react';

interface ImageUpdateContextType {
  lastImageUpdate: number;
  updateImageTimestamp: () => void;
  activityUpdated: boolean;
  setActivityUpdated: (updated: boolean) => void;
}

// Tạo context để theo dõi cập nhật ảnh và hoạt động người dùng
const ImageUpdateContext = createContext<ImageUpdateContextType>({
  lastImageUpdate: 0,
  updateImageTimestamp: () => {},
  activityUpdated: false,
  setActivityUpdated: () => {},
});

// Hook để sử dụng context
export const useImageUpdate = () => useContext(ImageUpdateContext);

// Provider component
export const ImageUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastImageUpdate, setLastImageUpdate] = useState<number>(Date.now());
  const [activityUpdated, setActivityUpdated] = useState<boolean>(false);

  // Hàm cập nhật timestamp khi có ảnh mới
  const updateImageTimestamp = () => {
    setLastImageUpdate(Date.now());
    // Đánh dấu rằng hoạt động người dùng đã được cập nhật
    setActivityUpdated(true);
  };

  return (
    <ImageUpdateContext.Provider 
      value={{ 
        lastImageUpdate, 
        updateImageTimestamp, 
        activityUpdated, 
        setActivityUpdated 
      }}
    >
      {children}
    </ImageUpdateContext.Provider>
  );
};
