import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
  ImageBackground,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();

  const navigateToCaptioning = () => {
    router.push('/(tabs)/captioning');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent />
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <ImageBackground
        source={require('../../assets/images/background.jpg')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.15 }}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#4A00E0', '#8E2DE2', '#6A82FB']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animatable.View animation="fadeIn" duration={1000} style={styles.headerContent}>
              <Animatable.Text animation="fadeInDown" duration={1000} style={styles.welcomeText}>
                Xin chào, {user?.full_name || user?.username || 'Người dùng'}!
              </Animatable.Text>
              <Animatable.View animation="fadeInUp" duration={1200} style={styles.headerIcons}>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={3000}>
                  <MaterialCommunityIcons name="image-multiple" size={24} color="#fff" />
                </Animatable.View>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} delay={300}>
                  <FontAwesome5 name="brain" size={24} color="#fff" />
                </Animatable.View>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} delay={600}>
                  <MaterialCommunityIcons name="text-recognition" size={24} color="#fff" />
                </Animatable.View>
              </Animatable.View>
            </Animatable.View>
          </LinearGradient>
          <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            delay={300}
            style={styles.heroContainer}
          >
            <Animatable.View 
              animation="pulse" 
              iterationCount="infinite" 
              duration={2500}
              style={styles.iconWrapper}
            >
              <MaterialCommunityIcons name="image-text" size={90} color="#4A00E0" />
            </Animatable.View>
            <Text style={styles.heroTitle}>Mô tả hình ảnh bằng trí tuệ nhân tạo</Text>
            <Text style={styles.heroText}>
              Chuyển đổi hình ảnh của bạn thành văn bản mô tả với công nghệ trí tuệ nhân tạo tiên tiến.
              Hoàn hảo cho việc tiếp cận, tạo nội dung và tổ chức hình ảnh.
            </Text>
            
            <TouchableOpacity 
              style={styles.captioningButton}
              onPress={navigateToCaptioning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.buttonText}>Bắt đầu mô tả</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            delay={600}
            style={styles.featuresContainer}
          >
            <Text style={styles.featuresTitle}>Tính năng chính</Text>
            
            <Animatable.View 
              animation="fadeInLeft" 
              duration={800} 
              delay={900}
              style={styles.featureItem}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#4A00E0' }]}>
                <FontAwesome5 name="brain" size={22} color="#fff" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Mô tả AI thông minh</Text>
                <Text style={styles.featureDescription}>Mô tả chính xác được tạo bởi các mô hình AI tiên tiến</Text>
              </View>
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInLeft" 
              duration={800} 
              delay={1100}
              style={styles.featureItem}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#8E2DE2' }]}>
                <Ionicons name="refresh" size={24} color="#fff" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Tạo lại mô tả</Text>
                <Text style={styles.featureDescription}>Không hài lòng? Tạo lại mô tả chỉ với một cú chạm</Text>
              </View>
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInLeft" 
              duration={800} 
              delay={1300}
              style={styles.featureItem}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#6A82FB' }]}>
                <Ionicons name="cloud-done" size={24} color="#fff" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Lưu trữ đám mây</Text>
                <Text style={styles.featureDescription}>Truy cập hình ảnh đã mô tả từ bất kỳ đâu, bất kỳ lúc nào</Text>
              </View>
            </Animatable.View>

            <Animatable.View 
              animation="fadeInLeft" 
              duration={800} 
              delay={1500}
              style={styles.featureItem}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#00C9FF' }]}>
                <Ionicons name="share-social" size={24} color="#fff" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Chia sẻ dễ dàng</Text>
                <Text style={styles.featureDescription}>Chia sẻ hình ảnh đã mô tả với bạn bè và mạng xã hội</Text>
              </View>
            </Animatable.View>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            delay={1700}
            style={styles.getStartedContainer}
          >
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={navigateToCaptioning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.getStartedText}>Bắt đầu ngay</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            delay={900}
            style={styles.animationContainer}
          >
            <Text style={styles.animationTitle}>Quy trình xử lý</Text>
            
            <View style={styles.processFlow}>
              <Animatable.View 
                animation="bounceIn" 
                duration={1500} 
                delay={1100} 
                style={styles.processStep}
              >
                <LinearGradient
                  colors={['#4A00E0', '#8E2DE2']}
                  style={styles.processIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="cloud-upload" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.processText}>Tải lên</Text>
              </Animatable.View>
              
              <Animatable.View 
                animation="fadeIn" 
                duration={800} 
                delay={1300} 
                style={styles.processArrow}
              >
                <MaterialCommunityIcons name="arrow-right" size={24} color="#6A82FB" />
              </Animatable.View>
              
              <Animatable.View 
                animation="bounceIn" 
                duration={1500} 
                delay={1500} 
                style={styles.processStep}
              >
                <LinearGradient
                  colors={['#00C9FF', '#92FE9D']}
                  style={styles.processIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome5 name="brain" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.processText}>Phân tích</Text>
              </Animatable.View>
              
              <Animatable.View 
                animation="fadeIn" 
                duration={800} 
                delay={1700} 
                style={styles.processArrow}
              >
                <MaterialCommunityIcons name="arrow-right" size={24} color="#6A82FB" />
              </Animatable.View>
              
              <Animatable.View 
                animation="bounceIn" 
                duration={1500} 
                delay={1900} 
                style={styles.processStep}
              >
                <LinearGradient
                  colors={['#FF416C', '#FF4B2B']}
                  style={styles.processIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="text-box" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.processText}>Kết quả</Text>
              </Animatable.View>
            </View>
            
            <Animatable.View 
              animation="fadeIn" 
              duration={1000} 
              delay={2100} 
              style={styles.animationNote}
            >
              <Text style={styles.noteText}>Công nghệ AI tiên tiến giúp tạo ra mô tả chi tiết và chính xác</Text>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A00E0',
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginTop: 5,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#4A00E0',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 5,
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  // Hero section styles
  heroContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(46, 134, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#1A5276',
    textAlign: 'center',
  },
  heroText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  captioningButton: {
    width: width * 0.8,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#1A5276',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginTop: 10,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Features section styles
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1A5276',
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86C1',
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#2E86C1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
    elevation: 6,
    shadowColor: '#1A5276',
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
  // Animation container styles
  animationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  animationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A5276',
    textAlign: 'center',
    marginBottom: 25,
  },
  processFlow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 15,
  },
  processStep: {
    alignItems: 'center',
    width: 80,
  },
  processIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 10,
  },
  processText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  processArrow: {
    marginHorizontal: 5,
  },
  animationNote: {
    backgroundColor: 'rgba(106, 130, 251, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6A82FB',
  },
  noteText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;
