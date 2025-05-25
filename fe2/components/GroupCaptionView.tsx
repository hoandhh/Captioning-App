import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, Dimensions, Modal, Platform, Share, Alert } from 'react-native';
import { createGroupCaption } from '../services/groupCaptionService';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

interface ImageItem {
  id: string;
  url: string;
  description: string;
  caption?: string;
  location?: string;
}

interface GroupCaptionViewProps {
  images: ImageItem[];
  onClose: () => void;
}

export const GroupCaptionView: React.FC<GroupCaptionViewProps> = ({ images, onClose }) => {
  const { t } = useLanguage();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [groupCaption, setGroupCaption] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const viewShotRef = useRef<any>(null);
  
  // Kiểm tra quyền truy cập vào thư viện ảnh
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === 'granted');
    })();
  }, []);

  const toggleImageSelection = (imageId: string) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else if (selectedImages.length < 4) {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  const handleCreateGroupCaption = async () => {
    if (selectedImages.length < 2) return;

    try {
      setLoading(true);
      const response = await createGroupCaption(selectedImages);
      setGroupCaption(response.group_caption);
      // Hiển thị modal kết quả sau khi tạo mô tả thành công
      setShowResultModal(true);
    } catch (error) {
      console.error(t('group.errorCreatingCaption'), error);
      Alert.alert(t('group.errorCreatingCaption'), t('group.errorCreatingCaptionMessage'));
    } finally {
      setLoading(false);
    }
  };

  const getGridLayout = () => {
    const selectedImagesList = images.filter(img => selectedImages.includes(img.id));
    switch (selectedImagesList.length) {
      case 2:
        return styles.twoImagesLayout;
      case 3:
        return styles.threeImagesLayout;
      case 4:
        return styles.fourImagesLayout;
      default:
        return styles.singleImageLayout;
    }
  };

  // Render modal hiển thị kết quả
  // Hàm xử lý chia sẻ nội dung
  const handleShareContent = async () => {
    if (!groupCaption) return;
    
    try {
      setSharingLoading(true);
      
      if (!hasMediaPermission) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('group.permissionNeeded'), t('group.mediaPermissionMessage'));
          setSharingLoading(false);
          return;
        }
        setHasMediaPermission(true);
      }
      
      // Chụp ảnh màn hình kết quả
      if (!viewShotRef.current) {
        throw new Error('ViewShot ref not available');
      }
      const uri = await viewShotRef.current.capture();
      
      // Lưu ảnh vào thư viện
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      // Lấy đường dẫn thực của ảnh đã lưu
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      
      // Chia sẻ ảnh và caption
      await Share.share({
        message: groupCaption,
        url: Platform.OS === 'ios' ? assetInfo.uri : uri,
        title: t('group.shareTitle')
      });
      
      console.log('Đã chia sẻ thành công');
      
    } catch (error) {
      console.error('Lỗi khi chia sẻ:', error);
      Alert.alert(t('group.errorSharing'), t('group.errorSharingMessage'));
    } finally {
      setSharingLoading(false);
    }
  };
  
  const renderResultModal = () => {
    // Lấy danh sách các ảnh đã chọn
    const selectedImagesList = images.filter(img => selectedImages.includes(img.id));
    
    return (
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <BlurView intensity={Platform.OS === 'ios' ? 50 : 30} style={styles.blurContainer}>
            <Animatable.View animation="zoomIn" duration={300} style={styles.modalContainer}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowResultModal(false)}
              >
                <Ionicons name="close-circle" size={32} color="#4A00E0" />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>{t('group.title')}</Text>
              
              <ViewShot ref={viewShotRef} style={styles.viewShot} options={{quality: 1, format: 'jpg'}}>
                <View style={styles.resultImagesContainer}>
                  {selectedImagesList.length === 2 && (
                    <View style={styles.twoImagesResult}>
                      {selectedImagesList.map((img, index) => (
                        <Image key={index} source={{ uri: img.url }} style={styles.resultImage} />
                      ))}
                    </View>
                  )}
                  
                  {selectedImagesList.length === 3 && (
                    <View style={styles.threeImagesResult}>
                      <Image source={{ uri: selectedImagesList[0].url }} style={styles.resultImageLarge} />
                      <View style={styles.resultImagesRow}>
                        <Image source={{ uri: selectedImagesList[1].url }} style={styles.resultImageSmall} />
                        <Image source={{ uri: selectedImagesList[2].url }} style={styles.resultImageSmall} />
                      </View>
                    </View>
                  )}
                  
                  {selectedImagesList.length === 4 && (
                    <View style={styles.fourImagesResult}>
                      <View style={styles.resultImagesRow}>
                        <Image source={{ uri: selectedImagesList[0].url }} style={styles.resultImageMedium} />
                        <Image source={{ uri: selectedImagesList[1].url }} style={styles.resultImageMedium} />
                      </View>
                      <View style={styles.resultImagesRow}>
                        <Image source={{ uri: selectedImagesList[2].url }} style={styles.resultImageMedium} />
                        <Image source={{ uri: selectedImagesList[3].url }} style={styles.resultImageMedium} />
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.viewShotCaptionContainer}>
                    <Text style={styles.viewShotCaptionText}>{groupCaption}</Text>
                    <Text style={styles.viewShotAppName}>{t('captioning.title')}</Text>
                  </View>
                </View>
              </ViewShot>
              
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={handleShareContent}
                  disabled={sharingLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4A00E0', '#8E2DE2']}
                    style={styles.shareButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {sharingLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Feather name="share-2" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.modalButtonText}>{t('group.shareResult')}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowResultModal(false)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4A00E0', '#8E2DE2']}
                    style={[styles.modalButtonGradient, styles.closeButtonGradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalButtonText}>{t('common.close')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </BlurView>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A00E0', '#8E2DE2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('group.title')}</Text>
      </LinearGradient>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
      >
        <Animatable.Text animation="fadeIn" style={styles.instruction}>
          {t('group.selectUpTo4')}
        </Animatable.Text>
        
        <View style={[styles.imageGrid, getGridLayout()]}>
          {images.map((image, index) => (
            <Animatable.View 
              key={image.id} 
              animation="fadeInUp" 
              delay={index * 100}
              duration={500}
            >
              <TouchableOpacity
                onPress={() => toggleImageSelection(image.id)}
                style={[
                  styles.imageContainer,
                  selectedImages.includes(image.id) && styles.selectedImage
                ]}
                activeOpacity={0.8}
              >
                <Image source={{ uri: image.url }} style={styles.image} />
                {selectedImages.includes(image.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {groupCaption && (
          <Animatable.View animation="fadeInUp" style={styles.captionContainer}>
            <View style={styles.captionHeader}>
              <Feather name="file-text" size={20} color="#4A00E0" />
              <Text style={styles.captionHeaderText}>{t('group.title')}</Text>
            </View>
            <Text style={styles.captionText}>{groupCaption}</Text>
          </Animatable.View>
        )}
      </ScrollView>
      
      {selectedImages.length >= 2 && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroupCaption}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A00E0', '#8E2DE2']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="cpu" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.createButtonText}>{t('group.generateGroupCaption')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      {renderResultModal()}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Để đảm bảo nội dung không bị che bởi nút ở dưới
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'center',
  },
  singleImageLayout: {
    justifyContent: 'center',
  },
  twoImagesLayout: {
    justifyContent: 'space-between',
  },
  threeImagesLayout: {
    justifyContent: 'space-between',
  },
  fourImagesLayout: {
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: width * 0.45,
    aspectRatio: 1,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedImage: {
    borderWidth: 3,
    borderColor: '#4A00E0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(74,0,224,0.8)',
    borderRadius: 12,
    padding: 2,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  createButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captionContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  captionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  captionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A00E0',
    marginLeft: 8,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A00E0',
    marginBottom: 20,
    marginTop: 10,
  },
  resultImagesContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  twoImagesResult: {
    flexDirection: 'row',
    height: 200,
  },
  threeImagesResult: {
    height: 250,
  },
  fourImagesResult: {
    height: 250,
  },
  resultImagesRow: {
    flexDirection: 'row',
    flex: 1,
  },
  resultImage: {
    flex: 1,
    height: '100%',
  },
  resultImageLarge: {
    width: '100%',
    height: '60%',
  },
  resultImageSmall: {
    flex: 1,
    height: '100%',
  },
  resultImageMedium: {
    flex: 1,
    height: '100%',
  },
  modalCaptionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  modalCaptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '48%',
  },
  shareButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '48%',
  },
  modalButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  closeButtonGradient: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  viewShot: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewShotCaptionContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewShotCaptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  viewShotAppName: {
    fontSize: 12,
    color: '#4A00E0',
    textAlign: 'right',
    fontWeight: 'bold',
  },
});