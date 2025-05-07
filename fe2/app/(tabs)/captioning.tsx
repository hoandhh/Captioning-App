import React, { useState, useEffect } from 'react';
import { useImageUpdate } from '../../context/ImageUpdateContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
    Alert,
    Platform,
    Dimensions,
    TextInput,
    StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { imageService } from '../../services/api';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';

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

const { width, height } = Dimensions.get('window');

const CaptioningScreen = () => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [caption, setCaption] = useState<string | null>(null);
    const [imageId, setImageId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCaption, setEditedCaption] = useState<string>('');
    const [location, setLocation] = useState<string | null>(null);
    const router = useRouter();
    const { updateImageTimestamp } = useImageUpdate();

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Từ chối quyền truy cập', 'Cần có quyền truy cập vào thư viện ảnh!');
                return;
            }

            // No permissions request is necessary for launching the image library
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setCaption(null); // Reset caption when new image is selected
                setImageId(null); // Reset imageId when new image is selected
                setLocation(null); // Reset location when picking from gallery
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        }
    };

    const takePicture = async () => {
        try {
            // Request camera permission
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus !== 'granted') {
                Alert.alert('Từ chối quyền truy cập', 'Cần có quyền truy cập vào camera!');
                return;
            }

            // Request location permission
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                Alert.alert('Từ chối quyền truy cập', 'Cần có quyền truy cập vào vị trí để lưu thông tin địa điểm!');
                return;
            }

            // Get current location with timeout
            let locationName: string | null = null;
            try {
                const locationResult = await Promise.race([
                    Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 5000
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 10000)
                    )
                ]) as Location.LocationObject;
                
                if (locationResult) {
                    // Lấy tên địa điểm từ tọa độ
                    const [address] = await Location.reverseGeocodeAsync({
                        latitude: locationResult.coords.latitude,
                        longitude: locationResult.coords.longitude
                    });
                    
                    if (address) {
                        // Tạo tên địa điểm từ thông tin địa chỉ
                        const parts = [];
                        if (address.name) parts.push(address.name);
                        if (address.street) parts.push(address.street);
                        if (address.city) parts.push(address.city);
                        if (address.region) parts.push(address.region);
                        if (address.country) parts.push(address.country);
                        
                        locationName = parts.join(', ');
                    }
                }
            } catch (locationError) {
                console.warn('Không thể lấy vị trí:', locationError);
                // Vẫn tiếp tục chụp ảnh nếu không lấy được vị trí
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setCaption(null);
                setImageId(null);
                setLocation(locationName);
            }
        } catch (error) {
            console.error('Error taking picture:', error);
            Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        }
    };

    const generateCaption = async () => {
        if (!image) return;

        try {
            setLoading(true);

            // Create form data
            const formData = new FormData();
            const filename = image.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            // @ts-ignore
            formData.append('image', {
                uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
                name: filename,
                type,
            });

            // Add location if available
            if (location) {
                formData.append('location', location);
            }

            // Upload image and get caption
            try {
                const response = await imageService.uploadImage(formData);
                setCaption(response.description);
                setImageId(response.id);
                // Cập nhật timestamp khi thêm ảnh mới thành công
                updateImageTimestamp();
            } catch (error: any) {
                console.error('Error details:', error.response?.data || error.message);
                Alert.alert(
                    'Lỗi khi tạo caption',
                    'Không thể kết nối với máy chủ. Vui lòng kiểm tra cài đặt mạng và URL API trong services/api.ts'
                );
            }

        } catch (error) {
            console.error('Error generating caption:', error);
            Alert.alert('Lỗi', 'Không thể tạo caption. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const regenerateCaption = async () => {
        if (!imageId) return;

        try {
            setLoading(true);
            const response = await imageService.regenerateCaption(imageId);
            setCaption(response.image.description);
        } catch (error) {
            console.error('Error regenerating caption:', error);
            Alert.alert('Lỗi', 'Không thể tạo lại mô tả. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    
    const startEditingCaption = () => {
        if (caption) {
            setEditedCaption(caption);
            setIsEditing(true);
        }
    };
    
    const cancelEditingCaption = () => {
        setIsEditing(false);
        setEditedCaption('');
    };
    
    const saveEditedCaption = async () => {
        if (!imageId || !editedCaption.trim()) return;
        
        try {
            setLoading(true);
            const response = await imageService.updateCaption(imageId, editedCaption.trim());
            setCaption(response.image.description);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating caption:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật mô tả. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const resetImage = () => {
        setImage(null);
        setCaption(null);
        setImageId(null);
        setLocation(null);
    };

    const viewMyImages = () => {
        // Navigate to the gallery/history tab
        router.push('/(tabs)/history');
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['rgba(74, 0, 224, 0.05)', 'rgba(255, 255, 255, 0.8)']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <Animatable.View animation="fadeIn" duration={800}>
                        <Text style={styles.title}>Mô tả ảnh bằng AI</Text>
                        <Text style={styles.subtitle}>Chuyển đổi hình ảnh thành văn bản mô tả</Text>
                    </Animatable.View>

                    {!image ? (
                        <Animatable.View 
                            animation="fadeInUp" 
                            duration={800} 
                            delay={300}
                            style={styles.uploadContainer}
                        >
                            <Animatable.View 
                                animation="pulse" 
                                iterationCount="infinite" 
                                duration={2500}
                                style={styles.iconWrapper}
                            >
                                <MaterialCommunityIcons name="image-text" size={90} color={AppTheme.primary} />
                            </Animatable.View>
                            <Text style={styles.uploadText}>Chọn một hình ảnh để tạo mô tả</Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity 
                                    style={styles.pickButton} 
                                    onPress={pickImage}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={AppTheme.primaryGradient as any}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="images" size={24} color="#fff" />
                                        <Text style={styles.buttonText}>Thư viện</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.pickButton} 
                                    onPress={takePicture}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={AppTheme.secondaryGradient as any}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="camera" size={24} color="#fff" />
                                        <Text style={styles.buttonText}>Máy ảnh</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                style={styles.myImagesButton} 
                                onPress={viewMyImages}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.myImagesText}>Xem bộ sưu tập của tôi</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    ) : (
                        <Animatable.View 
                            animation="fadeIn" 
                            duration={800}
                            style={styles.previewContainer}
                        >
                            <Animatable.View 
                                animation="zoomIn" 
                                duration={800} 
                                style={styles.imageContainer}
                            >
                                <Image source={{ uri: image }} style={styles.previewImage} />
                                <LinearGradient
                                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                                    style={styles.imageOverlay}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                >
                                    <TouchableOpacity 
                                        style={styles.changeImageButton}
                                        onPress={pickImage}
                                    >
                                        <Ionicons name="refresh" size={20} color="#fff" />
                                        <Text style={styles.changeImageText}>Đổi ảnh</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </Animatable.View>

                            {loading ? (
                                <Animatable.View 
                                    animation="fadeIn" 
                                    duration={500}
                                    style={styles.loadingContainer}
                                >
                                    <ActivityIndicator size="large" color={AppTheme.primary} />
                                    <Text style={styles.loadingText}>Đang tạo mô tả...</Text>
                                </Animatable.View>
                            ) : caption ? (
                                <Animatable.View 
                                    animation="fadeInUp" 
                                    duration={800}
                                    style={styles.captionContainer}
                                >
                                    <View style={styles.captionHeader}>
                                        <MaterialCommunityIcons name="text-box" size={24} color={AppTheme.primary} />
                                        <Text style={styles.captionTitle}>Mô tả đã tạo</Text>
                                    </View>
                                    
                                    {isEditing ? (
                                        <View style={styles.editContainer}>
                                            <TextInput
                                                style={styles.editInput}
                                                value={editedCaption}
                                                onChangeText={setEditedCaption}
                                                multiline
                                                placeholder="Nhập mô tả của bạn ở đây..."
                                                placeholderTextColor="#888"
                                            />
                                            <View style={styles.editButtons}>
                                                <TouchableOpacity 
                                                    style={[styles.editButton, styles.saveButton]} 
                                                    onPress={saveEditedCaption}
                                                >
                                                    <Text style={styles.editButtonText}>Lưu</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={[styles.editButton, styles.cancelButton]} 
                                                    onPress={cancelEditingCaption}
                                                >
                                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <Text style={styles.caption}>"{caption}"</Text>
                                    )}

                                    {!isEditing && (
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity 
                                                style={styles.actionButtonContainer} 
                                                onPress={regenerateCaption}
                                                activeOpacity={0.8}
                                            >
                                                <LinearGradient
                                                    colors={AppTheme.primaryGradient as any}
                                                    style={styles.actionButtonGradient}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                >
                                                    <Ionicons name="refresh" size={24} color="#fff" />
                                                    <Text style={styles.buttonTextCompact} numberOfLines={1}>Tạo lại</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity 
                                                style={styles.actionButtonContainer} 
                                                onPress={startEditingCaption}
                                                activeOpacity={0.8}
                                            >
                                                <LinearGradient
                                                    colors={[AppTheme.accent, '#8E44AD']}
                                                    style={styles.actionButtonGradient}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                >
                                                    <Ionicons name="pencil" size={24} color="#fff" />
                                                    <Text style={styles.buttonTextCompact} numberOfLines={1}>Sửa</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity 
                                                style={styles.actionButtonContainer} 
                                                onPress={resetImage}
                                                activeOpacity={0.8}
                                            >
                                                <LinearGradient
                                                    colors={[AppTheme.success, '#27AE60']}
                                                    style={styles.actionButtonGradient}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                >
                                                    <Ionicons name="add-circle" size={24} color="#fff" />
                                                    <Text style={styles.buttonTextCompact} numberOfLines={1}>Mới</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Animatable.View>
                            ) : (
                                <Animatable.View 
                                    animation="fadeInUp" 
                                    duration={800}
                                    style={styles.actionContainer}
                                >
                                    <TouchableOpacity 
                                        style={styles.generateButton} 
                                        onPress={generateCaption}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={AppTheme.primaryGradient as any}
                                            style={styles.generateGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Feather name="cpu" size={18} color="#fff" />
                                            <Text style={styles.generateButtonText}>Tạo mô tả</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.cancelButton} 
                                        onPress={resetImage}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.cancelButtonText}>Hủy</Text>
                                    </TouchableOpacity>
                                </Animatable.View>
                            )}
                        </Animatable.View>
                    )}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppTheme.background,
    },
    editContainer: {
        marginVertical: 10,
        width: '100%',
    },
    editInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 10,
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    saveButton: {
        backgroundColor: AppTheme.primary,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    buttonTextCompact: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 12,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: AppTheme.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: AppTheme.textLight,
        textAlign: 'center',
        marginBottom: 30,
    },
    uploadContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 40,
        borderRadius: 20,
        marginTop: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    iconWrapper: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(74, 0, 224, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadText: {
        fontSize: 18,
        color: AppTheme.text,
        marginTop: 15,
        marginBottom: 30,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
        marginTop: 20,
    },
    pickButton: {
        width: 140,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginHorizontal: 10,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    myImagesButton: {
        marginTop: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    myImagesText: {
        color: AppTheme.primary,
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    previewContainer: {
        marginTop: 20,
    },
    imageContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        position: 'relative',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        justifyContent: 'flex-end',
        paddingBottom: 10,
        paddingHorizontal: 15,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-end',
    },
    changeImageText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 5,
    },
    blurView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 15,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: AppTheme.textLight,
        fontWeight: '500',
    },
    captionContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 15,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    captionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    captionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#1A5276',
    },
    caption: {
        fontSize: 16,
        color: AppTheme.text,
        lineHeight: 24,
        fontStyle: 'italic',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: AppTheme.primary,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionContainer: {
        marginTop: 20,
    },
    actionButtonContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        flex: 1,
        marginHorizontal: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    generateButton: {
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        marginBottom: 15,
    },
    generateGradient: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: AppTheme.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10,
    },
    actionButtonCircle: {
        height: 70,
        width: 70,
        marginHorizontal: 5,
        borderRadius: 35,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    regenerateButton: {
        backgroundColor: '#2E86C1',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    newImageButton: {
        backgroundColor: '#27AE60',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default CaptioningScreen;