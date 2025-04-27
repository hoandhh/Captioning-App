import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

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

// Giả lập logo khi chưa có asset thật
const dummyLogo = { uri: './assets/logo.png' };

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { register } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        if (password.length < 6) {
            return { valid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        if (!/[A-Z]/.test(password)) {
            return { valid: false, error: 'Mật khẩu phải có ít nhất 1 chữ in hoa' };
        }

        const specialChars = "!@#$%^&*()-_=+[]{}|;:'\",.<>/?";
        if (!password.split('').some(char => specialChars.includes(char))) {
            return { valid: false, error: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' };
        }

        return { valid: true, error: '' };
    };

    const handleRegister = async () => {
        // Validate inputs
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            Alert.alert('Lỗi', passwordValidation.error);
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu không khớp');
            return;
        }

        setIsLoading(true);
        try {
            await register({
                username,
                email,
                password,
                full_name: fullName,
            });

            // Navigate to home screen after successful registration
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
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
                    Đăng ký tài khoản
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
                        <MaterialCommunityIcons name="account-plus" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Tạo tài khoản mới</Text>
                    <Text style={styles.subtitle}>Tham gia cùng chúng tôi để trải nghiệm công nghệ AI mô tả hình ảnh</Text>
                </Animatable.View>

                <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={500}
                    style={styles.formContainer}
                >
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tên đăng nhập<Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="person-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Nhập tên đăng nhập"
                                autoCapitalize="none"
                                placeholderTextColor={AppTheme.textLight}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="person-circle-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nhập họ và tên của bạn"
                                placeholderTextColor={AppTheme.textLight}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu<Text style={styles.required}>*</Text></Text>
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
                                placeholder="Tạo mật khẩu"
                                secureTextEntry
                                placeholderTextColor={AppTheme.textLight}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Xác nhận mật khẩu<Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="shield-checkmark-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Xác nhận mật khẩu của bạn"
                                secureTextEntry
                                placeholderTextColor={AppTheme.textLight}
                            />
                        </View>
                    </View>
                    
                    <View style={styles.passwordRequirements}>
                        <Text style={styles.requirementTitle}>Yêu cầu mật khẩu:</Text>
                        <View style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={16} color={AppTheme.success} />
                            <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={16} color={AppTheme.success} />
                            <Text style={styles.requirementText}>Ít nhất 1 chữ in hoa</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={16} color={AppTheme.success} />
                            <Text style={styles.requirementText}>Ít nhất 1 ký tự đặc biệt</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={handleRegister}
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
                                    <Text style={styles.buttonText}>Đăng ký</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 8}} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.loginLink}>Đăng nhập</Text>
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
    required: {
        color: AppTheme.danger,
        fontSize: 16,
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
    passwordRequirements: {
        marginBottom: 20,
        backgroundColor: 'rgba(74, 0, 224, 0.05)',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: AppTheme.primary,
    },
    requirementTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    requirementText: {
        fontSize: 14,
        color: AppTheme.textLight,
        marginLeft: 8,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    loginText: {
        color: AppTheme.textLight,
        fontSize: 16,
    },
    loginLink: {
        color: AppTheme.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen; 