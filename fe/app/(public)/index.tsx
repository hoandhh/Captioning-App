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
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

    // Placeholder image for logo
    const logoImage = { uri: './assets/logo.png' };

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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image source={logoImage} style={styles.logo} />
                    <Text style={styles.appName}>Image Captioning App</Text>
                    <Text style={styles.tagline}>Biến đổi ảnh thành lời thông qua trí tuệ nhân tạo</Text>
                </View>

                <View style={styles.featuresContainer}>
                    <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>

                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon} size={28} color="#2E86C1" />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                        <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
                        <Text style={styles.secondaryButtonText}>Đăng ký</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.exploreButton} onPress={handleExplore}>
                        <Text style={styles.exploreButtonText}>Khám phá ứng dụng</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.copyright}>© 2023 Image Captioning App</Text>
                    <Text style={styles.version}>Phiên bản 1.0.0</Text>
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
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E86C1',
        textAlign: 'center',
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 30,
    },
    featuresContainer: {
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
    },
    featureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e6f2f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
    },
    actionContainer: {
        marginVertical: 20,
    },
    primaryButton: {
        backgroundColor: '#2E86C1',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2E86C1',
    },
    secondaryButtonText: {
        color: '#2E86C1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    exploreButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    exploreButtonText: {
        color: '#2E86C1',
        fontSize: 16,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        paddingBottom: 20,
    },
    copyright: {
        fontSize: 14,
        color: '#999',
    },
    version: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
});

export default WelcomeScreen; 