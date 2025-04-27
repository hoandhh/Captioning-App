import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { imageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

// Bảng màu đồng bộ với thiết kế mới
const AppTheme = {
  primary: '#4A00E0',
  primaryGradient: ['#4A00E0', '#8E2DE2', '#6A82FB'],
  secondary: '#00C9FF',
  secondaryGradient: ['#00C9FF', '#92FE9D'],
  accent: '#9B59B6',
  success: '#2ECC71',
  warning: '#F39C12',
  info: '#4A90E2',
  background: '#f8f9fa',
  card: 'rgba(255, 255, 255, 0.95)',
  text: '#333',
  textLight: '#666',
  textLighter: '#888',
};

interface ImageItem {
  id: string;
  description: string;
  url: string;
  created_at: string;
  file_name?: string;
}

const HistoryScreen = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchImages();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchImages();
    }, [])
  );

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Change to getUserImages to fetch only the user's images
      const response = await imageService.getUserImages(1, 20);
      
      // Process images to ensure they have proper URLs
      const processedImages = (response.images || []).map((img: any) => {
        // Check if the image already has a complete URL
        if (img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
          return img;
        }
        
        // If the image has a relative URL or no URL, construct the full URL using the environment config
        return {
          ...img,
          url: imageService.getImageUrl(img.id),
        };
      });
      
      setImages(processedImages);
    } catch (error) {
      console.error('Failed to fetch user images:', error);
      Alert.alert('Error', 'Failed to load your images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  };

  const renderImage = ({ item }: { item: ImageItem }) => {
    return (
      <Animatable.View animation="fadeIn" duration={800} style={styles.imageCardContainer}>
        <TouchableOpacity
          style={styles.imageCard}
          onPress={() => {
            setSelectedImage(item);
            setModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.url }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.imageGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="image-outline" size={24} color="#fff" />
            </View>
          </View>
          <View style={styles.captionContainer}>
            <Text style={styles.caption} numberOfLines={2}>
              {item.description || 'No caption available'}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };
  
  const startEditing = () => {
    if (selectedImage) {
      setEditedCaption(selectedImage.description || '');
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    // Đóng bàn phím trước khi hủy chỉnh sửa
    Keyboard.dismiss();
    setIsEditing(false);
    setEditedCaption('');
  };

  const saveEditedCaption = async () => {
    if (!selectedImage || !editedCaption.trim()) return;
    
    // Đóng bàn phím trước khi lưu
    Keyboard.dismiss();
    
    try {
      setUpdateLoading(true);
      console.log('Calling updateCaption API with:', {
        imageId: selectedImage.id,
        caption: editedCaption.trim()
      });
      
      // Gọi API cập nhật caption
      const response = await imageService.updateCaption(selectedImage.id, editedCaption.trim());
      console.log('API response:', response);
      
      // Cập nhật UI với caption mới
      const newDescription = editedCaption.trim();
      
      // Cập nhật selectedImage
      setSelectedImage({
        ...selectedImage,
        description: newDescription
      });
      
      // Cập nhật danh sách images
      setImages(images.map(img => 
        img.id === selectedImage.id ? 
        {...img, description: newDescription} : 
        img
      ));
      
      // Đóng chế độ chỉnh sửa
      setIsEditing(false);
      
      // Thông báo thành công
      Alert.alert('Thành công', 'Cập nhật mô tả thành công');
      
    } catch (error) {
      console.error('Error updating caption:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật mô tả. Vui lòng thử lại sau.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const renderImageDetailModal = () => {
    if (!selectedImage) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            setModalVisible(false);
          }}
        >
          <BlurView intensity={90} style={styles.blurContainer}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animatable.View 
                animation="zoomIn" 
                duration={300} 
                style={styles.modalContainer}
              >
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name="close-circle" size={32} color={AppTheme.primary} />
                </TouchableOpacity>
                
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedImage.url }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </View>
                
                {isEditing ? (
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editedCaption}
                        onChangeText={setEditedCaption}
                        placeholder="Enter a new caption..."
                        multiline
                        autoFocus
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelEditButton]}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.editButton, 
                            styles.saveButton,
                            (!editedCaption.trim() || updateLoading) && styles.disabledButton
                          ]}
                          onPress={saveEditedCaption}
                          disabled={!editedCaption.trim() || updateLoading}
                        >
                          {updateLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.editButtonText}>Save</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                ) : (
                  <View style={styles.modalCaptionContainer}>
                    <View style={styles.captionHeader}>
                      <Text style={styles.captionTitle}>Caption</Text>
                      <TouchableOpacity 
                        style={styles.editIconButton}
                        onPress={startEditing}
                      >
                        <Feather name="edit-2" size={18} color={AppTheme.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalCaption}>
                      {selectedImage.description || 'No caption available'}
                    </Text>
                    
                    <View style={styles.modalInfoContainer}>
                      <View style={styles.infoRow}>
                        <Feather name="calendar" size={16} color={AppTheme.textLight} />
                        <Text style={styles.infoText}>
                          {new Date(selectedImage.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      {selectedImage.file_name && (
                        <View style={styles.infoRow}>
                          <Feather name="file" size={16} color={AppTheme.textLight} />
                          <Text style={styles.infoText}>
                            {selectedImage.file_name}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.modalActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <LinearGradient
                          colors={AppTheme.primaryGradient as any}
                          style={styles.actionButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Feather name="download" size={18} color="#fff" />
                          <Text style={styles.actionButtonText}>Download</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <LinearGradient
                          colors={['#FF416C', '#FF4B2B']}
                          style={styles.actionButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Feather name="trash-2" size={18} color="#fff" />
                          <Text style={styles.actionButtonText}>Delete</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Animatable.View>
            </TouchableWithoutFeedback>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <Animatable.View animation="fadeIn" duration={800} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppTheme.primary} />
          <Text style={styles.loadingText}>Đang tải hình ảnh...</Text>
        </Animatable.View>
      );
    }

    return (
      <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="image-multiple-outline" size={90} color={AppTheme.primary} />
        </View>
        <Text style={styles.emptyText}>Chưa có ảnh nào</Text>
        <Text style={styles.emptySubtext}>Bắt đầu bằng cách tải lên ảnh đầu tiên</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push('/(tabs)/captioning')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={AppTheme.primaryGradient as any}
            style={styles.uploadGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Tải ảnh lên</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppTheme.primary} />
      
      <View style={styles.content}>
        <Animatable.View 
          animation="fadeInUp" 
          duration={600}
          style={styles.sectionHeader}
        >
          <View style={styles.titleContainer}>
            <Feather name="image" size={24} color={AppTheme.primary} />
            <Text style={styles.sectionTitle}>Ảnh của tôi</Text>
          </View>
          <TouchableOpacity 
            style={styles.uploadNewButton}
            onPress={() => router.push('/(tabs)/captioning')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={AppTheme.primaryGradient as any}
              style={styles.uploadButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.uploadNewText}>Thêm ảnh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppTheme.primary} />
            <Text style={styles.loadingText}>Đang tải hình ảnh...</Text>
          </View>
        ) : (
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={images.length === 0 ? styles.emptyListContainer : styles.imageList}
            numColumns={2}
            columnWrapperStyle={styles.imageRow}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[AppTheme.primary]}
                tintColor={AppTheme.primary}
              />
            }
          />
        )}
      </View>
      
      {renderImageDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.background,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.text,
    marginLeft: 8,
  },
  uploadNewButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  uploadNewText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: AppTheme.textLight,
  },
  imageList: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageCardContainer: {
    width: (width - 40) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    opacity: 0,
  },
  captionContainer: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: AppTheme.textLighter,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppTheme.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
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
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCaptionContainer: {
    padding: 20,
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  captionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.text,
  },
  editIconButton: {
    padding: 5,
  },
  modalCaption: {
    fontSize: 16,
    color: AppTheme.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalInfoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: AppTheme.textLight,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  editContainer: {
    marginVertical: 10,
    width: '100%',
    padding: 20,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: AppTheme.primary,
  },
  cancelEditButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButtonText: {
    color: AppTheme.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default HistoryScreen;
