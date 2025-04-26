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
  
  const renderImageDetailModal = () => {
    if (!selectedImage) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <Animatable.View animation="fadeIn" duration={300}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={34} color="#fff" />
            </TouchableOpacity>
          </Animatable.View>
          
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
                <Text style={styles.modalCaptionTitle}>Image Caption</Text>
              </View>
              
              <Text style={styles.modalCaption}>
                "{selectedImage.description || 'No caption available'}"
              </Text>
              
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
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalActionButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: '/(tabs)/captioning',
                      params: { imageId: selectedImage.id }
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#3498DB', '#2874A6']}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="create" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit Caption</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalActionButton}
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
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E74C3C', '#C0392B']}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </BlurView>
      </Modal>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1A5276" />
          <Text style={styles.emptyText}>Loading images...</Text>
        </Animatable.View>
      );
    }

    return (
      <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="image-multiple-outline" size={90} color="#1A5276" />
        </View>
        <Text style={styles.emptyText}>No images available</Text>
        <Text style={styles.emptySubtext}>Start by uploading your first image</Text>
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
            <Text style={styles.uploadButtonText}>Upload Image</Text>
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
            <Text style={styles.sectionTitle}>My Images</Text>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '85%',
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
    marginTop: 25,
  },
  modalActionButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginHorizontal: 5,
  },
  modalButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
  },
});

export default HistoryScreen;