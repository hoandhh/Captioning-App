import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 0, // Set to 0 to remove the dot indicator
    height: 0, // Set to 0 to remove the dot indicator
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A5276',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarShowLabel: true,
        headerStyle: {
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          borderBottomWidth: 0,
          height: Platform.OS === 'ios' ? 100 : 80,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#fff',
          letterSpacing: 0.5,
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#1A5276', '#2980B9']}
            style={[styles.headerGradient, { paddingTop: insets.top }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
        headerTintColor: '#fff',
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="home" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>Home</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="captioning"
        options={{
          title: 'Caption',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <MaterialCommunityIcons name="image-text" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>Image Captioning</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <MaterialCommunityIcons name={focused ? "image-text" : "image-outline"} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>My History</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "images" : "images-outline"} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />

      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            headerTitle: () => (
              <View style={styles.headerTitleContainer}>
                <Ionicons name="shield" size={24} color="#fff" />
                <Text style={styles.headerTitleText}>Admin Panel</Text>
              </View>
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name={focused ? "shield" : "shield-outline"} size={size} color={color} />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
      )}
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>My Profile</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
