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
    StatusBar,
    ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
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

    // Use app icon as logo
    const logoImage = require('../../assets/images/icon.png');

    // Features list
    const features: { icon: any; title: string; description: string }[] = [
        {
            icon: 'camera-outline',
            title: 'Mô tả hình ảnh thông minh',
            description: 'Chuyển đổi ảnh thành văn bản mô tả chi tiết bằng AI'
        },
        {
            icon: 'mic-outline',
            title: 'Hỗ trợ text-to-speech',
            description: 'Nghe mô tả ảnh của bạn bằng giọng nói tự nhiên'
        },
        {
            icon: 'bookmark-outline',
            title: 'Lưu trữ và quản lý',
            description: 'Dễ dàng lưu trữ và tìm kiếm ảnh đã mô tả'
        },
        {
            icon: 'share-social-outline',
            title: 'Chia sẻ nhanh chóng',
            description: 'Chia sẻ ảnh và mô tả đến mạng xã hội và bạn bè'
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1A5276" translucent />
            
            <ImageBackground
                source={require('../../assets/images/splash-icon.png')}
                style={styles.backgroundImage}
                imageStyle={{ opacity: 0.15 }}
            >
                <LinearGradient
                    colors={['#1A5276', '#2874A6', '#3498DB']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Animatable.View animation="fadeIn" duration={1000} style={styles.logoContainer}>
                        <Image source={logoImage} style={styles.logo} />
                        <Animatable.Text animation="fadeInUp" delay={300} style={styles.appName}>
                            AI Image Captioning
                        </Animatable.Text>
                        <Animatable.Text animation="fadeInUp" delay={500} style={styles.tagline}>
                            Biến đổi ảnh thành lời thông qua trí tuệ nhân tạo
                        </Animatable.Text>
                    </Animatable.View>
                </LinearGradient>
                
                <ScrollView contentContainerStyle={styles.scrollContent}>

                <Animatable.View animation="fadeInUp" delay={700} style={styles.featuresContainer}>
                    <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>

                    {features.map((feature, index) => (
                        <Animatable.View 
                            key={index} 
                            animation="fadeInLeft" 
                            delay={800 + (index * 200)} 
                            style={styles.featureItem}
                        >
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon} size={28} color="#fff" />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </Animatable.View>
                    ))}
                </Animatable.View>

                <Animatable.View animation="fadeInUp" delay={1500} style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#3498DB', '#2874A6']}
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
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#16A085', '#27AE60']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="person-add-outline" size={22} color="#fff" />
                            <Text style={styles.buttonText}>Đăng ký</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.exploreButton} 
                        onPress={handleExplore}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.exploreButtonText}>Khám phá ứng dụng</Text>
                        <Ionicons name="arrow-forward" size={16} color="#2E86C1" style={{marginLeft: 5}} />
                    </TouchableOpacity>
                </Animatable.View>

                <Animatable.View animation="fadeIn" delay={1800} style={styles.footer}>
                    <Text style={styles.copyright}> 2025 AI Image Captioning</Text>
                    <Text style={styles.version}>Phiên bản 1.0.0</Text>
                </Animatable.View>
            </ScrollView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A5276',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 0,
    },
    header: {
        width: '100%',
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
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
        color: '#1A5276',
        marginBottom: 20,
        textAlign: 'center',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
        backgroundColor: '#2E86C1',
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
        color: '#1A5276',
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
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 5,
    },
    exploreButtonText: {
        color: '#2E86C1',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        paddingBottom: 30,
    },
    copyright: {
        fontSize: 14,
        color: '#666',
    },
    version: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
    },
});

export default WelcomeScreen;