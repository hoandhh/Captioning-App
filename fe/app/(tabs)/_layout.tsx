import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

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
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2E86C1',
  },
});

export default function TabLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E86C1',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2E86C1',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#fff',
        },
        headerTintColor: '#fff',
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
              <Ionicons name="home" size={22} color="#fff" />
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
          title: 'Image Captioning',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="image" size={22} color="#fff" />
              <Text style={styles.headerTitleText}>Image Captioning</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "image" : "image-outline"} size={size} color={color} />
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
              <Ionicons name="images" size={22} color="#fff" />
              <Text style={styles.headerTitleText}>My Images</Text>
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
                <Ionicons name="settings" size={22} color="#fff" />
                <Text style={styles.headerTitleText}>Admin Panel</Text>
              </View>
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
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
              <Ionicons name="person" size={22} color="#fff" />
              <Text style={styles.headerTitleText}>Profile</Text>
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
