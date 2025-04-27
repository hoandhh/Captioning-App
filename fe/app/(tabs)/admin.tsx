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
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.details}>
                    Tên: {item.full_name || 'Chưa cung cấp'} • Vai trò: {item.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </Text>
            </View>
            <View style={styles.userActions}>
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Trạng thái:</Text>
                    <View style={styles.switchWrapper}>
                        <Text style={styles.switchStateText}>{item.is_active ? 'Hoạt động' : 'Không hoạt động'}</Text>
                        <Switch
                            trackColor={{ false: '#E74C3C', true: '#2ECC71' }}
                            thumbColor={item.is_active ? '#fff' : '#fff'}
                            ios_backgroundColor="#E74C3C"
                            onValueChange={() => toggleUserStatus(item.id, item.is_active)}
                            value={item.is_active}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
                    onPress={() =>
                        changeUserRole(item.id, item.role === 'admin' ? 'user' : 'admin')
                    }
                >
                    <Text style={styles.actionButtonText}>
                        Đổi thành {item.role === 'admin' ? 'Người dùng' : 'Quản trị viên'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDashboard = () => (
        <ScrollView style={styles.dashboardContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#2E86C1" style={styles.loader} />
            ) : (
                <>
                    <Text style={styles.sectionTitle}>Thống kê hệ thống</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Ionicons name="people" size={40} color="#2E86C1" />
                            <Text style={styles.statValue}>{stats?.users || 0}</Text>
                            <Text style={styles.statLabel}>Người dùng</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="images" size={40} color="#2E86C1" />
                            <Text style={styles.statValue}>{stats?.images || 0}</Text>
                            <Text style={styles.statLabel}>Hình ảnh</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="alert-circle" size={40} color="#E74C3C" />
                            <Text style={styles.statValue}>{stats?.pending_reports || 0}</Text>
                            <Text style={styles.statLabel}>Báo cáo chờ xử lý</Text>
                        </View>
                    </View>

                    <View style={styles.adminActions}>
                        <TouchableOpacity
                            style={styles.adminActionButton}
                            onPress={() => handleTabChange('users')}
                        >
                            <Ionicons name="people" size={24} color="#fff" />
                            <Text style={styles.adminActionText}>Quản lý người dùng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.adminActionButton}
                            onPress={() => {
                                Alert.alert('Sắp ra mắt', 'Tính năng này đang được phát triển.');
                            }}
                        >
                            <Ionicons name="images" size={24} color="#fff" />
                            <Text style={styles.adminActionText}>Quản lý hình ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.adminActionButton}
                            onPress={() => {
                                Alert.alert('Sắp ra mắt', 'Tính năng này đang được phát triển.');
                            }}
                        >
                            <Ionicons name="alert-circle" size={24} color="#fff" />
                            <Text style={styles.adminActionText}>Xử lý báo cáo</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView>
    );

    const renderUsersList = () => (
        <View style={styles.listContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#2E86C1" style={styles.loader} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.usersList}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Không có người dùng</Text>
                    }
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bảng điều khiển</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'dashboard' && styles.activeTab,
                    ]}
                    onPress={() => handleTabChange('dashboard')}
                >
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
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'users' && styles.activeTabText,
                        ]}
                    >
                        Người dùng
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'dashboard' ? renderDashboard() : renderUsersList()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#2E86C1',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#2E86C1',
    },
    activeTabText: {
        color: '#2E86C1',
        fontWeight: 'bold',
    },
    dashboardContainer: {
        flex: 1,
        padding: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    adminActions: {
        marginTop: 20,
    },
    adminActionButton: {
        backgroundColor: '#2E86C1',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    listContainer: {
        flex: 1,
        padding: 15,
    },
    usersList: {
        paddingBottom: 20,
    },
    userCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        marginBottom: 15,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    userActions: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    switchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    switchStateText: {
        fontSize: 14,
        color: '#666',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 50,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});

export default AdminScreen; 