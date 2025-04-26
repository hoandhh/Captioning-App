import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.full_name || user?.username || 'User'}!</Text>
        <Text style={styles.subtitle}>Welcome to Image Captioning App</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="camera" size={80} color="#2E86C1" />
          <Text style={styles.welcomeTitle}>Image Captioning App</Text>
          <Text style={styles.welcomeText}>
            Transform your images into words with our AI-powered captioning tool.
            Upload images, generate captions, and manage your collection.
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="camera-outline" size={24} color="#2E86C1" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Smart Image Captioning</Text>
              <Text style={styles.featureDescription}>AI-generated descriptions for your images</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="refresh-outline" size={24} color="#2E86C1" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Caption Regeneration</Text>
              <Text style={styles.featureDescription}>Not satisfied? Generate a new caption</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cloud-upload-outline" size={24} color="#2E86C1" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Cloud Storage</Text>
              <Text style={styles.featureDescription}>Access your images from anywhere</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  // Welcome section styles
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Features section styles
  featuresContainer: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
