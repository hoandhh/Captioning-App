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
    Image,
    RefreshControl,
    Modal,
    TextInput,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminService, imageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
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

interface ImageItem {
    id: string;
    description: string;
    url: string;
    created_at: string;
    file_name?: string;
    user_id: string;
    user_name?: string;
    uploaded_by?: {
        id: string;
        username: string;
        full_name?: string;
        role?: string;
    };
}

const AdminScreen = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    
    // Thống kê phân bố hình ảnh
    const [imageDistribution, setImageDistribution] = useState({
        adminCount: 0,
        userCount: 0,
        adminPercentage: 0,
        userPercentage: 0,
        adminRotation: '0deg',
        userRotation: '0deg',
    });
    
    // Search states
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [imageSearchQuery, setImageSearchQuery] = useState('');
    const [isUserSearchFocused, setIsUserSearchFocused] = useState(false);
    const [isImageSearchFocused, setIsImageSearchFocused] = useState(false);
    
    // Pagination states for images
    const [imageCurrentPage, setImageCurrentPage] = useState(1);
    const [imageTotalPages, setImageTotalPages] = useState(1);
    const [imageLoadingMore, setImageLoadingMore] = useState(false);
    const imagePerPage = 8; // Số lượng ảnh mỗi trang
    
    // Pagination states for users
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userLoadingMore, setUserLoadingMore] = useState(false);
    const userPerPage = 8; // Số lượng người dùng mỗi trang
    
    // Modal states
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
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
            
            // Lấy dữ liệu phân bố hình ảnh theo người dùng
            const allImagesData = await adminService.getAllImages(1, 100);
            const allImages = allImagesData.images || [];
            
            // Tính toán số lượng ảnh theo loại người dùng
            let adminImagesCount = 0;
            let userImagesCount = 0;
            
            allImages.forEach((img: ImageItem) => {
                // Kiểm tra nếu uploaded_by có thông tin role
                if (img.uploaded_by && 'role' in img.uploaded_by && img.uploaded_by.role === 'admin') {
                    adminImagesCount++;
                } else {
                    userImagesCount++;
                }
            });
            
            const totalImages = adminImagesCount + userImagesCount;
            
            if (totalImages > 0) {
                // Tính phần trăm
                const adminPercentage = Math.round((adminImagesCount / totalImages) * 100);
                const userPercentage = 100 - adminPercentage;
                
                // Tính góc xoay cho biểu đồ tròn (360 độ = toàn bộ vòng tròn)
                const adminDegrees = Math.round((adminPercentage / 100) * 360);
                const userRotation = `${adminDegrees}deg`;
                
                setImageDistribution({
                    adminCount: adminImagesCount,
                    userCount: userImagesCount,
                    adminPercentage: adminPercentage,
                    userPercentage: userPercentage,
                    adminRotation: '0deg',
                    userRotation: userRotation,
                });
                
                console.log('Image distribution calculated:', {
                    adminCount: adminImagesCount,
                    userCount: userImagesCount,
                    adminPercentage,
                    userPercentage,
                    userRotation
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (isInitialLoad: boolean, page = 1) => {
        try {
            if (isInitialLoad) {
                setLoading(true);
            } else if (page > 1) {
                setUserLoadingMore(true);
            }
            
            // Fetch users with pagination
            const userData = await adminService.getAllUsers({ page, per_page: userPerPage });
            const fetchedUsers = userData.users || [];
            
            // If loading more (pagination), append to existing users
            if (page > 1) {
                setUsers(prevUsers => [...prevUsers, ...fetchedUsers]);
                setFilteredUsers(prevFilteredUsers => {
                    // If search is active, filter the new users too
                    if (userSearchQuery.trim()) {
                        const newFilteredUsers = fetchedUsers.filter((user: User) => 
                            user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                            (user.full_name && user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()))
                        );
                        return [...prevFilteredUsers, ...newFilteredUsers];
                    }
                    return [...prevFilteredUsers, ...fetchedUsers];
                });
            } else {
                // First page, replace all users
                setUsers(fetchedUsers);
                setFilteredUsers(fetchedUsers);
            }
            
            // Update pagination info
            setUserCurrentPage(page);
            setUserTotalPages(Math.ceil(userData.total / userPerPage) || 1);
            
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
            setUserLoadingMore(false);
            setRefreshing(false);
        }
    };
    
    // Load more users when reaching the end of the list
    const loadMoreUsers = () => {
        if (userLoadingMore || userCurrentPage >= userTotalPages) return;
        fetchUsers(false, userCurrentPage + 1);
    };
    
    // Handle user search
    const handleUserSearch = (text: string) => {
        setUserSearchQuery(text);
        
        if (!text.trim()) {
            setFilteredUsers(users);
            return;
        }
        
        const filtered = users.filter(user => 
            user.username.toLowerCase().includes(text.toLowerCase()) ||
            user.email.toLowerCase().includes(text.toLowerCase()) ||
            (user.full_name && user.full_name.toLowerCase().includes(text.toLowerCase()))
        );
        
        setFilteredUsers(filtered);
        // Reset pagination when searching
        setUserCurrentPage(1);
    };
    
    // Clear user search
    const clearUserSearch = () => {
        setUserSearchQuery('');
        setFilteredUsers(users);
        setIsUserSearchFocused(false);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'dashboard') {
            fetchDashboardData();
        } else if (tab === 'users') {
            setUserCurrentPage(1);
            fetchUsers(true, 1);
        } else if (tab === 'images') {
            setImageCurrentPage(1);
            fetchImages(true, 1);
        }
    };
    
    const fetchImages = async (isInitialLoad: boolean, page = 1) => {
        try {
            if (isInitialLoad) {
                setLoading(true);
            } else if (page > 1) {
                setImageLoadingMore(true);
            }
            
            // Fetch images with pagination
            const response = await adminService.getAllImages(page, imagePerPage);
            
            // Process images to ensure they have proper URLs
            const processedImages = (response.images || []).map((img: any) => {
                // Đảm bảo thông tin uploaded_by được giữ nguyên từ API
                const processedImg: ImageItem = {
                    ...img,
                    // Nếu có uploaded_by từ API, sử dụng nó
                    uploaded_by: img.uploaded_by || undefined,
                    // Đảm bảo tương thích ngược với code cũ
                    user_name: img.uploaded_by?.username || img.user_name,
                };
                
                // Check if the image already has a complete URL
                if (img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
                    return processedImg;
                }
                
                // If the image has a relative URL or no URL, construct the full URL
                return {
                    ...processedImg,
                    url: imageService.getImageUrl(img.id),
                };
            });
            
            // If loading more (pagination), append to existing images
            if (page > 1) {
                setImages(prevImages => [...prevImages, ...processedImages]);
                setFilteredImages(prevFilteredImages => {
                    // If search is active, filter the new images too
                    if (imageSearchQuery.trim()) {
                        const newFilteredImages = processedImages.filter((img: ImageItem) => 
                            img.description?.toLowerCase().includes(imageSearchQuery.toLowerCase()) ||
                            (img.uploaded_by?.username && img.uploaded_by.username.toLowerCase().includes(imageSearchQuery.toLowerCase())) ||
                            (img.user_name && img.user_name.toLowerCase().includes(imageSearchQuery.toLowerCase()))
                        );
                        return [...prevFilteredImages, ...newFilteredImages];
                    }
                    return [...prevFilteredImages, ...processedImages];
                });
            } else {
                // First page, replace all images
                setImages(processedImages);
                setFilteredImages(processedImages);
            }
            
            // Update pagination info
            setImageCurrentPage(page);
            setImageTotalPages(Math.ceil(response.total / imagePerPage) || 1);
            
        } catch (error) {
            console.error('Failed to fetch images:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách hình ảnh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
            setImageLoadingMore(false);
            setRefreshing(false);
        }
    };
    
    // Load more images when reaching the end of the list
    const loadMoreImages = () => {
        if (imageLoadingMore || imageCurrentPage >= imageTotalPages) return;
        fetchImages(false, imageCurrentPage + 1);
    };
    
    // Handle image search
    const handleImageSearch = (text: string) => {
        setImageSearchQuery(text);
        
        if (!text.trim()) {
            setFilteredImages(images);
            return;
        }
        
        const filtered = images.filter(img => 
            img.description?.toLowerCase().includes(text.toLowerCase()) ||
            (img.uploaded_by?.username && img.uploaded_by.username.toLowerCase().includes(text.toLowerCase())) ||
            (img.user_name && img.user_name.toLowerCase().includes(text.toLowerCase()))
        );
        
        setFilteredImages(filtered);
        // Reset pagination when searching
        setImageCurrentPage(1);
    };
    
    // Clear image search
    const clearImageSearch = () => {
        setImageSearchQuery('');
        setFilteredImages(images);
        setIsImageSearchFocused(false);
    };
    
    const onImageRefresh = async () => {
        setRefreshing(true);
        setImageCurrentPage(1);
        await fetchImages(false, 1);
    };
    
    const onUserRefresh = async () => {
        setRefreshing(true);
        setUserCurrentPage(1);
        await fetchUsers(false, 1);
    };
    
    const deleteImage = async (imageId: string) => {
        try {
            // Hiển thị thông báo loading
            setLoading(true);
            console.log('Deleting image with ID:', imageId);
            
            // Gọi API xóa ảnh từ Environment.ts
            const response = await adminService.adminDeleteImage(imageId);
            console.log('Delete image response:', response);
            
            // Cập nhật danh sách ảnh cục bộ bằng cách sử dụng hàm cập nhật trạng thái
            const updatedImages = images.filter(img => img.id !== imageId);
            const updatedFilteredImages = filteredImages.filter(img => img.id !== imageId);
            
            // Cập nhật cả hai danh sách
            setImages(updatedImages);
            setFilteredImages(updatedFilteredImages);
            
            // Cập nhật thống kê nếu đang ở trang dashboard
            if (activeTab === 'dashboard' && stats) {
                setStats({
                    ...stats,
                    images: Math.max(0, (stats.images || 0) - 1)
                });
            }
            
            // Đóng modal nếu ảnh đang được xem bị xóa
            if (selectedImage && selectedImage.id === imageId) {
                setModalVisible(false);
            }
            
            // Thông báo thành công
            Alert.alert('Thành công', 'Đã xóa hình ảnh thành công');
        } catch (error) {
            console.error('Failed to delete image:', error);
            Alert.alert('Lỗi', 'Không thể xóa hình ảnh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            console.log(`Changing user status: ${userId} from ${isActive ? 'active' : 'inactive'} to ${!isActive ? 'active' : 'inactive'}`);
            
            // Gọi API thay đổi trạng thái người dùng
            const response = await adminService.changeUserStatus(userId, !isActive);
            console.log('Change user status response:', response);
            
            // Cập nhật danh sách người dùng cục bộ
            const updatedUsers = users.map((user) =>
                user.id === userId ? { ...user, is_active: !isActive } : user
            );
            
            // Cập nhật cả danh sách users và filteredUsers
            setUsers(updatedUsers);
            setFilteredUsers(filteredUsers.map((user) =>
                user.id === userId ? { ...user, is_active: !isActive } : user
            ));
            
            Alert.alert('Thành công', `Người dùng đã ${!isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công.`);
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
        }
    };

    const changeUserRole = async (userId: string, newRole: string) => {
        try {
            console.log(`Changing user role: ${userId} to ${newRole}`);
            
            // Gọi API thay đổi vai trò người dùng
            const response = await adminService.changeUserRole(userId, newRole);
            console.log('Change user role response:', response);
            
            // Cập nhật danh sách người dùng cục bộ
            const updatedUsers = users.map((user) =>
                user.id === userId ? { ...user, role: newRole } : user
            );
            
            // Cập nhật cả danh sách users và filteredUsers
            setUsers(updatedUsers);
            setFilteredUsers(filteredUsers.map((user) =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
            
            Alert.alert('Thành công', `Vai trò người dùng đã được thay đổi thành ${newRole === 'admin' ? 'Quản trị viên' : 'Người dùng'} thành công.`);
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
                        delay={300}
                        style={styles.statsContainer}
                    >
                        <LinearGradient
                            colors={['rgba(142, 45, 226, 0.2)', 'rgba(74, 0, 224, 0.2)']}
                            style={[styles.statCard, { padding: 15 }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={[styles.statLabel, { marginBottom: 10, color: '#4A00E0', fontSize: 16, fontWeight: 'bold' }]}>Phân bố hình ảnh theo người dùng</Text>
                            <View style={styles.pieChartContainer}>
                                <View style={styles.pieChart}>
                                    <Animatable.View 
                                        animation="fadeIn" 
                                        duration={1000} 
                                        delay={400}
                                        style={[styles.pieSlice, { backgroundColor: '#4A00E0', transform: [{ rotate: '0deg' }], zIndex: 5 }]}
                                    />
                                    <Animatable.View 
                                        animation="fadeIn" 
                                        duration={1000} 
                                        delay={600}
                                        style={[styles.pieSlice, { backgroundColor: '#00C9FF', transform: [{ rotate: imageDistribution.userRotation }], zIndex: 4 }]}
                                    />
                                    <View style={styles.pieChartCenter}>
                                        <Text style={styles.pieChartCenterText}>{stats?.images || 0}</Text>
                                    </View>
                                </View>
                                <View style={styles.chartLegend}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: '#4A00E0' }]} />
                                        <Text style={styles.legendText}>Quản trị viên ({imageDistribution.adminPercentage}%)</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: '#00C9FF' }]} />
                                        <Text style={styles.legendText}>Người dùng thường ({imageDistribution.userPercentage}%)</Text>
                                    </View>
                                </View>
                            </View>
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
                            onPress={() => handleTabChange('images')}
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

    const renderImageItem = ({ item }: { item: ImageItem }) => (
        <Animatable.View animation="fadeIn" duration={800} style={styles.imageCardContainer}>
            <TouchableOpacity
                style={styles.imageCard}
                onPress={() => {
                    setSelectedImage(item);
                    setModalVisible(true);
                }}
                activeOpacity={0.9}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: item.url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.5)']}
                        style={styles.imageGradient}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                    <View style={styles.userBadgeContainer}>
                        <LinearGradient
                            colors={[AppTheme.gradientStart, AppTheme.gradientEnd]}
                            style={styles.userBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="person" size={12} color="#fff" style={{marginRight: 4}} />
                            <Text style={styles.userBadgeText} numberOfLines={1}>
                                {item.uploaded_by?.username || item.user_name || 'Người dùng'}
                            </Text>
                        </LinearGradient>
                    </View>
                </View>
                <View style={styles.imageCaptionContainer}>
                    <Text style={styles.imageCaption} numberOfLines={2}>
                        {item.description || 'Không có mô tả'}
                    </Text>
                    <Text style={styles.imageDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
    
    const renderImageDetailModal = () => {
        if (!selectedImage) return null;
        
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        
                        <View style={styles.modalImageContainer}>
                            <Image
                                source={{ uri: selectedImage.url }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        </View>
                        
                        <View style={styles.modalCaptionContainer}>
                            <Text style={styles.modalCaption}>
                                {selectedImage.description || 'Không có mô tả'}
                            </Text>
                            
                            <View style={styles.modalInfoContainer}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={16} color={AppTheme.textLight} />
                                    <Text style={styles.infoText}>
                                        {new Date(selectedImage.created_at).toLocaleString()}
                                    </Text>
                                </View>
                                
                                <View style={styles.infoRow}>
                                    <Ionicons name="person-outline" size={16} color={AppTheme.textLight} />
                                    <Text style={styles.infoText}>
                                        {selectedImage.uploaded_by?.full_name || selectedImage.user_name || 'Người dùng'}
                                    </Text>
                                </View>
                                
                                {selectedImage.file_name && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="document-outline" size={16} color={AppTheme.textLight} />
                                        <Text style={styles.infoText}>
                                            {selectedImage.file_name}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => {
                                        Alert.alert(
                                            'Xác nhận xóa',
                                            'Bạn có chắc chắn muốn xóa hình ảnh này không?',
                                            [
                                                { text: 'Hủy', style: 'cancel' },
                                                { 
                                                    text: 'Xóa', 
                                                    style: 'destructive',
                                                    onPress: () => deleteImage(selectedImage.id)
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#fff" style={{marginRight: 8}} />
                                    <Text style={styles.actionButtonText}>Xóa hình ảnh</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };
    
    const renderImagesList = () => (
        <View style={styles.listContainer}>
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, isImageSearchFocused && styles.searchInputFocused]}>
                    <Ionicons name="search" size={20} color={AppTheme.textLight} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm hình ảnh..."
                        placeholderTextColor="#666666"
                        value={imageSearchQuery}
                        onChangeText={handleImageSearch}
                        onFocus={() => setIsImageSearchFocused(true)}
                    />
                    {imageSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearImageSearch} style={styles.clearSearchButton}>
                            <Ionicons name="close-circle" size={20} color={AppTheme.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            {loading ? (
                <ActivityIndicator size="large" color={AppTheme.primary} style={styles.loader} />
            ) : (
                <>
                    <FlatList
                        data={filteredImages}
                        renderItem={renderImageItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.imageRow}
                        contentContainerStyle={styles.imageList}
                        onEndReached={loadMoreImages}
                        onEndReachedThreshold={0.3}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onImageRefresh}
                                colors={[AppTheme.primary]}
                                tintColor={AppTheme.primary}
                            />
                        }
                        ListEmptyComponent={
                            <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                                <Ionicons name="images-outline" size={60} color={AppTheme.textLight} style={{opacity: 0.5}} />
                                <Text style={styles.emptyText}>
                                    {imageSearchQuery ? 'Không tìm thấy hình ảnh nào' : 'Không có hình ảnh nào'}
                                </Text>
                            </Animatable.View>
                        }
                        ListFooterComponent={
                            imageLoadingMore ? (
                                <View style={styles.loadMoreContainer}>
                                    <ActivityIndicator size="small" color={AppTheme.primary} />
                                    <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                                </View>
                            ) : imageCurrentPage < imageTotalPages ? (
                                <TouchableOpacity 
                                    style={styles.loadMoreButton}
                                    onPress={loadMoreImages}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.loadMoreButtonText}>Tải thêm ảnh</Text>
                                    <Feather name="chevron-down" size={16} color={AppTheme.primary} />
                                </TouchableOpacity>
                            ) : filteredImages.length > 0 ? (
                                <Text style={styles.endOfListText}>Đã hiển thị tất cả ảnh</Text>
                            ) : null
                        }
                    />
                </>
            )}
            {renderImageDetailModal()}
        </View>
    );
    
    const renderUsersList = () => (
        <View style={styles.listContainer}>
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, isUserSearchFocused && styles.searchInputFocused]}>
                    <Ionicons name="search" size={20} color={AppTheme.textLight} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm người dùng..."
                        placeholderTextColor="#666666"
                        value={userSearchQuery}
                        onChangeText={handleUserSearch}
                        onFocus={() => setIsUserSearchFocused(true)}
                    />
                    {userSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearUserSearch} style={styles.clearSearchButton}>
                            <Ionicons name="close-circle" size={20} color={AppTheme.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            {loading ? (
                <ActivityIndicator size="large" color={AppTheme.primary} style={styles.loader} />
            ) : (
                <Animatable.View animation="fadeIn" duration={500} style={{flex: 1}}>
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.usersList}
                        onEndReached={loadMoreUsers}
                        onEndReachedThreshold={0.3}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onUserRefresh}
                                colors={[AppTheme.primary]}
                                tintColor={AppTheme.primary}
                            />
                        }
                        ListEmptyComponent={
                            <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                                <Ionicons name="people" size={60} color={AppTheme.textLight} style={{opacity: 0.5}} />
                                <Text style={styles.emptyText}>
                                    {userSearchQuery ? 'Không tìm thấy người dùng nào' : 'Không có người dùng'}
                                </Text>
                            </Animatable.View>
                        }
                        ListFooterComponent={
                            userLoadingMore ? (
                                <View style={styles.loadMoreContainer}>
                                    <ActivityIndicator size="small" color={AppTheme.primary} />
                                    <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                                </View>
                            ) : userCurrentPage < userTotalPages ? (
                                <TouchableOpacity 
                                    style={styles.loadMoreButton}
                                    onPress={loadMoreUsers}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.loadMoreButtonText}>Tải thêm người dùng</Text>
                                    <Feather name="chevron-down" size={16} color={AppTheme.primary} />
                                </TouchableOpacity>
                            ) : filteredUsers.length > 0 ? (
                                <Text style={styles.endOfListText}>Đã hiển thị tất cả người dùng</Text>
                            ) : null
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
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'images' && styles.activeTab]}
                    onPress={() => handleTabChange('images')}
                >
                    <Ionicons 
                        name="images-outline" 
                        size={20} 
                        color={activeTab === 'images' ? AppTheme.primary : AppTheme.textLight} 
                        style={styles.tabIcon}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'images' && styles.activeTabText,
                        ]}
                    >
                        Hình ảnh
                    </Text>
                </TouchableOpacity>
            </Animatable.View>

            {activeTab === 'dashboard' 
                ? renderDashboard() 
                : activeTab === 'users' 
                ? renderUsersList() 
                : renderImagesList()
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Chart styles
    chartContainer: {
        marginHorizontal: 5,
        marginVertical: 15,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppTheme.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    pieChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    pieChart: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    pieSlice: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
    },
    pieChartCenter: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 10,
    },
    pieChartCenterText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppTheme.text,
    },
    chartLegend: {
        flex: 1,
        paddingLeft: 5,
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#333',
    },
    // Search styles
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 46,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        minWidth: '100%',
    },
    searchInputFocused: {
        borderColor: AppTheme.primary,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000000',
        height: '100%',
    },
    clearSearchButton: {
        padding: 5,
    },
    // Image list styles
    imageList: {
        paddingVertical: 15,
    },
    imageRow: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    imageCardContainer: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        backgroundColor: '#fff',
    },
    imageCard: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageWrapper: {
        width: '100%',
        height: 150,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
    },
    imageCaptionContainer: {
        padding: 10,
    },
    imageCaption: {
        fontSize: 14,
        fontWeight: '600',
        color: AppTheme.text,
        marginBottom: 5,
    },
    imageDate: {
        fontSize: 12,
        color: AppTheme.textLight,
        marginTop: 4,
    },
    userBadgeContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(74,0,224,0.8)',
    },
    userBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        maxWidth: 80,
    },
    loadMoreContainer: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    loadMoreText: {
        marginLeft: 10,
        fontSize: 14,
        color: AppTheme.textLight,
    },
    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginVertical: 15,
        marginHorizontal: 50,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(74,0,224,0.2)',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    loadMoreButtonText: {
        color: AppTheme.primary,
        fontSize: 14,
        fontWeight: '500',
        marginRight: 5,
    },
    endOfListText: {
        textAlign: 'center',
        color: AppTheme.textLight,
        fontSize: 14,
        marginVertical: 20,
        fontStyle: 'italic',
    },
    // Modal styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        width: '90%',
        maxWidth: 500,
        maxHeight: '80%',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 5,
    },
    modalImageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f0f0f0',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    modalCaptionContainer: {
        padding: 20,
    },
    modalCaption: {
        fontSize: 16,
        color: AppTheme.text,
        lineHeight: 24,
        marginBottom: 20,
    },
    modalInfoContainer: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: AppTheme.textLight,
        marginLeft: 8,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    deleteButton: {
        backgroundColor: AppTheme.danger,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Original styles
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