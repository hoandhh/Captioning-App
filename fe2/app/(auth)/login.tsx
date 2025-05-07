import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

// Giả lập logo khi chưa có asset thật
const dummyLogo = { uri: './assets/logo.png' };
const { width } = Dimensions.get('window');

// Bảng màu đồng bộ với thiết kế mới
const AppTheme = {
  primary: '#4A00E0',
  secondary: '#8E2DE2',
  gradientStart: '#4A00E0',
  gradientEnd: '#8E2DE2',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  textLight: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
};

// Các tính năng của ứng dụng để hiển thị
const features = [
    {
        id: '1',
        icon: 'camera-outline',
        title: 'Mô tả thông minh',
        description: 'AI tạo mô tả chi tiết cho ảnh của bạn'
    },
    {
        id: '2',
        icon: 'mic-outline',
        title: 'Nghe mô tả',
        description: 'Chuyển đổi mô tả thành giọng nói'
    },
    {
        id: '3',
        icon: 'share-social-outline',
        title: 'Chia sẻ dễ dàng',
        description: 'Chia sẻ ảnh và mô tả với bạn bè'
    }
];

const LoginScreen = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [identifierType, setIdentifierType] = useState<'email' | 'username'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Reset error state
        setShowError(false);
        setErrorMessage('');
        
        if (!identifier.trim() || !password.trim()) {
            setErrorMessage('Vui lòng điền đầy đủ thông tin');
            setShowError(true);
            return;
        }

        // Kiểm tra định dạng email nếu người dùng chọn đăng nhập bằng email
        if (identifierType === 'email' && !validateEmail(identifier)) {
            setErrorMessage('Email không hợp lệ');
            setShowError(true);
            return;
        }

        setIsLoading(true);
        try {
            const credentials = identifierType === 'email'
                ? { email: identifier, password }
                : { username: identifier, password };

            await login(credentials);
            router.replace('/(tabs)');
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Thông tin đăng nhập không chính xác. Vui lòng thử lại.';
            setErrorMessage(errorMsg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleIdentifierType = () => {
        setIdentifierType(prev => prev === 'email' ? 'username' : 'email');
        setIdentifier('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor={AppTheme.primary} />
            <LinearGradient
                colors={[AppTheme.gradientStart, AppTheme.gradientEnd]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Animatable.Text 
                    animation="fadeIn" 
                    duration={1000} 
                    style={styles.headerTitle}
                >
                    Đăng nhập
                </Animatable.Text>
            </LinearGradient>
            
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={300}
                    style={styles.logoContainer}
                >
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="image-text" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Ứng dụng Mô tả Hình ảnh</Text>
                    <Text style={styles.subtitle}>Biến đổi ảnh thành lời với AI</Text>
                </Animatable.View>

                {/* Phần hiển thị tính năng */}
                <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={500}
                    style={styles.featuresContainer}
                >
                    {features.map((feature, index) => (
                        <Animatable.View 
                            key={feature.id} 
                            animation="fadeInLeft" 
                            duration={600} 
                            delay={700 + (index * 200)}
                            style={styles.featureItem}
                        >
                            <LinearGradient
                                colors={index % 2 === 0 ? 
                                    [AppTheme.gradientStart, AppTheme.gradientEnd] : 
                                    ['#00C9FF', '#92FE9D']}
                                style={styles.featureIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={feature.icon as any} size={24} color="#fff" />
                            </LinearGradient>
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </Animatable.View>
                    ))}
                </Animatable.View>

                <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={900}
                    style={styles.formContainer}
                >
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            {identifierType === 'email' ? 'Email' : 'Tên đăng nhập'}
                        </Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name={identifierType === 'email' ? 'mail-outline' : 'person-outline'} 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={identifier}
                                onChangeText={setIdentifier}
                                placeholder={identifierType === 'email' ? 'Nhập email của bạn' : 'Nhập tên đăng nhập'}
                                keyboardType={identifierType === 'email' ? 'email-address' : 'default'}
                                autoCapitalize="none"
                                placeholderTextColor={AppTheme.textLight}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="lock-closed-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Nhập mật khẩu của bạn"
                                secureTextEntry
                                placeholderTextColor={AppTheme.textLight}
                            />
                        </View>
                    </View>
                    
                    {showError && (
                        <Animatable.View 
                            animation="fadeIn" 
                            duration={300} 
                            style={styles.errorContainer}
                        >
                            <Ionicons name="alert-circle" size={20} color={AppTheme.danger} />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </Animatable.View>
                    )}

                    <TouchableOpacity style={styles.toggleContainer} onPress={toggleIdentifierType}>
                        <Text style={styles.toggleText}>
                            Đăng nhập bằng {identifierType === 'email' ? 'tên đăng nhập' : 'email'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.forgotPassword} 
                        onPress={() => Alert.alert('Thông báo', 'Tính năng quên mật khẩu sẽ có trong phiên bản tới.')}
                    >
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[AppTheme.gradientStart, AppTheme.gradientEnd]}
                            style={styles.button}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Đăng nhập</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 8}} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={styles.registerLink}>Đăng ký</Text>
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
    },
    errorText: {
        color: AppTheme.danger,
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: AppTheme.background,
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollView: {
        flexGrow: 1,
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: AppTheme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: AppTheme.textLight,
        textAlign: 'center',
        marginBottom: 20,
    },
    formContainer: {
        width: '100%',
        backgroundColor: AppTheme.card,
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: AppTheme.text,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 10,
        overflow: 'hidden',
    },
    inputIcon: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRightWidth: 1,
        borderRightColor: '#E9ECEF',
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: AppTheme.text,
    },
    toggleContainer: {
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    toggleText: {
        color: AppTheme.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: AppTheme.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    buttonContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    button: {
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    registerText: {
        color: AppTheme.textLight,
        fontSize: 16,
    },
    registerLink: {
        color: AppTheme.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    featuresContainer: {
        marginBottom: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: AppTheme.card,
        padding: 15,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    featureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 5,
    },
    featureDescription: {
        fontSize: 14,
        color: AppTheme.textLight,
    },
});

export default LoginScreen;