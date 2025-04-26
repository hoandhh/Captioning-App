import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { imageService } from '../../services/api';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const CaptioningScreen = () => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [caption, setCaption] = useState<string | null>(null);
    const [imageId, setImageId] = useState<string | null>(null);
    const router = useRouter();

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access media library is required!');
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
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const takePicture = async () => {
        try {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access camera is required!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setCaption(null); // Reset caption when new image is selected
                setImageId(null); // Reset imageId when new image is selected
            }
        } catch (error) {
            console.error('Error taking picture:', error);
            Alert.alert('Error', 'Failed to take picture. Please try again.');
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

            // Upload image and get caption
            try {
                const response = await imageService.uploadImage(formData);
                setCaption(response.description);
                setImageId(response.id);
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
            Alert.alert('Error', 'Failed to regenerate caption. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetImage = () => {
        setImage(null);
        setCaption(null);
        setImageId(null);
    };

    const viewMyImages = () => {
        // Navigate to the gallery/history tab
        router.push('/(tabs)/history');
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['rgba(26, 82, 118, 0.05)', 'rgba(255, 255, 255, 0.8)']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <Animatable.View animation="fadeIn" duration={800}>
                        <Text style={styles.title}>AI Image Captioning</Text>
                        <Text style={styles.subtitle}>Transform your images into descriptive text</Text>
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
                                <MaterialCommunityIcons name="image-text" size={90} color="#1A5276" />
                            </Animatable.View>
                            <Text style={styles.uploadText}>Select an image to generate a caption</Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity 
                                    style={styles.pickButton} 
                                    onPress={pickImage}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#3498DB', '#2874A6']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="images" size={24} color="#fff" />
                                        <Text style={styles.buttonText}>Gallery</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.pickButton} 
                                    onPress={takePicture}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#16A085', '#27AE60']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name="camera" size={24} color="#fff" />
                                        <Text style={styles.buttonText}>Camera</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                style={styles.myImagesButton} 
                                onPress={viewMyImages}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.myImagesText}>View My Gallery</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    ) : (
                        <Animatable.View 
                            animation="fadeIn" 
                            duration={800}
                            style={styles.previewContainer}
                        >
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: image }} style={styles.previewImage} />
                            </View>

                            {loading ? (
                                <Animatable.View 
                                    animation="fadeIn" 
                                    duration={500}
                                    style={styles.loadingContainer}
                                >
                                    <ActivityIndicator size="large" color="#1A5276" />
                                    <Text style={styles.loadingText}>Generating caption...</Text>
                                </Animatable.View>
                            ) : caption ? (
                                <Animatable.View 
                                    animation="fadeInUp" 
                                    duration={800}
                                    style={styles.captionContainer}
                                >
                                    <View style={styles.captionHeader}>
                                        <MaterialCommunityIcons name="text-box" size={24} color="#1A5276" />
                                        <Text style={styles.captionTitle}>Generated Caption</Text>
                                    </View>
                                    <Text style={styles.caption}>"{caption}"</Text>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity 
                                            style={styles.actionButton} 
                                            onPress={regenerateCaption}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={['#3498DB', '#2874A6']}
                                                style={styles.actionButtonGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <Ionicons name="refresh" size={20} color="#fff" />
                                                <Text style={styles.buttonText}>Regenerate</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={styles.actionButton} 
                                            onPress={resetImage}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={['#16A085', '#27AE60']}
                                                style={styles.actionButtonGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <Ionicons name="add-circle" size={20} color="#fff" />
                                                <Text style={styles.buttonText}>New Image</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
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
                                            colors={['#1A5276', '#2874A6']}
                                            style={styles.generateGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <FontAwesome5 name="brain" size={18} color="#fff" />
                                            <Text style={styles.generateButtonText}>Generate Caption</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.cancelButton} 
                                        onPress={resetImage}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
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
        backgroundColor: '#fff',
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
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1A5276',
        textAlign: 'center',
        marginTop: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
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
        backgroundColor: 'rgba(26, 82, 118, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadText: {
        fontSize: 18,
        color: '#333',
        marginTop: 15,
        marginBottom: 30,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginBottom: 20,
    },
    pickButton: {
        minWidth: 140,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginHorizontal: 8,
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
        color: '#1A5276',
        fontSize: 16,
        fontWeight: '600',
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
        marginTop: 15,
        fontSize: 16,
        color: '#666',
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
    },
    captionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#1A5276',
    },
    caption: {
        fontSize: 18,
        color: '#333',
        lineHeight: 28,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    actionContainer: {
        marginTop: 20,
    },
    generateButton: {
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginBottom: 15,
    },
    generateGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    cancelButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        marginHorizontal: 5,
    },
    actionButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
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