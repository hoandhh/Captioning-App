import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar, ImageBackground, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleExplore = () => {
    router.push('/intro');
  };

  const handleHome = () => {
    router.push('/home' as any);
  };

  // Use app icon as logo
  const logoImage = require('../assets/images/icon.png');

  // Animation references
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Features list with enhanced icons and descriptions
  const features = [
    {
      icon: 'camera',
      iconType: 'font-awesome5',
      title: 'Mô tả hình ảnh thông minh',
      description: 'Chuyển đổi ảnh thành văn bản mô tả chi tiết bằng AI tiên tiến',
      color: '#4A90E2'
    },
    {
      icon: 'headphones',
      iconType: 'feather',
      title: 'Hỗ trợ text-to-speech',
      description: 'Nghe mô tả ảnh của bạn bằng giọng nói tự nhiên với nhiều tùy chọn',
      color: '#9B59B6'
    },
    {
      icon: 'folder-open',
      iconType: 'font-awesome5',
      title: 'Lưu trữ và quản lý',
      description: 'Dễ dàng lưu trữ, phân loại và tìm kiếm ảnh đã mô tả với giao diện trực quan',
      color: '#F39C12'
    },
    {
      icon: 'share-2',
      iconType: 'feather',
      title: 'Chia sẻ nhanh chóng',
      description: 'Chia sẻ ảnh và mô tả đến mạng xã hội và bạn bè chỉ với một chạm',
      color: '#2ECC71'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent />
      
      <ImageBackground
        source={require('../assets/images/splash-icon.png')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.08 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <LinearGradient
            colors={['#4A00E0', '#8E2DE2', '#6A82FB']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Animated decorative elements */}
            <View style={[styles.decorCircle, { top: height * 0.05, left: width * 0.1 }]} />
            <View style={[styles.decorCircle, { top: height * 0.12, right: width * 0.15, width: 25, height: 25 }]} />
            <View style={[styles.decorCircle, { bottom: height * 0.02, left: width * 0.2, width: 15, height: 15 }]} />
            
            <Animatable.View animation="zoomIn" duration={1200} style={styles.logoContainer}>
              <View style={styles.logoBlur}>
                <Image source={logoImage} style={styles.logo} />
              </View>
              <Animatable.Text animation="fadeInUp" delay={300} style={styles.appName}>
                Ứng dụng Mô tả Hình ảnh AI
              </Animatable.Text>
              <Animatable.Text animation="fadeInUp" delay={500} style={styles.tagline}>
                Biến đổi ảnh thành lời thông qua trí tuệ nhân tạo
              </Animatable.Text>
            </Animatable.View>
          </LinearGradient>
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 25,
              marginTop: 10,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            }}>
              <Text style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
              }}>Chào mừng bạn đến với</Text>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#4A00E0',
                textAlign: 'center',
                marginVertical: 8,
              }}>AI Image Captioning</Text>
              <Text style={{
                fontSize: 15,
                color: '#555',
                textAlign: 'center',
                lineHeight: 22,
              }}>
                Ứng dụng hiện đại giúp bạn mô tả hình ảnh bằng công nghệ AI tiên tiến
              </Text>
            </View>
          </Animated.View>

        <Animatable.View animation="fadeInUp" delay={700} style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>

          {features.map((feature, index) => (
            <Animatable.View 
              key={index} 
              animation="fadeInLeft" 
              delay={800 + (index * 200)} 
              style={[styles.featureItem, { borderLeftWidth: 3, borderLeftColor: feature.color }]}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                {feature.iconType === 'font-awesome5' && (
                  <FontAwesome5 name={feature.icon as any} size={24} color="#fff" />
                )}
                {feature.iconType === 'feather' && (
                  <Feather name={feature.icon as any} size={24} color="#fff" />
                )}
                {feature.iconType === 'ionicons' && (
                  <Ionicons name={feature.icon as any} size={24} color="#fff" />
                )}
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: feature.color }]}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Animatable.View>
          ))}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={1500} style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#4A00E0', '#8E2DE2']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-in-outline" size={22} color="#fff" />
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#00C9FF', '#92FE9D']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="person-add-outline" size={22} color="#fff" />
              <Text style={styles.buttonText}>Đăng ký</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 5,
              marginTop: 10,
              borderRadius: 20,
              overflow: 'hidden',
            }} 
            onPress={handleHome}
            activeOpacity={0.6}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.8)',
            }}>
              <Text style={{
                color: '#4A00E0',
                fontSize: 16,
                fontWeight: '600',
              }}>Vào trang chính</Text>
              <Feather name="arrow-right" size={18} color="#4A00E0" style={{marginLeft: 8}} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 5,
              marginTop: 10,
              borderRadius: 20,
              overflow: 'hidden',
            }} 
            onPress={handleExplore}
            activeOpacity={0.6}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.8)',
            }}>
              <Text style={{
                color: '#4A00E0',
                fontSize: 16,
                fontWeight: '600',
              }}>Khám phá ứng dụng</Text>
              <Feather name="arrow-right" size={18} color="#4A00E0" style={{marginLeft: 8}} />
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={1800} style={{
          marginTop: 20,
          width: '100%',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <LinearGradient
            colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)']}
            style={{
              paddingVertical: 20,
              paddingHorizontal: 15,
              alignItems: 'center',
              borderRadius: 16,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 15,
            }}>
              <TouchableOpacity style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}>
                <FontAwesome5 name="facebook" size={18} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}>
                <FontAwesome5 name="twitter" size={18} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}>
                <FontAwesome5 name="instagram" size={18} color="#E1306C" />
              </TouchableOpacity>
            </View>
            <Text style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
            }}>© 2025 AI Image Captioning</Text>
            <Text style={{
              fontSize: 12,
              color: '#888',
              marginTop: 5,
              textAlign: 'center',
            }}>Phiên bản 1.0.0</Text>
          </LinearGradient>
        </Animatable.View>
      </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A00E0',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  header: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 30,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  decorCircle: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  logoBlur: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 30,
  },
  featuresContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A00E0',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A00E0',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionContainer: {
    marginVertical: 25,
    alignItems: 'center',
  },
  loginButton: {
    width: width * 0.8,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 15,
  },
  registerButton: {
    width: width * 0.8,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 20,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
