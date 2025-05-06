import React, { createContext, useContext, useState } from 'react';

interface ImageUpdateContextType {
  lastImageUpdate: number;
  updateImageTimestamp: () => void;
}

// Tạo context để theo dõi cập nhật ảnh
const ImageUpdateContext = createContext<ImageUpdateContextType>({
  lastImageUpdate: 0,
  updateImageTimestamp: () => {},
});

// Hook để sử dụng context
export const useImageUpdate = () => useContext(ImageUpdateContext);

// Provider component
export const ImageUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastImageUpdate, setLastImageUpdate] = useState<number>(Date.now());

  // Hàm cập nhật timestamp khi có ảnh mới
  const updateImageTimestamp = () => {
    setLastImageUpdate(Date.now());
  };

  return (
    <ImageUpdateContext.Provider value={{ lastImageUpdate, updateImageTimestamp }}>
      {children}
    </ImageUpdateContext.Provider>
  );
};
