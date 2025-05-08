import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { createGroupCaption } from '../services/groupCaptionService';
import { Ionicons } from '@expo/vector-icons';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo mô tả nhóm</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.imageGrid, getGridLayout()]}>
          {images.map((image) => (
            <TouchableOpacity
              key={image.id}
              onPress={() => toggleImageSelection(image.id)}
              style={[
                styles.imageContainer,
                selectedImages.includes(image.id) && styles.selectedImage
              ]}
            >
              <Image source={{ uri: image.url }} style={styles.image} />
              {selectedImages.includes(image.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedImages.length >= 2 && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroupCaption}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Đang tạo...' : 'Tạo mô tả nhóm'}
            </Text>
          </TouchableOpacity>
        )}

        {groupCaption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{groupCaption}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
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
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captionContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    margin: 16,
    borderRadius: 8,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 