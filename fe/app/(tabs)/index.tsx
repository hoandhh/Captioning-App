import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86C1" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#2E86C1', '#3498DB', '#5DADE2']}
        style={styles.header}
      >
        <Animatable.View animation="fadeIn" duration={1000}>
          <Text style={styles.greeting}>Hello, {user?.full_name || user?.username || 'User'}!</Text>
          <Text style={styles.subtitle}>Welcome to Image Captioning App</Text>
        </Animatable.View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={300}
          style={styles.welcomeContainer}
        >
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            duration={2000}
          >
            <Ionicons name="camera" size={80} color="#2E86C1" />
          </Animatable.View>
          <Text style={styles.welcomeTitle}>Image Captioning App</Text>
          <Text style={styles.welcomeText}>
            Transform your images into words with our AI-powered captioning tool.
            Upload images, generate captions, and manage your collection.
          </Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={600}
          style={styles.featuresContainer}
        >
          <Text style={styles.featuresTitle}>Key Features</Text>
          
          <Animatable.View 
            animation="fadeInLeft" 
            duration={800} 
            delay={900}
            style={styles.featureItem}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Smart Image Captioning</Text>
              <Text style={styles.featureDescription}>AI-generated descriptions for your images</Text>
            </View>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInLeft" 
            duration={800} 
            delay={1100}
            style={styles.featureItem}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="refresh-outline" size={24} color="#fff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Caption Regeneration</Text>
              <Text style={styles.featureDescription}>Not satisfied? Generate a new caption</Text>
            </View>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInLeft" 
            duration={800} 
            delay={1300}
            style={styles.featureItem}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Cloud Storage</Text>
              <Text style={styles.featureDescription}>Access your images from anywhere</Text>
            </View>
          </Animatable.View>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={1500}
          style={styles.getStartedContainer}
        >
          <TouchableOpacity style={styles.getStartedButton}>
            <LinearGradient
              colors={['#2E86C1', '#3498DB']}
              style={styles.gradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  // Welcome section styles
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#2E86C1',
  },
  welcomeText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Features section styles
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E86C1',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E86C1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featureTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    lineHeight: 20,
  },
  // Get Started button
  getStartedContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    width: width * 0.8,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default HomeScreen;
