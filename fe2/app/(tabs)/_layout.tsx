import React from 'react';
import { ImageUpdateProvider } from '../../context/ImageUpdateContext';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Bảng màu mới cho toàn bộ ứng dụng
const AppTheme = {
  primary: '#4A00E0',
  primaryGradient: ['#4A00E0', '#8E2DE2', '#6A82FB'],
  secondary: '#00C9FF',
  secondaryGradient: ['#00C9FF', '#92FE9D'],
  accent: '#9B59B6',
  success: '#2ECC71',
  warning: '#F39C12',
  info: '#4A90E2',
  background: '#f8f9fa',
  card: 'rgba(255, 255, 255, 0.95)',
  text: '#333',
  textLight: '#666',
  textLighter: '#888',
};

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
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBar: {
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
  headerStyle: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderBottomWidth: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  return (
    <ImageUpdateProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.primary,
        tabBarInactiveTintColor: AppTheme.textLighter,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        headerStyle: styles.headerStyle,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#fff',
          letterSpacing: 0.5,
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#4A00E0', '#8E2DE2', '#6A82FB'] as any}
            style={[styles.headerGradient, { paddingTop: insets.top }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ),
        headerTintColor: '#fff',
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarAllowFontScaling: false,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="home" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>Trang chủ</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="captioning"
        options={{
          title: 'Mô tả',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <MaterialCommunityIcons name="image-text" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>Mô tả hình ảnh</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <MaterialCommunityIcons name={focused ? "image-text" : "image-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'Lịch sử',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>Lịch sử của tôi</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "images" : "images-outline"} size={size} color={color} />
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
                <Text style={styles.headerTitleText}>Quản trị</Text>
              </View>
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name={focused ? "shield" : "shield-outline"} size={size} color={color} />
              </View>
            ),
          }}
        />
      )}
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.headerTitleText}>Thông tin cá nhân</Text>
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
    </ImageUpdateProvider>
  );
}
