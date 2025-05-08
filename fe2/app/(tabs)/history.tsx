import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useImageUpdate } from '../../context/ImageUpdateContext';
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
  Share,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { imageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { LocationFilter } from '../../components/LocationFilter';
import { GroupCaptionView } from '../../components/GroupCaptionView';
import { getLocations } from '../../services/locationService';
import { Location } from '../../services/locationService';

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
  caption?: string;  // Thêm trường caption để tương thích với GroupCaptionView
  url: string;
  created_at: string;
  file_name?: string;
  location?: string;  // Tên địa điểm
}

const HistoryScreen = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [groupCaptionModalVisible, setGroupCaptionModalVisible] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const perPage = 8; // Số lượng ảnh mỗi trang
  const { user } = useAuth();
  const router = useRouter();
  const { lastImageUpdate } = useImageUpdate();

  // Track if data has been loaded already to prevent unnecessary reloads
  const dataLoadedRef = useRef(false);
  // Track if the component is mounted to prevent state updates after unmounting
  const isMountedRef = useRef(true);
  // Store the last update time to implement cache expiration
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  // Cache expiration time (5 minutes)
  const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Initial data load if not already loaded
    if (!dataLoadedRef.current) {
      fetchImages(true);
      fetchLocations();
    }
    
    return () => {
      // Clear mounted flag on unmount
      isMountedRef.current = false;
    };
  }, []);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const locationsData = await getLocations();
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  // Filter images by location
  useEffect(() => {
    if (selectedLocation) {
      const filtered = images.filter(img => {
        // Kiểm tra nếu location của ảnh tồn tại và chứa selectedLocation
        return img.location && 
               (img.location.toLowerCase() === selectedLocation.toLowerCase() ||
                img.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      });
      setFilteredImages(filtered);
    } else {
      // Nếu không có location được chọn, hiển thị tất cả ảnh
      setFilteredImages(images);
    }
  }, [selectedLocation, images]);

  const clearLocationFilter = () => {
    setSelectedLocation(null);
    setFilteredImages(images);
  };

  // Use useFocusEffect to refresh data only when needed
  useFocusEffect(
    useCallback(() => {
      // Check if data is stale and needs refreshing
      const currentTime = Date.now();
      const isDataStale = currentTime - lastUpdateTime > CACHE_EXPIRATION_TIME;
      
      if (!dataLoadedRef.current || isDataStale) {
        // Only fetch if data hasn't been loaded or is stale
        fetchImages(false);
      }
    }, [lastUpdateTime])
  );
  
  // Lắng nghe thay đổi từ ImageUpdateContext
  // Khi có ảnh mới được thêm vào từ trang captioning, lastImageUpdate sẽ thay đổi
  useEffect(() => {
    if (lastImageUpdate > 0) {
      console.log('ImageUpdateContext changed, lastImageUpdate:', lastImageUpdate);
      // Tải lại dữ liệu khi có ảnh mới được thêm vào
      setCurrentPage(1); // Reset về trang đầu tiên
      fetchImages(false, 1);
    }
  }, [lastImageUpdate]);

  const fetchImages = async (isInitialLoad: boolean, page = 1) => {
    try {
      if (isInitialLoad || !dataLoadedRef.current) {
        setLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      }
      
      const response = await imageService.getUserImages(page, perPage);
      
      const processedImages = (response.images || []).map((img: any) => {
        const imageUrl = img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))
          ? img.url
          : imageService.getImageUrl(img.id);

        return {
          ...img,
          url: imageUrl,
          caption: img.description, // Sử dụng description làm caption
        };
      });
      
      if (isMountedRef.current) {
        if (page > 1) {
          setImages(prevImages => [...prevImages, ...processedImages]);
          setFilteredImages(prevFilteredImages => {
            if (searchQuery.trim()) {
              const newFilteredImages = processedImages.filter((img: ImageItem) => 
                img.description?.toLowerCase().includes(searchQuery.toLowerCase())
              );
              return [...prevFilteredImages, ...newFilteredImages];
            }
            return [...prevFilteredImages, ...processedImages];
          });
        } else {
          setImages(processedImages);
          setFilteredImages(processedImages);
        }
        
        setCurrentPage(page);
        setTotalPages(Math.ceil(response.total / perPage) || 1);
        dataLoadedRef.current = true;
        setLastUpdateTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to fetch user images:', error);
      Alert.alert('Error', 'Failed to load your images. Please try again later.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };
  
  // Load more images when reaching the end of the list
  const loadMoreImages = () => {
    if (loadingMore || currentPage >= totalPages) return;
    fetchImages(false, currentPage + 1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1); // Reset to first page when refreshing
    await fetchImages(false, 1);
    setRefreshing(false);
  };

  // Hàm tìm kiếm ảnh theo caption
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // Nếu không có từ khóa tìm kiếm, hiển thị tất cả ảnh
      setFilteredImages(images);
      return;
    }
    
    // Lọc ảnh theo caption
    const filtered = images.filter((img: ImageItem) => 
      img.description?.toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredImages(filtered);
    // Reset pagination when searching
    setCurrentPage(1);
  };
  
  // Xóa tìm kiếm
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredImages(images);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  const renderImage = ({ item, index }: { item: ImageItem, index: number }) => {
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={800} 
        delay={index * 50} // Thêm delay để tạo hiệu ứng staggered
        style={styles.imageCardContainer}
      >
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
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <View style={styles.dateOverlay}>
              <Text style={styles.dateOverlayText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.captionContainer}>
            <Text style={styles.caption} numberOfLines={2}>
              {item.description || 'Chưa có mô tả'}
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
  
  // Xử lý xóa hình ảnh
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Xử lý tải xuống hình ảnh
  const handleDownloadImage = async (image: ImageItem) => {
    if (!image || !image.url) {
      Alert.alert('Lỗi', 'Không thể tải xuống hình ảnh này');
      return;
    }

    try {
      // Hiển thị loading
      setDownloadLoading(true);
      console.log('Bắt đầu tải xuống ảnh:', image.id);
      
      // Yêu cầu quyền truy cập vào thư viện ảnh
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập vào thư viện ảnh để lưu hình ảnh');
        return;
      }
      
      // Tạo tên file dựa trên id hoặc tên file gốc
      const fileName = image.file_name || `image_${image.id}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      console.log('Đang tải ảnh từ URL:', image.url);
      console.log('Lưu vào đường dẫn:', fileUri);
      
      // Đảm bảo URL hợp lệ
      let downloadUrl = image.url;
      if (!downloadUrl.startsWith('http')) {
        // Nếu là đường dẫn tương đối, chuyển thành đường dẫn tuyệt đối
        downloadUrl = imageService.getImageUrl(image.id);
        console.log('Đã chuyển đổi URL thành:', downloadUrl);
      }
      
      // Tải ảnh từ URL
      const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
      console.log('Kết quả tải xuống:', downloadResult);
      
      if (downloadResult.status === 200) {
        // Lưu vào thư viện ảnh
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        
        // Tạo album nếu chưa tồn tại (Android sẽ bỏ qua nếu album đã tồn tại)
        try {
          await MediaLibrary.createAlbumAsync('Captioning App', asset, false);
        } catch (albumError) {
          console.log('Lưu ý khi tạo album:', albumError);
          // Vẫn tiếp tục vì ảnh đã được lưu vào thư viện
        }
        
        Alert.alert(
          'Thành công', 
          'Đã lưu hình ảnh vào thư viện ảnh', 
          [
            { 
              text: 'OK', 
              onPress: () => console.log('Đã lưu ảnh thành công') 
            },
            Platform.OS === 'ios' ? {
              text: 'Chia sẻ',
              onPress: () => Share.share({
                url: downloadResult.uri,
                message: `Ảnh từ Captioning App: ${image.description || ''}`,
              })
            } : undefined,
          ].filter(Boolean) as any
        );
      } else {
        throw new Error(`Tải xuống không thành công, mã trạng thái: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Lỗi khi tải xuống ảnh:', error);
      Alert.alert('Lỗi', 'Không thể tải xuống hình ảnh. Vui lòng thử lại sau.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!imageId) return;
    
    try {
      setDeleteLoading(true);
      console.log('Deleting image with ID:', imageId);
      
      // Gọi API xóa ảnh từ Environment.ts
      const response = await imageService.deleteImage(imageId);
      console.log('Delete image response:', response);
      
      // Đóng modal
      setModalVisible(false);
      
      // Cập nhật danh sách ảnh sau khi xóa
      setImages(images.filter(img => img.id !== imageId));
      setFilteredImages(filteredImages.filter(img => img.id !== imageId));
      
      // Thông báo thành công
      Alert.alert('Thành công', 'Đã xóa hình ảnh thành công');
      
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Lỗi', 'Không thể xóa hình ảnh. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
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
            <TouchableWithoutFeedback onPress={(e) => {
              e.stopPropagation();
              if (isEditing) {
                Keyboard.dismiss();
              }
            }}>
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
                        placeholder="Nhập mô tả mới..."
                        multiline
                        autoFocus
                        onBlur={Keyboard.dismiss}
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelEditButton]}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.cancelButtonText}>Hủy</Text>
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
                            <Text style={styles.editButtonText}>Lưu</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                ) : (
                  <View style={styles.modalCaptionContainer}>
                    <View style={styles.captionHeader}>
                      <Text style={styles.captionTitle}>Mô tả</Text>
                      <TouchableOpacity 
                        style={styles.editIconButton}
                        onPress={startEditing}
                      >
                        <Feather name="edit-2" size={18} color={AppTheme.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalCaption}>
                      {selectedImage.description || 'Chưa có mô tả'}
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
                      {selectedImage.location ? (
                        <View style={styles.infoRow}>
                            <Feather name="map-pin" size={16} color={AppTheme.textLight} />
                            <Text style={styles.infoText}>
                                {selectedImage.location}
                            </Text>
                        </View>
                      ) : (
                        <View style={styles.infoRow}>
                            <Feather name="map-pin" size={16} color={AppTheme.textLight} />
                            <Text style={styles.infoText}>
                                Không rõ
                            </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDownloadImage(selectedImage)}
                        disabled={downloadLoading}
                      >
                        <LinearGradient
                          colors={AppTheme.primaryGradient as any}
                          style={styles.actionButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          {downloadLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Feather name="download" size={18} color="#fff" />
                              <Text style={styles.actionButtonText}>Tải xuống</Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {
                          Alert.alert(
                            'Xác nhận xóa',
                            'Bạn có chắc chắn muốn xóa hình ảnh này không?',
                            [
                              { text: 'Hủy', style: 'cancel' },
                              { 
                                text: 'Xóa', 
                                style: 'destructive',
                                onPress: () => handleDeleteImage(selectedImage.id)
                              }
                            ]
                          );
                        }}
                      >
                        <LinearGradient
                          colors={['#FF416C', '#FF4B2B']}
                          style={styles.actionButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Feather name="trash-2" size={18} color="#fff" />
                          <Text style={styles.actionButtonText}>Xóa</Text>
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
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={AppTheme.primary} />
            <Text style={styles.loadingText}>Đang tải hình ảnh...</Text>
          </View>
        </Animatable.View>
      );
    }

    return (
      <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite" duration={2000} style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="image-multiple-outline" size={100} color={AppTheme.primary} />
        </Animatable.View>
        <Animatable.Text animation="fadeInUp" delay={300} style={styles.emptyText}>Chưa có ảnh nào</Animatable.Text>
        <Animatable.Text animation="fadeInUp" delay={500} style={styles.emptySubtext}>Bắt đầu bằng cách tải lên ảnh đầu tiên</Animatable.Text>
        <Animatable.View animation="fadeInUp" delay={700}>
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
      </Animatable.View>
    );
  };

  const renderHeader = () => {
    return (
      <LinearGradient
        colors={['#f8f9fa', '#ffffff']}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={AppTheme.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mô tả..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={AppTheme.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.filterContainer}>
          {!selectedLocation ? (
            <LocationFilter
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />
          ) : (
            <Animatable.View animation="fadeIn" duration={300}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={clearLocationFilter}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#4A00E0', '#8E2DE2']}
                  style={styles.filterButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.filterButtonText}>Bỏ lọc</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          )}
          <TouchableOpacity
            style={styles.groupButton}
            onPress={() => setGroupCaptionModalVisible(true)}
          >
            <Ionicons name="images" size={24} color="#4A00E0" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <FlatList
        data={filteredImages}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.imageGrid}
        onEndReached={loadMoreImages}
        onEndReachedThreshold={0.5}
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
      {renderImageDetailModal()}
      <Modal
        visible={groupCaptionModalVisible}
        animationType="slide"
        onRequestClose={() => setGroupCaptionModalVisible(false)}
      >
        <GroupCaptionView
          images={images}
          onClose={() => setGroupCaptionModalVisible(false)}
        />
      </Modal>
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
    height: '100%',
    paddingVertical: 50,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: AppTheme.text,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  groupButton: {
    padding: 8,
    backgroundColor: 'rgba(74,0,224,0.1)',
    borderRadius: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  imageCardContainer: {
    width: (width - 40) / 2,
    margin: 5,
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
    height: 140,
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
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
    height: 60,
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
    height: 80, // Cố định chiều cao để đồng nhất các card
  },
  caption: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 5,
    minHeight: 40,
  },
  dateText: {
    fontSize: 12,
    color: AppTheme.textLighter,
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dateOverlayText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyIconContainer: {
    marginBottom: 30,
    opacity: 0.8,
    backgroundColor: 'rgba(74,0,224,0.1)',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppTheme.text,
    marginBottom: 10,
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 10,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 14,
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
  loadMoreContainer: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: AppTheme.textLight,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 15,
    marginHorizontal: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(74,0,224,0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadMoreButtonText: {
    color: AppTheme.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  endOfListText: {
    textAlign: 'center',
    color: AppTheme.textLight,
    fontSize: 14,
    marginVertical: 20,
    fontStyle: 'italic',
  },
  header: {
    padding: 16,
    backgroundColor: AppTheme.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  imageGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  clearFilterButton: {
    marginLeft: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clearFilterGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  filterButtonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HistoryScreen;
