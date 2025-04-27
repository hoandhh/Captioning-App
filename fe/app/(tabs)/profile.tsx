import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
    const { user, logout, updateUser } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;

        if (!email.trim()) {
            Alert.alert('Error', 'Email cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const updatedUser = await userService.updateProfile({
                full_name: fullName,
                email,
            });

            // Update the user in context
            updateUser(updatedUser.user);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to update profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            await userService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });

            // Reset fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordFields(false);

            Alert.alert('Success', 'Password changed successfully');
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to change password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#2E86C1" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.full_name
                                    ? user.full_name.charAt(0).toUpperCase()
                                    : user.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.role}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                    </View>
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                        {!isEditing ? (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Ionicons name="create-outline" size={24} color="#2E86C1" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <Ionicons name="close" size={24} color="#2E86C1" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Họ và tên</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nhập họ và tên của bạn"
                            />
                        ) : (
                            <Text style={styles.infoText}>{fullName || 'Chưa cung cấp'}</Text>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Email</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Nhập email của bạn"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        ) : (
                            <Text style={styles.infoText}>{email}</Text>
                        )}
                    </View>

                    {isEditing && (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bảo mật</Text>
                        {!showPasswordFields ? (
                            <TouchableOpacity onPress={() => setShowPasswordFields(true)}>
                                <Ionicons name="key-outline" size={24} color="#2E86C1" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setShowPasswordFields(false)}>
                                <Ionicons name="close" size={24} color="#2E86C1" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {showPasswordFields ? (
                        <View style={styles.passwordSection}>
                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Mật khẩu hiện tại</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Mật khẩu mới</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Nhập mật khẩu mới"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Xác nhận mật khẩu mới"
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.passwordButton}
                            onPress={() => setShowPasswordFields(true)}
                        >
                            <Ionicons name="lock-closed-outline" size={20} color="#333" />
                            <Text style={styles.passwordButtonText}>Đổi mật khẩu</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
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
        paddingBottom: 30,
    },
    header: {
        backgroundColor: '#2E86C1',
        paddingVertical: 30,
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2E86C1',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    role: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    profileSection: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    infoContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#2E86C1',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    passwordSection: {
        marginTop: 10,
    },
    passwordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    passwordButtonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    logoutButton: {
        backgroundColor: '#E74C3C',
        margin: 20,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default ProfileScreen; 