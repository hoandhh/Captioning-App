import React, { useState, useEffect } from 'react';
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
    Alert,
    Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

// Yêu cầu mật khẩu
const passwordRequirements = [
    { id: 1, text: 'Ít nhất 6 ký tự', icon: 'text-short', met: false },
    { id: 2, text: 'Ít nhất 1 chữ in hoa', icon: 'format-letter-case-upper', met: false },
    { id: 3, text: 'Ít nhất 1 ký tự đặc biệt', icon: 'code-greater-than', met: false },
];

const ResetPasswordScreen = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [requirements, setRequirements] = useState(passwordRequirements);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetCode, setResetCode] = useState('');

    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        // Lấy mã đặt lại mật khẩu từ URL
        if (params.code) {
            try {
                // Lấy mã đặt lại mật khẩu
                const code = params.code as string;
                console.log("Mã đặt lại mật khẩu từ URL:", code);
                
                // Xử lý mã đặt lại mật khẩu
                const cleanCode = code.trim();
                setResetCode(cleanCode);
                
                // Kiểm tra mã có hợp lệ không
                if (!cleanCode || cleanCode.length !== 6) {
                    setErrorMessage('Mã đặt lại mật khẩu không hợp lệ');
                    setShowError(true);
                    console.log("Mã đặt lại mật khẩu không hợp lệ:", cleanCode);
                }
            } catch (error) {
                console.error("Lỗi khi xử lý mã đặt lại mật khẩu:", error);
                setErrorMessage('Lỗi khi xử lý mã đặt lại mật khẩu');
                setShowError(true);
            }
        } else if (params.token) {
            // Hỗ trợ cả token JWT cũ và mã đặt lại mật khẩu mới
            try {
                const tokenValue = params.token as string;
                console.log("Token từ URL:", tokenValue);
                setResetCode(tokenValue);
            } catch (error) {
                console.error("Lỗi khi xử lý token:", error);
                setErrorMessage('Lỗi khi xử lý liên kết đặt lại mật khẩu');
                setShowError(true);
            }
        } else {
            setErrorMessage('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            setShowError(true);
            console.log("Không tìm thấy mã đặt lại mật khẩu trong URL");
        }
    }, [params]);

    useEffect(() => {
        // Kiểm tra yêu cầu mật khẩu
        const updatedRequirements = [...requirements];
        
        // Kiểm tra độ dài
        updatedRequirements[0].met = newPassword.length >= 6;
        
        // Kiểm tra chữ in hoa
        updatedRequirements[1].met = /[A-Z]/.test(newPassword);
        
        // Kiểm tra ký tự đặc biệt
        updatedRequirements[2].met = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
        
        setRequirements(updatedRequirements);
    }, [newPassword]);

    const allRequirementsMet = () => {
        return requirements.every(req => req.met);
    };

    const handleResetPassword = async () => {
        // Reset error and success states
        setShowError(false);
        setErrorMessage('');
        setShowSuccess(false);
        setSuccessMessage('');
        
        if (!newPassword || !confirmPassword) {
            setErrorMessage('Vui lòng nhập đầy đủ thông tin');
            setShowError(true);
            return;
        }

        if (!allRequirementsMet()) {
            setErrorMessage('Mật khẩu không đáp ứng các yêu cầu bảo mật');
            setShowError(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Mật khẩu xác nhận không khớp');
            setShowError(true);
            return;
        }

        if (!resetCode) {
            setErrorMessage('Không tìm thấy mã đặt lại mật khẩu');
            setShowError(true);
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                token: resetCode,
                new_password: newPassword
            });
            
            setSuccessMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            setShowSuccess(true);
            
            // Xóa các trường sau khi đặt lại thành công
            setNewPassword('');
            setConfirmPassword('');
            
            // Không tự động chuyển hướng nữa - người dùng sẽ nhấn nút để đăng nhập
            
        } catch (error: any) {
            console.error('Lỗi đặt lại mật khẩu:', error);
            const errorMsg = error.response?.data?.error || 'Đã xảy ra lỗi khi đặt lại mật khẩu';
            setErrorMessage(errorMsg);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                    Đặt lại mật khẩu
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
                        <MaterialCommunityIcons name="shield-key" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Tạo mật khẩu mới</Text>
                    <Text style={styles.subtitle}>Vui lòng nhập mật khẩu mới cho tài khoản của bạn</Text>
                </Animatable.View>

                <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={500}
                    style={styles.formContainer}
                >
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="lock-closed-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Nhập mật khẩu mới"
                                secureTextEntry={!showPassword}
                                placeholderTextColor={AppTheme.textLight}
                            />
                            <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color={AppTheme.textLight} 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Hiển thị yêu cầu mật khẩu */}
                    <View style={styles.requirementsContainer}>
                        {requirements.map((req) => (
                            <View key={req.id} style={styles.requirementItem}>
                                <MaterialCommunityIcons 
                                    name={req.met ? "check-circle" : "circle-outline"} 
                                    size={16} 
                                    color={req.met ? AppTheme.success : AppTheme.textLight} 
                                />
                                <Text style={[styles.requirementText, req.met && styles.requirementMet]}>
                                    {req.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons 
                                name="lock-closed-outline" 
                                size={20} 
                                color={AppTheme.textLight} 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Nhập lại mật khẩu mới"
                                secureTextEntry={!showConfirmPassword}
                                placeholderTextColor={AppTheme.textLight}
                            />
                            <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.eyeIcon}>
                                <Ionicons 
                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color={AppTheme.textLight} 
                                />
                            </TouchableOpacity>
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
                            <View style={styles.successHeader}>
                                <Ionicons name="checkmark-circle" size={24} color={AppTheme.success} />
                                <Text style={styles.successText}>{successMessage}</Text>
                            </View>
                            
                            <TouchableOpacity
                                style={[styles.buttonContainer, { marginTop: 15, width: '100%' }]}
                                onPress={() => router.push('/login' as any)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[AppTheme.gradientStart, AppTheme.gradientEnd]}
                                    style={styles.button}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.buttonText}>Đi đến trang đăng nhập</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 8}} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animatable.View>
                    )}

                    <TouchableOpacity
                        style={[styles.buttonContainer, (!resetCode || isLoading) && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={!resetCode || isLoading}
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
                                    <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                                    <Ionicons name="checkmark" size={20} color="#fff" style={{marginLeft: 8}} />
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
    eyeIcon: {
        padding: 12,
    },
    requirementsContainer: {
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 12,
        borderRadius: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        marginLeft: 8,
        fontSize: 14,
        color: AppTheme.textLight,
    },
    requirementMet: {
        color: AppTheme.success,
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
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
    },
    successHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
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
    buttonDisabled: {
        opacity: 0.7,
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

export default ResetPasswordScreen;
