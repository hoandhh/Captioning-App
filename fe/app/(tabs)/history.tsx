import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, SafeAreaView, Alert, RefreshControl, Dimensions, TextInput, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { imageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { getImageUrl } from '../../constants/Environment';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

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
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchImages();
  }, []);

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
      <Animatable.View animation="fadeIn" duration={800}>
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
            {/* Overlay for loading/error state */}
            <View style={styles.imageOverlay}>
              <Ionicons name="image-outline" size={24} color="#ccc" />
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
    setIsEditing(false);
    setEditedCaption('');
  };

  const saveEditedCaption = async () => {
    if (!selectedImage || !editedCaption.trim()) return;
    
    try {
      setUpdateLoading(true);
      const response = await imageService.updateCaption(selectedImage.id, editedCaption.trim());
      
      // Update the selected image with the new caption
      setSelectedImage({
        ...selectedImage,
        description: response.image.description
      });
      
      // Also update the image in the images array
      setImages(images.map(img => 
        img.id === selectedImage.id ? 
        {...img, description: response.image.description} : 
        img
      ));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating caption:', error);
      Alert.alert('Error', 'Failed to update caption. Please try again.');
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
          onPress={() => setModalVisible(false)}
        >
          <BlurView intensity={90} style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={34} color="#fff" />
            </TouchableOpacity>
            
            <TouchableWithoutFeedback onPress={isEditing ? Keyboard.dismiss : undefined}>
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={(e) => {
                  e.stopPropagation();
                  if (isEditing) {
                    Keyboard.dismiss();
                  }
                }}
              >
              <Animatable.View animation="zoomIn" duration={400} style={styles.modalContent}>
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedImage.url }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.modalCaptionContainer}>
                  <View style={styles.modalCaptionHeader}>
                    <MaterialCommunityIcons name="text-box" size={24} color="#1A5276" />
                    <Text style={styles.modalCaptionTitle}>Mô tả</Text>
                  </View>
                  
                  {isEditing ? (
                    <View style={styles.editContainer}>
                      <View>
                        <TextInput
                          style={styles.editInput}
                          value={editedCaption}
                          onChangeText={setEditedCaption}
                          multiline
                          placeholder="Nhập mô tả của bạn ở đây..."
                          placeholderTextColor="#888"
                          autoFocus={true}
                          blurOnSubmit={false}
                        />
                      </View>
                      <View style={styles.editButtons}>
                        {updateLoading ? (
                          <ActivityIndicator size="small" color="#3498DB" />
                        ) : (
                          <TouchableOpacity 
                            style={styles.saveButton} 
                            onPress={saveEditedCaption}
                          >
                            <Text style={styles.editButtonText}>Lưu</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          style={styles.cancelEditButton} 
                          onPress={cancelEditing}
                        >
                          <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.modalCaption}>
                      "{selectedImage.description || 'Chưa có mô tả'}"
                    </Text>
                  )}
                  
                  {selectedImage.file_name && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="document-outline" size={18} color="#666" />
                      <Text style={styles.modalFileName}>
                        {selectedImage.file_name}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.modalDate}>
                      {new Date(selectedImage.created_at).toLocaleString()}
                    </Text>
                  </View>
                  
                  {!isEditing && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={styles.modalActionButton}
                        onPress={startEditing}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.modalButtonGradient, styles.editButtonMain]}>
                          <Ionicons name="create-outline" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Sửa mô tả</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.modalActionButton}
                        onPress={() => {
                          Alert.alert(
                            'Xóa ảnh',
                            'Bạn có chắc chắn muốn xóa ảnh này?',
                            [
                              { text: 'Hủy', style: 'cancel' },
                              { 
                                text: 'Xóa', 
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await imageService.deleteImage(selectedImage.id);
                                    setModalVisible(false);
                                    fetchImages();
                                    Alert.alert('Thành công', 'Ảnh đã được xóa thành công');
                                  } catch (error) {
                                    console.error('Failed to delete image:', error);
                                    Alert.alert('Lỗi', 'Không thể xóa ảnh');
                                  }
                                }
                              }
                            ]
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.modalButtonGradient, styles.deleteButtonMain]}>
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Xóa</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </Animatable.View>
              </TouchableOpacity>
            </TouchableWithoutFeedback>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1A5276" />
          <Text style={styles.emptyText}>Đang tải ảnh...</Text>
        </Animatable.View>
      );
    }

    return (
      <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="image-multiple-outline" size={90} color="#1A5276" />
        </View>
        <Text style={styles.emptyText}>Chưa có ảnh nào</Text>
        <Text style={styles.emptySubtext}>Bắt đầu bằng cách tải lên ảnh đầu tiên</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push('/(tabs)/captioning')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2E86C1', '#1A5276']}
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
      <LinearGradient
        colors={['#1A5276', '#2874A6', '#3498DB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
      </LinearGradient>

      <View style={styles.content}>
        <Animatable.View 
          animation="fadeInUp" 
          duration={600}
          style={styles.sectionHeader}
        >
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="image-multiple" size={24} color="#1A5276" />
            <Text style={styles.sectionTitle}>Ảnh của tôi</Text>
          </View>
          <TouchableOpacity 
            style={styles.uploadNewButton}
            onPress={() => router.push('/(tabs)/captioning')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2E86C1', '#1A5276']}
              style={styles.uploadButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
              <Text style={styles.uploadNewText}>Upload New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          horizontal={false}
          numColumns={2}
          columnWrapperStyle={styles.imageRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={images.length === 0 ? { flex: 1 } : styles.imageList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1A5276']}
            />
          }
        />
      </View>
      
      {renderImageDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  editContainer: {
    marginVertical: 10,
    width: '100%',
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
    backgroundColor: '#3498DB',
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
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
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
    paddingVertical: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A5276',
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
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  imageList: {
    paddingBottom: 20,
  },
  imageRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageCard: {
    width: (width - 40) / 2,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 5,
  },
  imageWrapper: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240,240,240,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  captionContainer: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(26, 82, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A5276',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    width: width * 0.7,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 20,
  },
  uploadGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalCaptionContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  modalCaptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalCaptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A5276',
    marginLeft: 10,
  },
  modalCaption: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalFileName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 0,
    width: '100%',
  },
  modalActionButton: {
    flex: 1,
    height: 45,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 5,
    maxWidth: '48%',
  },
  modalButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  actionButton: {
    backgroundColor: '#2E86C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  editButtonMain: {
    backgroundColor: '#3498DB',
  },
  deleteButtonMain: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  editContainer: {
    width: '100%',
    marginBottom: 20,
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
    marginBottom: 15,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelEditButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HistoryScreen;