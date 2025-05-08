import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { createGroupCaption } from '../services/groupCaptionService';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [groupCaption, setGroupCaption] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error('Lỗi khi tạo mô tả nhóm:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A00E0', '#8E2DE2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo mô tả nhóm</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Animatable.Text animation="fadeIn" style={styles.instruction}>
          Chọn tối đa 4 hình ảnh để tạo mô tả nhóm
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
              <Text style={styles.captionHeaderText}>Mô tả nhóm</Text>
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
                  <Text style={styles.createButtonText}>Tạo mô tả nhóm</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
});