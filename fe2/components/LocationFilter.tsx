import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (locationId: string) => {
    onSelectLocation(locationId === selectedLocation ? null : locationId);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="filter" size={24} color="#007AFF" />
        {selectedLocation && (
          <View style={styles.selectedIndicator} />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo địa điểm</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    item.id === selectedLocation && styles.selectedLocation
                  ]}
                  onPress={() => handleSelectLocation(item.id)}
                >
                  <Text style={[
                    styles.locationText,
                    item.id === selectedLocation && styles.selectedLocationText
                  ]}>
                    {item.name}
                  </Text>
                  {item.id === selectedLocation && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  filterButton: {
    padding: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLocation: {
    backgroundColor: '#f0f8ff',
  },
  locationText: {
    fontSize: 16,
  },
  selectedLocationText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
}); 