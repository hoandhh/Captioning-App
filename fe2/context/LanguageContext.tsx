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
    'captioning.defaultModelFull': 'Default model',
    'captioning.travelModelFull': 'Travel model',
    'captioning.newCaptionWithModel': 'Create new caption with {model}',
    'captioning.enterCaptionHere': 'Enter your caption here...',
    'captioning.locationPermissionDenied': 'Location permission denied',
    'captioning.locationPermissionNeeded': 'Location permission is needed to save location information!',
    'captioning.cameraPermissionDenied': 'Camera permission denied',
    'captioning.cameraPermissionNeeded': 'Camera permission is needed!',
    'captioning.galleryPermissionDenied': 'Gallery permission denied',
    'captioning.galleryPermissionNeeded': 'Gallery permission is needed!',
    'captioning.errorTakingPicture': 'Error',
    'captioning.errorTakingPictureMessage': 'Could not take picture. Please try again.',
    'captioning.errorPickingImage': 'Error',
    'captioning.errorPickingImageMessage': 'Could not select image. Please try again.',
    'captioning.errorGeneratingCaption': 'Error generating caption',
    'captioning.errorGeneratingCaptionMessage': 'Could not connect to server. Please check your network settings and API URL in services/api.ts',
    'captioning.errorRegeneratingCaption': 'Error regenerating caption',
    'captioning.errorUpdatingCaption': 'Error',
    'captioning.errorUpdatingCaptionMessage': 'Could not update caption. Please try again.',
    
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
    'profile.enterFullName': 'Enter your full name',
    'profile.enterEmail': 'Enter your email',
    'profile.enterCurrentPassword': 'Enter current password',
    'profile.enterNewPassword': 'Enter new password',
    'profile.confirmNewPasswordPlaceholder': 'Confirm new password',
    'profile.errorEmptyEmail': 'Error',
    'profile.errorEmptyEmailMessage': 'Email cannot be empty',
    'profile.profileUpdateSuccess': 'Success',
    'profile.profileUpdateSuccessMessage': 'Profile updated successfully',
    'profile.errorUpdateProfile': 'Error',
    'profile.errorUpdateProfileMessage': 'Failed to update profile. Please try again.',
    'profile.errorPasswordFields': 'Error',
    'profile.errorPasswordFieldsMessage': 'All password fields are required',
    'profile.errorPasswordMatch': 'Error',
    'profile.errorPasswordMatchMessage': 'New passwords do not match',
    'profile.errorPasswordLength': 'Error',
    'profile.errorPasswordLengthMessage': 'New password must be at least 6 characters long',
    'profile.passwordChangeSuccess': 'Success',
    'profile.passwordChangeSuccessMessage': 'Password changed successfully',
    'profile.errorPasswordChange': 'Error',
    'profile.errorPasswordChangeMessage': 'Failed to change password. Please try again.',
    'profile.loadingProfile': 'Loading profile...',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.users': 'Users',
    'admin.images': 'Images',
    'admin.searchUsers': 'Search users...',
    'admin.searchImages': 'Search images...',
    'admin.username': 'Username',
    'admin.email': 'Email',
    'admin.role': 'Role',
    'admin.status': 'Status',
    'admin.actions': 'Actions',
    'admin.active': 'Active',
    'admin.inactive': 'Inactive',
    'admin.admin': 'Admin',
    'admin.user': 'User',
    'admin.changeRole': 'Change Role',
    'admin.toggleStatus': 'Toggle Status',
    'admin.imageDetails': 'Image Details',
    'admin.uploadedBy': 'Uploaded by',
    'admin.uploadDate': 'Upload Date',
    'admin.location': 'Location',
    'admin.caption': 'Caption',
    'admin.deleteImage': 'Delete Image',
    'admin.confirmDeleteImage': 'Confirm Delete',
    'admin.confirmDeleteImageMessage': 'Are you sure you want to delete this image?',
    'admin.deletingImage': 'Deleting image...',
    'admin.noImagesFound': 'No images found',
    'admin.noUsersFound': 'No users found',
    'admin.confirmRoleChange': 'Confirm Role Change',
    'admin.confirmRoleChangeMessage': 'Are you sure you want to change this user\'s role?',
    'admin.confirmStatusChange': 'Confirm Status Change',
    'admin.confirmStatusChangeMessage': 'Are you sure you want to change this user\'s status?',
    'admin.roleChangeSuccess': 'Success',
    'admin.roleChangeSuccessMessage': 'User role changed successfully',
    'admin.statusChangeSuccess': 'Success',
    'admin.statusChangeSuccessMessage': 'User status changed successfully',
    
    // History
    'history.title': 'History',
    'history.noImages': 'No images found',
    'history.filterByLocation': 'Filter by location',
    'history.clearFilter': 'Clear filter',
    'history.searchLocations': 'Search locations...',
    'history.noLocations': 'No locations found',
    'history.createGroupCaption': 'Create Group Caption',
    'history.confirmDeleteImage': 'Confirm Delete',
    'history.confirmDeleteImageMessage': 'Are you sure you want to delete this image?',
    'history.deletingImage': 'Deleting image...',
    'history.deleteSuccess': 'Success',
    'history.deleteSuccessMessage': 'Image deleted successfully',
    'history.failedToLoadImages': 'Failed to load your images. Please try again later.',
    'history.failedToDelete': 'Failed to delete image. Please try again later.',
    'history.noDescription': 'No description available',
    'history.description': 'Description',
    'history.searchImages': 'Search images...',
    'history.loading': 'Loading images...',
    'history.noImagesYet': 'No images yet',
    'history.startByUploading': 'Start by uploading your first image',
    'history.uploadImage': 'Upload Image',
    'history.download': 'Download',
    'history.delete': 'Delete',
    'history.edit': 'Edit',
    'history.save': 'Save',
    'history.cancel': 'Cancel',
    'history.enterNewDescription': 'Enter new description...',
    'history.updateSuccess': 'Success',
    'history.updateSuccessMessage': 'Description updated successfully',
    'history.updateError': 'Error',
    'history.updateErrorMessage': 'Failed to update description. Please try again.',
    'history.downloadSuccess': 'Success',
    'history.downloadSuccessMessage': 'Image saved to gallery',
    'history.downloadError': 'Error',
    'history.downloadErrorMessage': 'Failed to download image. Please try again.',
    'history.share': 'Share',
    'history.unknown': 'Unknown',
    'history.permissionNeeded': 'Permission needed',
    'history.storagePermissionNeeded': 'Storage permission is needed to save images!',
    
    // Group Captioning
    'group.title': 'Group Captioning',
    'group.selectImages': 'Select Images',
    'group.generateGroupCaption': 'Generate Group Caption',
    'group.generatingCaption': 'Generating caption...',
    'group.shareResult': 'Share Result',
    'group.saveToGallery': 'Save to Gallery',
    'group.shareToSocial': 'Share to Social Media',
    'group.savedToGallery': 'Saved to gallery',
    'group.selectUpTo4': 'Select up to 4 images',
    'group.minTwoImages': 'Please select at least 2 images',
    'group.permissionNeeded': 'Permission needed',
    'group.mediaPermissionMessage': 'Media library permission is needed to share!',
    'group.errorSharing': 'Error sharing',
    'group.errorSharingMessage': 'Could not share content. Please try again later.',
    'group.shareTitle': 'Group Caption from Captioning App',
    'group.errorCreatingCaption': 'Error creating group caption',
    'group.errorCreatingCaptionMessage': 'Could not create group caption. Please try again later.',
    
    // Tabs
    'tabs.home': 'Home',
    'tabs.captioning': 'Captioning',
    'tabs.history': 'History',
    'tabs.profile': 'Profile',
    
    // Home
    'home.welcome': 'Welcome, {name}!',
    'home.title': 'AI Image Captioning',
    'home.subtitle': 'Transform your images into descriptive text with advanced AI technology. Perfect for accessibility, content creation, and image organization.',
    'home.startCaptioning': 'Start Captioning',
    'home.features': 'Key Features',
    'home.feature1Title': 'Smart AI Descriptions',
    'home.feature1Description': 'Accurate descriptions generated by advanced AI models',
    'home.feature2Title': 'Regenerate Captions',
    'home.feature2Description': 'Not satisfied? Regenerate captions with just a tap',
    'home.feature3Title': 'Cloud Storage',
    'home.feature3Description': 'Access your captioned images from anywhere, anytime',
    'home.feature4Title': 'Easy Sharing',
    'home.feature4Description': 'Share your captioned images with friends and social media',
    'home.process': 'Process Flow',
    'home.step1': 'Upload',
    'home.step2': 'Process',
    'home.step3': 'Result',
    'home.step4': 'Share',
    'home.step1Description': 'Upload your image from gallery or camera',
    'home.step2Description': 'AI processes and analyzes your image',
    'home.step3Description': 'View the generated caption result',
    'home.step4Description': 'Save, edit, or share your captioned image',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.user': 'User',
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
    'captioning.defaultModelFull': 'Mô hình mặc định',
    'captioning.travelModelFull': 'Mô hình du lịch',
    'captioning.newCaptionWithModel': 'Tạo mô tả mới với {model}',
    'captioning.enterCaptionHere': 'Nhập mô tả của bạn ở đây...',
    'captioning.locationPermissionDenied': 'Từ chối quyền truy cập',
    'captioning.locationPermissionNeeded': 'Cần có quyền truy cập vào vị trí để lưu thông tin địa điểm!',
    'captioning.cameraPermissionDenied': 'Từ chối quyền truy cập',
    'captioning.cameraPermissionNeeded': 'Cần có quyền truy cập vào camera!',
    'captioning.galleryPermissionDenied': 'Từ chối quyền truy cập',
    'captioning.galleryPermissionNeeded': 'Cần có quyền truy cập vào thư viện ảnh!',
    'captioning.errorTakingPicture': 'Lỗi',
    'captioning.errorTakingPictureMessage': 'Không thể chụp ảnh. Vui lòng thử lại.',
    'captioning.errorPickingImage': 'Lỗi',
    'captioning.errorPickingImageMessage': 'Không thể chọn ảnh. Vui lòng thử lại.',
    'captioning.errorGeneratingCaption': 'Lỗi khi tạo mô tả',
    'captioning.errorGeneratingCaptionMessage': 'Không thể kết nối với máy chủ. Vui lòng kiểm tra cài đặt mạng và URL API trong services/api.ts',
    'captioning.errorRegeneratingCaption': 'Lỗi khi tạo lại mô tả',
    'captioning.errorUpdatingCaption': 'Lỗi',
    'captioning.errorUpdatingCaptionMessage': 'Không thể cập nhật mô tả. Vui lòng thử lại.',
    
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
    'profile.enterFullName': 'Nhập họ và tên của bạn',
    'profile.enterEmail': 'Nhập email của bạn',
    'profile.enterCurrentPassword': 'Nhập mật khẩu hiện tại',
    'profile.enterNewPassword': 'Nhập mật khẩu mới',
    'profile.confirmNewPasswordPlaceholder': 'Xác nhận mật khẩu mới',
    'profile.errorEmptyEmail': 'Lỗi',
    'profile.errorEmptyEmailMessage': 'Email không được để trống',
    'profile.profileUpdateSuccess': 'Thành công',
    'profile.profileUpdateSuccessMessage': 'Cập nhật thông tin thành công',
    'profile.errorUpdateProfile': 'Lỗi',
    'profile.errorUpdateProfileMessage': 'Không thể cập nhật thông tin. Vui lòng thử lại.',
    'profile.errorPasswordFields': 'Lỗi',
    'profile.errorPasswordFieldsMessage': 'Tất cả các trường mật khẩu đều bắt buộc',
    'profile.errorPasswordMatch': 'Lỗi',
    'profile.errorPasswordMatchMessage': 'Mật khẩu mới không khớp',
    'profile.errorPasswordLength': 'Lỗi',
    'profile.errorPasswordLengthMessage': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'profile.passwordChangeSuccess': 'Thành công',
    'profile.passwordChangeSuccessMessage': 'Đổi mật khẩu thành công',
    'profile.errorPasswordChange': 'Lỗi',
    'profile.errorPasswordChangeMessage': 'Không thể đổi mật khẩu. Vui lòng thử lại.',
    'profile.loadingProfile': 'Đang tải thông tin cá nhân...',
    
    // Admin
    'admin.title': 'Quản trị',
    'admin.users': 'Người dùng',
    'admin.images': 'Hình ảnh',
    'admin.searchUsers': 'Tìm kiếm người dùng...',
    'admin.searchImages': 'Tìm kiếm hình ảnh...',
    'admin.username': 'Tên đăng nhập',
    'admin.email': 'Email',
    'admin.role': 'Vai trò',
    'admin.status': 'Trạng thái',
    'admin.actions': 'Thao tác',
    'admin.active': 'Hoạt động',
    'admin.inactive': 'Không hoạt động',
    'admin.admin': 'Quản trị viên',
    'admin.user': 'Người dùng',
    'admin.changeRole': 'Đổi vai trò',
    'admin.toggleStatus': 'Đổi trạng thái',
    'admin.imageDetails': 'Chi tiết hình ảnh',
    'admin.uploadedBy': 'Người tải lên',
    'admin.uploadDate': 'Ngày tải lên',
    'admin.location': 'Địa điểm',
    'admin.caption': 'Mô tả',
    'admin.deleteImage': 'Xóa hình ảnh',
    'admin.confirmDeleteImage': 'Xác nhận xóa',
    'admin.confirmDeleteImageMessage': 'Bạn có chắc chắn muốn xóa hình ảnh này?',
    'admin.deletingImage': 'Đang xóa hình ảnh...',
    'admin.noImagesFound': 'Không tìm thấy hình ảnh',
    'admin.noUsersFound': 'Không tìm thấy người dùng',
    'admin.confirmRoleChange': 'Xác nhận thay đổi vai trò',
    'admin.confirmRoleChangeMessage': 'Bạn có chắc chắn muốn thay đổi vai trò của người dùng này?',
    'admin.confirmStatusChange': 'Xác nhận thay đổi trạng thái',
    'admin.confirmStatusChangeMessage': 'Bạn có chắc chắn muốn thay đổi trạng thái của người dùng này?',
    'admin.roleChangeSuccess': 'Thành công',
    'admin.roleChangeSuccessMessage': 'Thay đổi vai trò người dùng thành công',
    'admin.statusChangeSuccess': 'Thành công',
    'admin.statusChangeSuccessMessage': 'Thay đổi trạng thái người dùng thành công',
    
    // History
    'history.title': 'Lịch sử',
    'history.noImages': 'Không tìm thấy hình ảnh',
    'history.filterByLocation': 'Lọc theo địa điểm',
    'history.clearFilter': 'Bỏ lọc',
    'history.searchLocations': 'Tìm kiếm địa điểm...',
    'history.noLocations': 'Không tìm thấy địa điểm',
    'history.createGroupCaption': 'Tạo mô tả nhóm',
    'history.confirmDeleteImage': 'Xác nhận xóa',
    'history.confirmDeleteImageMessage': 'Bạn có chắc chắn muốn xóa hình ảnh này không?',
    'history.deletingImage': 'Đang xóa hình ảnh...',
    'history.deleteSuccess': 'Thành công',
    'history.deleteSuccessMessage': 'Đã xóa hình ảnh thành công',
    'history.failedToLoadImages': 'Không thể tải hình ảnh. Vui lòng thử lại sau.',
    'history.failedToDelete': 'Không thể xóa hình ảnh. Vui lòng thử lại sau.',
    'history.noDescription': 'Chưa có mô tả',
    'history.description': 'Mô tả',
    'history.searchImages': 'Tìm kiếm hình ảnh...',
    'history.loading': 'Đang tải hình ảnh...',
    'history.noImagesYet': 'Chưa có ảnh nào',
    'history.startByUploading': 'Bắt đầu bằng cách tải lên ảnh đầu tiên',
    'history.uploadImage': 'Tải ảnh lên',
    'history.download': 'Tải xuống',
    'history.delete': 'Xóa',
    'history.edit': 'Sửa',
    'history.save': 'Lưu',
    'history.cancel': 'Hủy',
    'history.enterNewDescription': 'Nhập mô tả mới...',
    'history.updateSuccess': 'Thành công',
    'history.updateSuccessMessage': 'Cập nhật mô tả thành công',
    'history.updateError': 'Lỗi',
    'history.updateErrorMessage': 'Không thể cập nhật mô tả. Vui lòng thử lại.',
    'history.downloadSuccess': 'Thành công',
    'history.downloadSuccessMessage': 'Đã lưu hình ảnh vào thư viện ảnh',
    'history.downloadError': 'Lỗi',
    'history.downloadErrorMessage': 'Không thể tải xuống hình ảnh. Vui lòng thử lại.',
    'history.share': 'Chia sẻ',
    'history.unknown': 'Không rõ',
    'history.permissionNeeded': 'Cần quyền truy cập',
    'history.storagePermissionNeeded': 'Cần quyền truy cập vào thư viện ảnh để lưu hình ảnh!',
    
    // Group Captioning
    'group.title': 'Mô tả nhóm',
    'group.selectImages': 'Chọn hình ảnh',
    'group.generateGroupCaption': 'Tạo mô tả nhóm',
    'group.generatingCaption': 'Đang tạo mô tả...',
    'group.shareResult': 'Chia sẻ kết quả',
    'group.saveToGallery': 'Lưu vào thư viện',
    'group.shareToSocial': 'Chia sẻ lên mạng xã hội',
    'group.savedToGallery': 'Đã lưu vào thư viện',
    'group.selectUpTo4': 'Chọn tối đa 4 hình ảnh',
    'group.minTwoImages': 'Vui lòng chọn ít nhất 2 hình ảnh',
    'group.permissionNeeded': 'Cần quyền truy cập',
    'group.mediaPermissionMessage': 'Cần quyền truy cập vào thư viện ảnh để chia sẻ!',
    'group.errorSharing': 'Lỗi chia sẻ',
    'group.errorSharingMessage': 'Không thể chia sẻ nội dung. Vui lòng thử lại sau.',
    'group.shareTitle': 'Mô tả nhóm từ Captioning App',
    'group.errorCreatingCaption': 'Lỗi khi tạo mô tả nhóm',
    'group.errorCreatingCaptionMessage': 'Không thể tạo mô tả nhóm. Vui lòng thử lại sau.',
    
    // Tabs
    'tabs.home': 'Trang chủ',
    'tabs.captioning': 'Mô tả ảnh',
    'tabs.history': 'Lịch sử',
    'tabs.profile': 'Hồ sơ',
    
    // Home
    'home.welcome': 'Xin chào, {name}!',
    'home.title': 'Mô tả hình ảnh bằng trí tuệ nhân tạo',
    'home.subtitle': 'Chuyển đổi hình ảnh của bạn thành văn bản mô tả với công nghệ trí tuệ nhân tạo tiên tiến. Hoàn hảo cho việc tiếp cận, tạo nội dung và tổ chức hình ảnh.',
    'home.startCaptioning': 'Bắt đầu mô tả',
    'home.features': 'Tính năng chính',
    'home.feature1Title': 'Mô tả AI thông minh',
    'home.feature1Description': 'Mô tả chính xác được tạo bởi các mô hình AI tiên tiến',
    'home.feature2Title': 'Tạo lại mô tả',
    'home.feature2Description': 'Không hài lòng? Tạo lại mô tả chỉ với một cú chạm',
    'home.feature3Title': 'Lưu trữ đám mây',
    'home.feature3Description': 'Truy cập hình ảnh đã mô tả từ bất kỳ đâu, bất kỳ lúc nào',
    'home.feature4Title': 'Chia sẻ dễ dàng',
    'home.feature4Description': 'Chia sẻ hình ảnh đã mô tả với bạn bè và mạng xã hội',
    'home.process': 'Quy trình xử lý',
    'home.step1': 'Tải lên',
    'home.step2': 'Xử lý',
    'home.step3': 'Kết quả',
    'home.step4': 'Chia sẻ',
    'home.step1Description': 'Tải hình ảnh của bạn từ thư viện hoặc máy ảnh',
    'home.step2Description': 'AI xử lý và phân tích hình ảnh của bạn',
    'home.step3Description': 'Xem kết quả mô tả được tạo ra',
    'home.step4Description': 'Lưu, chỉnh sửa, hoặc chia sẻ hình ảnh đã mô tả của bạn',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.cancel': 'Hủy',
    'common.confirm': 'Xác nhận',
    'common.yes': 'Có',
    'common.no': 'Không',
    'common.ok': 'OK',
    'common.save': 'Lưu',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.close': 'Đóng',
    'common.user': 'Người dùng',
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
