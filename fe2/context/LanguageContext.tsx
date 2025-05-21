import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu dữ liệu cho ngôn ngữ
export type Language = 'en' | 'vi';

// Định nghĩa kiểu dữ liệu cho context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  translations: Record<string, Record<string, string>>;
  t: (key: string) => string; // Hàm dịch
}

// Tạo context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Các bản dịch cho các chuỗi trong ứng dụng
const translations = {
  en: {
    // Captioning
    'captioning.title': 'AI Image Captioning',
    'captioning.subtitle': 'Transform your images into descriptive text',
    'captioning.uploadText': 'Select an image to generate a caption',
    'captioning.gallery': 'Gallery',
    'captioning.camera': 'Camera',
    'captioning.generateButton': 'Generate Caption',
    'captioning.regenerateButton': 'Regen',
    'captioning.editButton': 'Edit',
    'captioning.newButton': 'New',
    'captioning.cancelButton': 'Cancel',
    'captioning.chooseAnotherImage': 'Choose another image',
    'captioning.viewMyImages': 'View my collection',
    'captioning.generatingCaption': 'Generating caption...',
    'captioning.generatedCaption': 'Generated Caption',
    'captioning.defaultModel': 'Default',
    'captioning.travelModel': 'Travel',
    'captioning.selectModel': 'Select caption model:',
    'captioning.changeImage': 'Change image',
    'captioning.saveButton': 'Save',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.activity': 'Your Activity',
    'profile.images': 'Images',
    'profile.today': 'Today',
    'profile.last7days': 'Activity last 7 days',
    'profile.activityLastDays': 'Activity last 7 days',
    'profile.personalInfo': 'Personal Information',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email',
    'profile.notProvided': 'Not provided',
    'profile.saveChanges': 'Save Changes',
    'profile.security': 'Security',
    'profile.changePassword': 'Change Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmNewPassword': 'Confirm New Password',
    'profile.logout': 'Logout',
    'profile.language': 'Language',
    'profile.languageSettings': 'Language Settings',
    'profile.selectLanguage': 'Select application language',
    'profile.english': 'English',
    'profile.vietnamese': 'Vietnamese',
    'profile.languageInfo': 'This will change the language for the entire app, including captions',
    
    // Admin
    'admin.title': 'Admin Panel',
    
    // Tabs
    'tabs.home': 'Home',
    'tabs.captioning': 'Captioning',
    'tabs.history': 'History',
    'tabs.profile': 'Profile',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  vi: {
    // Captioning
    'captioning.title': 'Mô tả ảnh bằng AI',
    'captioning.subtitle': 'Chuyển đổi hình ảnh thành văn bản mô tả',
    'captioning.uploadText': 'Chọn một hình ảnh để tạo mô tả',
    'captioning.gallery': 'Thư viện',
    'captioning.camera': 'Máy ảnh',
    'captioning.generateButton': 'Tạo mô tả',
    'captioning.regenerateButton': 'Tạo lại',
    'captioning.editButton': 'Sửa',
    'captioning.newButton': 'Mới',
    'captioning.cancelButton': 'Hủy',
    'captioning.chooseAnotherImage': 'Chọn ảnh khác',
    'captioning.viewMyImages': 'Xem bộ sưu tập của tôi',
    'captioning.generatingCaption': 'Đang tạo mô tả...',
    'captioning.generatedCaption': 'Mô tả đã tạo',
    'captioning.defaultModel': 'Mặc định',
    'captioning.travelModel': 'Du lịch',
    'captioning.selectModel': 'Chọn mô hình mô tả:',
    'captioning.changeImage': 'Đổi ảnh',
    'captioning.saveButton': 'Lưu',
    
    // Profile
    'profile.title': 'Thông tin cá nhân',
    'profile.activity': 'Hoạt động của bạn',
    'profile.images': 'Hình ảnh',
    'profile.today': 'Hôm nay',
    'profile.last7days': 'Hoạt động 7 ngày qua',
    'profile.activityLastDays': 'Hoạt động 7 ngày qua',
    'profile.personalInfo': 'Thông tin cá nhân',
    'profile.fullName': 'Họ và tên',
    'profile.email': 'Email',
    'profile.notProvided': 'Chưa cung cấp',
    'profile.saveChanges': 'Lưu thay đổi',
    'profile.security': 'Bảo mật',
    'profile.changePassword': 'Đổi mật khẩu',
    'profile.currentPassword': 'Mật khẩu hiện tại',
    'profile.newPassword': 'Mật khẩu mới',
    'profile.confirmNewPassword': 'Xác nhận mật khẩu mới',
    'profile.logout': 'Đăng xuất',
    'profile.language': 'Ngôn ngữ',
    'profile.languageSettings': 'Cài đặt ngôn ngữ',
    'profile.selectLanguage': 'Chọn ngôn ngữ ứng dụng',
    'profile.english': 'Tiếng Anh',
    'profile.vietnamese': 'Tiếng Việt',
    'profile.languageInfo': 'Thay đổi này sẽ áp dụng cho toàn bộ ứng dụng, bao gồm cả mô tả ảnh',
    
    // Admin
    'admin.title': 'Quản trị',
    
    // Tabs
    'tabs.home': 'Trang chủ',
    'tabs.captioning': 'Mô tả ảnh',
    'tabs.history': 'Lịch sử',
    'tabs.profile': 'Hồ sơ',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
  }
};

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi'); // Mặc định là tiếng Việt

  // Tải ngôn ngữ đã lưu khi component được mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage === 'en' || savedLanguage === 'vi') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Lỗi khi tải ngôn ngữ đã lưu:', error);
      }
    };
    
    loadSavedLanguage();
  }, []);

  // Hàm thay đổi ngôn ngữ và lưu vào AsyncStorage
  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('appLanguage', lang);
      // Lưu thêm vào preferredLanguage để tương thích với mã cũ
      await AsyncStorage.setItem('preferredLanguage', lang);
    } catch (error) {
      console.error('Lỗi khi lưu ngôn ngữ:', error);
    }
  };

  // Hàm dịch
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Hook để sử dụng context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
