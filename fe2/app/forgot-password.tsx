import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { authService } from '../services/api';

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

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleForgotPassword = async () => {
        // Reset error and success states
        setShowError(false);
        setErrorMessage('');
        setShowSuccess(false);
        setSuccessMessage('');
        
        if (!email.trim()) {
            setErrorMessage('Vui lòng nhập địa chỉ email của bạn');
            setShowError(true);
            return;
        }

        // Kiểm tra định dạng email
        if (!validateEmail(email)) {
            setErrorMessage('Email không hợp lệ');
            setShowError(true);
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setSuccessMessage('Nếu địa chỉ email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu qua email.');
            setShowSuccess(true);
            // Xóa email sau khi gửi thành công
            setEmail('');
        } catch (error: any) {
            console.error('Lỗi quên mật khẩu:', error);
            // Không hiển thị lỗi cụ thể để bảo mật
            setErrorMessage('Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.');
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
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
                    Quên mật khẩu
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
                        <MaterialCommunityIcons name="lock-reset" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    <Text style={styles.subtitle}>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</Text>
                </Animatable.View>

                <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={500}
                    style={styles.formContainer}
                >
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="mail-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Nhập email của bạn"
                                keyboardType="email-address"
                                autoCapitalize="none"
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

                    {showSuccess && (
                        <Animatable.View 
                            animation="fadeIn" 
                            duration={300} 
                            style={styles.successContainer}
                        >
                            <Ionicons name="checkmark-circle" size={20} color={AppTheme.success} />
                            <Text style={styles.successText}>{successMessage}</Text>
                        </Animatable.View>
                    )}

                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={handleForgotPassword}
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
                                    <Text style={styles.buttonText}>Gửi yêu cầu</Text>
                                    <Ionicons name="send" size={20} color="#fff" style={{marginLeft: 8}} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.linksContainer}>
                        <TouchableOpacity onPress={() => router.push('/login' as any)}>
                            <Text style={styles.linkText}>Quay lại đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
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
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
    },
    successText: {
        color: AppTheme.success,
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    buttonContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 20,
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
    linksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    linkText: {
        color: AppTheme.primary,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;
