import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { imageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { getImageUrl } from '../../constants/Environment';

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
      <TouchableOpacity
        style={styles.imageCard}
        onPress={() => {
          setSelectedImage(item);
          setModalVisible(true);
        }}
      >
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
        <View style={styles.captionContainer}>
          <Text style={styles.caption} numberOfLines={2}>
            {item.description || 'No caption available'}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
        <BlurView intensity={80} style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={30} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedImage.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            
            <View style={styles.modalCaptionContainer}>
              <Text style={styles.modalCaptionTitle}>Caption:</Text>
              <Text style={styles.modalCaption}>
                {selectedImage.description || 'No caption available'}
              </Text>
              
              {selectedImage.file_name && (
                <Text style={styles.modalFileName}>
                  File: {selectedImage.file_name}
                </Text>
              )}
              
              <Text style={styles.modalDate}>
                Uploaded on: {new Date(selectedImage.created_at).toLocaleString()}
              </Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: '/(tabs)/captioning',
                      params: { imageId: selectedImage.id }
                    });
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit Caption</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Image',
                      'Are you sure you want to delete this image?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await imageService.deleteImage(selectedImage.id);
                              setModalVisible(false);
                              fetchImages();
                              Alert.alert('Success', 'Image deleted successfully');
                            } catch (error) {
                              console.error('Failed to delete image:', error);
                              Alert.alert('Error', 'Failed to delete image');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2E86C1" />
          <Text style={styles.emptyText}>Loading images...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No images available</Text>
        <Text style={styles.emptySubtext}>Be the first to upload an image!</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push('/(tabs)/captioning')}
        >
          <Text style={styles.uploadButtonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.full_name || user?.username || 'User'}!</Text>
        <Text style={styles.subtitle}>My Images & Captions</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Image History</Text>
          <TouchableOpacity 
            style={styles.uploadNewButton}
            onPress={() => router.push('/(tabs)/captioning')}
          >
            <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
            <Text style={styles.uploadNewText}>Upload New</Text>
          </TouchableOpacity>
        </View>

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
              colors={['#2E86C1']}
            />
          }
        />
      </View>
      
      {renderImageDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#2E86C1',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  uploadNewButton: {
    backgroundColor: '#2E86C1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uploadNewText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
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
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    padding: 10,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
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
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#2E86C1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  modalCaptionContainer: {
    padding: 20,
  },
  modalCaptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalCaption: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  modalFileName: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
    marginTop: 20,
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
  deleteButton: {
    backgroundColor: '#E74C3C',
    marginRight: 0,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default HistoryScreen;