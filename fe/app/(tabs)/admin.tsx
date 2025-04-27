import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    ScrollView,
    Switch,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

// Theme colors for consistency with other screens
const AppTheme = {
    primary: '#4A00E0',
    secondary: '#8E2DE2',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    textLight: '#6C757D',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
    gradientStart: '#4A00E0',
    gradientEnd: '#8E2DE2',
};

interface User {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    role: string;
}

interface Stats {
    users: number;
    images: number;
    pending_reports: number;
}

const AdminScreen = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user?.role !== 'admin') {
            Alert.alert('Từ chối truy cập', 'Bạn không có quyền quản trị.');
            router.replace('/(tabs)');
        } else {
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsData = await adminService.getStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userData = await adminService.getAllUsers();
            setUsers(userData.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'dashboard') {
            fetchDashboardData();
        } else if (tab === 'users') {
            fetchUsers();
        }
    };

    const toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await adminService.changeUserStatus(userId, !isActive);
            // Update the local users list
            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, is_active: !isActive } : user
                )
            );
            Alert.alert('Thành công', `Người dùng đã ${!isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công.`);
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
        }
    };

    const changeUserRole = async (userId: string, newRole: string) => {
        try {
            await adminService.changeUserRole(userId, newRole);
            // Update the local users list
            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
            Alert.alert('Thành công', `Vai trò người dùng đã được thay đổi thành ${newRole} thành công.`);
        } catch (error) {
            console.error('Failed to change user role:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật vai trò người dùng. Vui lòng thử lại.');
        }
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <Animatable.View 
            animation="fadeInUp" 
            duration={500}
            style={styles.userCard}
        >
            <View style={styles.userInfo}>
                <View style={styles.userAvatarContainer}>
                    <LinearGradient
                        colors={[AppTheme.gradientStart, AppTheme.gradientEnd]}
                        style={styles.userAvatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.userAvatarText}>
                            {item.username.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <View style={styles.userMetaContainer}>
                        <View style={styles.userMetaItem}>
                            <Ionicons name="person-outline" size={14} color={AppTheme.textLight} />
                            <Text style={styles.userMetaText}>
                                {item.full_name || 'Chưa cung cấp'}
                            </Text>
                        </View>
                        <View style={styles.userMetaItem}>
                            <Ionicons name="shield-outline" size={14} color={AppTheme.textLight} />
                            <Text style={[styles.userMetaText, item.role === 'admin' ? styles.adminRoleText : {}]}>
                                {item.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.userActions}>
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Trạng thái:</Text>
                    <View style={styles.switchWrapper}>
                        <Text style={[styles.switchStateText, item.is_active ? styles.activeStateText : styles.inactiveStateText]}>
                            {item.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </Text>
                        <Switch
                            trackColor={{ false: AppTheme.danger, true: AppTheme.success }}
                            thumbColor={'#fff'}
                            ios_backgroundColor={AppTheme.danger}
                            onValueChange={() => toggleUserStatus(item.id, item.is_active)}
                            value={item.is_active}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.actionButtonContainer}
                    onPress={() =>
                        changeUserRole(item.id, item.role === 'admin' ? 'user' : 'admin')
                    }
                >
                    <LinearGradient
                        colors={item.role === 'admin' ? ['#FF9500', '#FF5E3A'] : [AppTheme.gradientStart, AppTheme.gradientEnd]}
                        style={styles.actionButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons 
                            name={item.role === 'admin' ? 'person' : 'shield'} 
                            size={18} 
                            color="#fff" 
                            style={{marginRight: 8}}
                        />
                        <Text style={styles.actionButtonText}>
                            Đổi thành {item.role === 'admin' ? 'Người dùng' : 'Quản trị viên'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </Animatable.View>
    );

    const renderDashboard = () => (
        <ScrollView style={styles.dashboardContainer}>
            {loading ? (
                <ActivityIndicator size="large" color={AppTheme.primary} style={styles.loader} />
            ) : (
                <>
                    <Animatable.Text 
                        animation="fadeIn" 
                        duration={800} 
                        style={styles.sectionTitle}
                    >
                        Thống kê hệ thống
                    </Animatable.Text>
                    
                    <Animatable.View 
                        animation="fadeInUp" 
                        duration={800} 
                        delay={200}
                        style={styles.statsContainer}
                    >
                        <LinearGradient
                            colors={['#4158D0', '#C850C0']}
                            style={styles.statCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.statIconContainer}>
                                <FontAwesome5 name="users" size={30} color="#fff" />
                            </View>
                            <Text style={styles.statValue}>{stats?.users || 0}</Text>
                            <Text style={styles.statLabel}>Người dùng</Text>
                        </LinearGradient>
                        
                        <LinearGradient
                            colors={['#0093E9', '#80D0C7']}
                            style={styles.statCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.statIconContainer}>
                                <MaterialCommunityIcons name="image-multiple" size={30} color="#fff" />
                            </View>
                            <Text style={styles.statValue}>{stats?.images || 0}</Text>
                            <Text style={styles.statLabel}>Hình ảnh</Text>
                        </LinearGradient>
                        
                        <LinearGradient
                            colors={['#FF416C', '#FF4B2B']}
                            style={styles.statCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.statIconContainer}>
                                <Ionicons name="warning" size={30} color="#fff" />
                            </View>
                            <Text style={styles.statValue}>{stats?.pending_reports || 0}</Text>
                            <Text style={styles.statLabel}>Báo cáo chờ xử lý</Text>
                        </LinearGradient>
                    </Animatable.View>

                    <Animatable.View 
                        animation="fadeInUp" 
                        duration={800} 
                        delay={400}
                        style={styles.adminActions}
                    >
                        <TouchableOpacity
                            style={styles.adminActionButtonContainer}
                            onPress={() => handleTabChange('users')}
                        >
                            <LinearGradient
                                colors={[AppTheme.gradientStart, AppTheme.gradientEnd]}
                                style={styles.adminActionButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="people" size={24} color="#fff" />
                                <Text style={styles.adminActionText}>Quản lý người dùng</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.adminActionButtonContainer}
                            onPress={() => {
                                Alert.alert('Sắp ra mắt', 'Tính năng này đang được phát triển.');
                            }}
                        >
                            <LinearGradient
                                colors={['#0093E9', '#80D0C7']}
                                style={styles.adminActionButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="images" size={24} color="#fff" />
                                <Text style={styles.adminActionText}>Quản lý hình ảnh</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.adminActionButtonContainer}
                            onPress={() => {
                                Alert.alert('Sắp ra mắt', 'Tính năng này đang được phát triển.');
                            }}
                        >
                            <LinearGradient
                                colors={['#FF416C', '#FF4B2B']}
                                style={styles.adminActionButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="alert-circle" size={24} color="#fff" />
                                <Text style={styles.adminActionText}>Xử lý báo cáo</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>
                </>
            )}
        </ScrollView>
    );

    const renderUsersList = () => (
        <View style={styles.listContainer}>
            {loading ? (
                <ActivityIndicator size="large" color={AppTheme.primary} style={styles.loader} />
            ) : (
                <Animatable.View animation="fadeIn" duration={500}>
                    <FlatList
                        data={users}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.usersList}
                        ListEmptyComponent={
                            <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                                <Ionicons name="people" size={60} color={AppTheme.textLight} style={{opacity: 0.5}} />
                                <Text style={styles.emptyText}>Không có người dùng</Text>
                            </Animatable.View>
                        }
                    />
                </Animatable.View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Animatable.View 
                animation="fadeIn" 
                duration={800} 
                delay={200}
                style={styles.tabContainer}
            >
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'dashboard' && styles.activeTab,
                    ]}
                    onPress={() => handleTabChange('dashboard')}
                >
                    <Ionicons 
                        name="grid-outline" 
                        size={20} 
                        color={activeTab === 'dashboard' ? AppTheme.primary : AppTheme.textLight} 
                        style={styles.tabIcon}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'dashboard' && styles.activeTabText,
                        ]}
                    >
                        Tổng quan
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'users' && styles.activeTab]}
                    onPress={() => handleTabChange('users')}
                >
                    <Ionicons 
                        name="people-outline" 
                        size={20} 
                        color={activeTab === 'users' ? AppTheme.primary : AppTheme.textLight} 
                        style={styles.tabIcon}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'users' && styles.activeTabText,
                        ]}
                    >
                        Người dùng
                    </Text>
                </TouchableOpacity>
            </Animatable.View>

            {activeTab === 'dashboard' ? renderDashboard() : renderUsersList()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppTheme.background,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tabIcon: {
        marginRight: 8,
    },
    tabText: {
        fontSize: 16,
        color: AppTheme.textLight,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: AppTheme.primary,
    },
    activeTabText: {
        color: AppTheme.primary,
        fontWeight: 'bold',
    },
    dashboardContainer: {
        flex: 1,
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    statIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#fff',
        marginTop: 5,
        opacity: 0.8,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: AppTheme.text,
    },
    adminActions: {
        marginTop: 20,
    },
    adminActionButtonContainer: {
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    adminActionButton: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    listContainer: {
        flex: 1,
        padding: 20,
    },
    usersList: {
        paddingBottom: 20,
    },
    userCard: {
        backgroundColor: AppTheme.card,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    userAvatarContainer: {
        marginRight: 15,
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: AppTheme.textLight,
        marginBottom: 8,
    },
    userMetaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    userMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 4,
    },
    userMetaText: {
        fontSize: 14,
        color: AppTheme.textLight,
        marginLeft: 4,
    },
    adminRoleText: {
        color: AppTheme.primary,
        fontWeight: '500',
    },
    userActions: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButtonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 12,
        borderRadius: 8,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: AppTheme.text,
    },
    switchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    switchStateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeStateText: {
        color: AppTheme.success,
    },
    inactiveStateText: {
        color: AppTheme.danger,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 50,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
        color: AppTheme.textLight,
    },
});

export default AdminScreen; 