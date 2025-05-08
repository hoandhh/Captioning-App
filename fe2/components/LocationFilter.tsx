import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Location {
  id: string;
  name: string;
}

interface LocationFilterProps {
  locations: Location[];
  selectedLocation: string | null;
  onSelectLocation: (locationId: string | null) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý khi không có dữ liệu
  const hasLocations = locations && locations.length > 0;

  // Lọc địa điểm theo từ khóa tìm kiếm
  const filteredLocations = hasLocations
    ? locations.filter(location => location.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelectLocation = (locationName: string) => {
    // Sử dụng tên địa điểm thay vì ID để lọc
    onSelectLocation(locationName === selectedLocation ? null : locationName);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#4A00E0', '#8E2DE2']}
          style={styles.filterButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="filter" size={18} color="#fff" />
        </LinearGradient>
        {selectedLocation && (
          <View style={styles.selectedIndicator} />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <Animatable.View
            animation="slideInUp"
            duration={300}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo địa điểm</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <LinearGradient
                  colors={['#4A00E0', '#8E2DE2']}
                  style={styles.closeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A00E0" />
                <Text style={styles.loadingText}>Đang tải địa điểm...</Text>
              </View>
            ) : !hasLocations ? (
              <View style={styles.emptyContainer}>
                <Feather name="map-pin" size={50} color="#4A00E0" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>Không có địa điểm nào</Text>
              </View>
            ) : (
              <FlatList
                data={filteredLocations}
                keyExtractor={(item, index) => `${item.id || item.name}-${index}`}
                renderItem={({ item }) => (
                  <Animatable.View animation="fadeIn" duration={300}>
                    <TouchableOpacity
                      style={[
                        styles.locationItem,
                        item.name === selectedLocation && styles.selectedLocation
                      ]}
                      onPress={() => handleSelectLocation(item.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.locationText,
                        item.name === selectedLocation && styles.selectedLocationText
                      ]}>
                        {item.name}
                      </Text>
                      {item.name === selectedLocation && (
                        <LinearGradient
                          colors={['#4A00E0', '#8E2DE2']}
                          style={styles.checkmarkContainer}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </Animatable.View>
                )}
                ListEmptyComponent={searchQuery.length > 0 ? (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>Không tìm thấy địa điểm phù hợp</Text>
                  </View>
                ) : null}
              />
            )}
          </Animatable.View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  filterButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  filterButtonGradient: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    padding: 8,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedLocation: {
    backgroundColor: 'rgba(74, 0, 224, 0.05)',
    borderBottomWidth: 0,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationText: {
    color: '#4A00E0',
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 15,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});