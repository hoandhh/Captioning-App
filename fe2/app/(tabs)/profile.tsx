import React, { useState, useEffect, useRef } from 'react';
import { useImageUpdate } from '../../context/ImageUpdateContext';
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
    StatusBar,
    Modal,
    Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { userService } from '../../services/api';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

// Bảng màu đồng bộ với thiết kế mới
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

const ProfileScreen = () => {
    const { user, logout, updateUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showLanguageSettings, setShowLanguageSettings] = useState(false);
    // Define proper types for activity stats
    interface DailyStat {
        date: string;
        count: number;
    }
    
    interface ActivityStats {
        total_images: number;
        images_today: number;
        daily_stats: DailyStat[];
    }
    
    const [activityStats, setActivityStats] = useState<ActivityStats>({
        total_images: 0,
        images_today: 0,
        daily_stats: []
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // Import the image update context
    const { lastImageUpdate, activityUpdated, setActivityUpdated } = useImageUpdate();

    // Fetch user activity statistics
    useEffect(() => {
        const fetchActivityStats = async () => {
            if (!user) return;
            
            try {
                setStatsLoading(true);
                const stats = await userService.getActivityStats();
                setActivityStats(stats);
            } catch (error) {
                console.error('Failed to fetch activity stats:', error);
                // Fallback to default values if API fails
            } finally {
                setStatsLoading(false);
            }
        };

        fetchActivityStats();
    }, [user]);
    
    // Refresh activity stats when new images are uploaded
    useEffect(() => {
        const refreshActivityStats = async () => {
            if (!user || !activityUpdated) return;
            
            try {
                const stats = await userService.getActivityStats();
                setActivityStats(stats);
                // Reset the flag after fetching
                setActivityUpdated(false);
            } catch (error) {
                console.error('Failed to refresh activity stats:', error);
            }
        };

        refreshActivityStats();
    }, [user, activityUpdated, setActivityUpdated, lastImageUpdate]);

    const handleSaveProfile = async () => {
        if (!user) return;

        if (!email.trim()) {
            Alert.alert(t('profile.errorEmptyEmail'), t('profile.errorEmptyEmailMessage'));
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
            Alert.alert(t('profile.profileUpdateSuccess'), t('profile.profileUpdateSuccessMessage'));
        } catch (error: any) {
            Alert.alert(
                t('profile.errorUpdateProfile'),
                error.response?.data?.error || t('profile.errorUpdateProfileMessage')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t('profile.errorPasswordFields'), t('profile.errorPasswordFieldsMessage'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('profile.errorPasswordMatch'), t('profile.errorPasswordMatchMessage'));
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(t('profile.errorPasswordLength'), t('profile.errorPasswordLengthMessage'));
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

            Alert.alert(t('profile.passwordChangeSuccess'), t('profile.passwordChangeSuccessMessage'));
        } catch (error: any) {
            Alert.alert(
                t('profile.errorPasswordChange'),
                error.response?.data?.error || t('profile.errorPasswordChangeMessage')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(t('profile.logoutFailed'), error);
        }
    };

    if (!user) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#2E86C1" />
                <Text style={styles.loadingText}>{t('profile.loadingProfile')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={AppTheme.primary} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animatable.View animation="fadeInUp" duration={800} delay={300} style={styles.avatarContainer}>
                    <Animatable.View animation="pulse" iterationCount="infinite" duration={3000}>
                        <LinearGradient
                            colors={AppTheme.primaryGradient as any}
                            style={styles.avatarGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.avatarText}>
                                {user.full_name
                                    ? user.full_name.charAt(0).toUpperCase()
                                    : user.username.charAt(0).toUpperCase()}
                            </Text>
                        </LinearGradient>
                    </Animatable.View>
                    <Animatable.Text animation="fadeIn" duration={1000} style={styles.username}>{user.username}</Animatable.Text>
                    <Animatable.Text animation="fadeIn" duration={1000} delay={200} style={styles.role}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Animatable.Text>
                </Animatable.View>
                
                <Animatable.View animation="fadeInUp" duration={800} delay={400} style={styles.activityStatsContainer}>
                    <Text style={styles.activityStatsTitle}>{t('profile.activity')}</Text>
                    {statsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={AppTheme.primary} />
                        </View>
                    ) : (
                        <View style={styles.statsRow}>
                            <Animatable.View animation="fadeInLeft" delay={600} duration={800} style={styles.statItem}>
                                <LinearGradient
                                    colors={['#4A00E0', '#8E2DE2']}
                                    style={styles.statCircle}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.statNumber}>{activityStats.total_images}</Text>
                                </LinearGradient>
                                <Text style={styles.statTitle}>{t('profile.images')}</Text>
                            </Animatable.View>
                            
                            <Animatable.View animation="fadeInLeft" delay={800} duration={800} style={styles.statItem}>
                                <LinearGradient
                                    colors={['#00C9FF', '#92FE9D']}
                                    style={styles.statCircle}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.statNumber}>{activityStats.images_today}</Text>
                                </LinearGradient>
                                <Text style={styles.statTitle}>{t('profile.today')}</Text>
                            </Animatable.View>
                        </View>
                    )}
                    
                    {!statsLoading && activityStats.daily_stats && activityStats.daily_stats.length > 0 && (
                        <Animatable.View animation="fadeIn" delay={1200} duration={800} style={styles.dailyStatsContainer}>
                            <Text style={styles.dailyStatsTitle}>{t('profile.activityLastDays')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyStatsScrollContent}>
                                <View style={styles.dailyStatsRow}>
                                    {activityStats.daily_stats.map((stat, index) => {
                                        // Tính toán chiều cao tương đối cho thanh biểu đồ
                                        const maxCount = Math.max(...activityStats.daily_stats.map(s => s.count), 1);
                                        const heightPercentage = stat.count / maxCount;
                                        const barHeight = Math.max(5, heightPercentage * 80);
                                        
                                        return (
                                            <View key={index} style={styles.dailyStatItem}>
                                                <View style={[styles.dailyStatBar, { 
                                                    height: barHeight,
                                                    backgroundColor: stat.count > 0 ? AppTheme.primary : '#E0E0E0',
                                                    opacity: stat.count > 0 ? 1 : 0.5
                                                }]} />
                                                <Text style={[styles.dailyStatText, {
                                                    color: stat.count > 0 ? AppTheme.textLight : '#AAAAAA'
                                                }]}>{stat.date}</Text>
                                                <Text style={styles.dailyStatCount}>{stat.count}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </Animatable.View>
                    )}
                </Animatable.View>

                <View style={styles.profileSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
                        {!isEditing ? (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Feather name="edit-2" size={22} color={AppTheme.primary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <Feather name="x" size={22} color={AppTheme.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>{t('profile.fullName')}</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder={t('profile.enterFullName')}
                            />
                        ) : (
                            <Text style={styles.infoText}>{fullName || t('profile.notProvided')}</Text>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>{t('profile.email')}</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('profile.enterEmail')}
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
                                <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('profile.security')}</Text>
                        {!showPasswordFields ? (
                            <TouchableOpacity onPress={() => setShowPasswordFields(true)}>
                                <Feather name="key" size={22} color={AppTheme.primary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setShowPasswordFields(false)}>
                                <Feather name="x" size={22} color={AppTheme.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {showPasswordFields ? (
                        <View style={styles.passwordSection}>
                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>{t('profile.currentPassword')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder={t('profile.enterCurrentPassword')}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>{t('profile.newPassword')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder={t('profile.enterNewPassword')}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>{t('profile.confirmNewPassword')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder={t('profile.confirmNewPasswordPlaceholder')}
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
                                    <Text style={styles.saveButtonText}>{t('profile.changePassword')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.passwordButton}
                            onPress={() => setShowPasswordFields(true)}
                        >
                            <Ionicons name="lock-closed-outline" size={20} color="#333" />
                            <Text style={styles.passwordButtonText}>{t('profile.changePassword')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
                        {!showLanguageSettings ? (
                            <TouchableOpacity onPress={() => setShowLanguageSettings(true)}>
                                <FontAwesome name="language" size={22} color={AppTheme.primary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setShowLanguageSettings(false)}>
                                <Feather name="x" size={22} color={AppTheme.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {showLanguageSettings ? (
                        <Animatable.View animation="fadeIn" duration={500} style={styles.languageSection}>
                            <Text style={styles.languageTitle}>{t('profile.selectLanguage')}</Text>
                            
                            <View style={styles.languageOptions}>
                                <TouchableOpacity 
                                    style={[styles.languageOption, language === 'en' && styles.selectedLanguageOption]}
                                    onPress={() => setLanguage('en')}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={language === 'en' ? AppTheme.primaryGradient as any : ['#f5f5f5', '#e0e0e0']}
                                        style={styles.languageOptionGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={[styles.languageOptionText, language === 'en' && styles.selectedLanguageOptionText]}>{t('profile.english')}</Text>
                                        {language === 'en' && (
                                            <Ionicons name="checkmark-circle" size={16} color="#fff" style={{marginLeft: 5}} />
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.languageOption, language === 'vi' && styles.selectedLanguageOption]}
                                    onPress={() => setLanguage('vi')}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={language === 'vi' ? AppTheme.primaryGradient as any : ['#f5f5f5', '#e0e0e0']}
                                        style={styles.languageOptionGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={[styles.languageOptionText, language === 'vi' && styles.selectedLanguageOptionText]}>{t('profile.vietnamese')}</Text>
                                        {language === 'vi' && (
                                            <Ionicons name="checkmark-circle" size={16} color="#fff" style={{marginLeft: 5}} />
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            
                            <Text style={styles.languageInfo}>{t('profile.languageInfo')}</Text>
                        </Animatable.View>
                    ) : (
                        <View style={styles.languageInfoContainer}>
                            <Text style={styles.currentLanguage}>
                                {language === 'en' ? t('profile.english') : t('profile.vietnamese')}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setShowLanguageSettings(true)}
                                style={styles.changeLanguageButton}
                            >
                                <Text style={styles.changeLanguageText}>{t('profile.languageSettings')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButtonContainer} onPress={handleLogout} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#FF416C', '#FF4B2B']}
                        style={styles.logoutButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Feather name="log-out" size={20} color="#fff" />
                        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppTheme.background,
        paddingTop: StatusBar.currentHeight || 0,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    loadingContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityStatsContainer: {
        marginHorizontal: 20,
        marginVertical: 15,
        backgroundColor: AppTheme.card,
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    activityStatsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 5,
    },
    statItem: {
        alignItems: 'center',
        width: '30%',
    },
    statCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    statTitle: {
        fontSize: 14,
        color: AppTheme.textLight,
        textAlign: 'center',
    },
    dailyStatsContainer: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    dailyStatsScrollContent: {
        paddingHorizontal: 5,
        paddingBottom: 5,
    },
    dailyStatsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: AppTheme.text,
        marginBottom: 15,
    },
    dailyStatsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 120,
        paddingBottom: 5,
    },
    dailyStatItem: {
        alignItems: 'center',
        width: 50,
        marginHorizontal: 8,
    },
    dailyStatBar: {
        width: 12,
        backgroundColor: AppTheme.primary,
        borderRadius: 6,
        minHeight: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    dailyStatCount: {
        fontSize: 12,
        fontWeight: '500',
        color: AppTheme.primary,
        marginTop: 2,
    },
    dailyStatText: {
        fontSize: 10,
        color: AppTheme.textLight,
        marginTop: 4,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 5,
    },
    role: {
        fontSize: 16,
        color: AppTheme.textLight,
        opacity: 0.8,
    },
    profileSection: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: AppTheme.card,
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        color: AppTheme.text,
    },
    infoContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: AppTheme.textLight,
        marginBottom: 5,
    },
    infoText: {
        fontSize: 16,
        color: AppTheme.text,
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
        backgroundColor: AppTheme.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
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
        padding: 12,
        backgroundColor: 'rgba(74, 0, 224, 0.1)',
        borderRadius: 8,
    },
    passwordButtonText: {
        fontSize: 16,
        color: AppTheme.primary,
        marginLeft: 10,
        fontWeight: '500',
    },
    logoutButtonContainer: {
        margin: 20,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    logoutButton: {
        padding: 15,
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
    languageSection: {
        marginTop: 10,
    },
    languageTitle: {
        fontSize: 16,
        color: AppTheme.text,
        marginBottom: 15,
    },
    languageOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    languageOption: {
        width: '45%',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    selectedLanguageOption: {
        elevation: 4,
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    languageOptionGradient: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    languageOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: AppTheme.text,
    },
    selectedLanguageOptionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    languageInfo: {
        fontSize: 14,
        color: AppTheme.textLight,
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    languageInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    currentLanguage: {
        fontSize: 16,
        color: AppTheme.text,
    },
    changeLanguageButton: {
        padding: 5,
    },
    changeLanguageText: {
        color: AppTheme.primary,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: AppTheme.textLight,
    },
});

export default ProfileScreen; 