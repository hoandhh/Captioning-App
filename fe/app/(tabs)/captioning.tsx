import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { imageService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
        // Tạm thời thay đổi hành vi vì có thể route chưa tồn tại
        // router.push('/(tabs)/captioning/my-images');
        Alert.alert('Coming Soon', 'View My Images feature will be available soon.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Image Captioning</Text>
                <Text style={styles.subtitle}>Upload an image to generate a caption</Text>

                {!image ? (
                    <View style={styles.uploadContainer}>
                        <Ionicons name="cloud-upload-outline" size={80} color="#2E86C1" />
                        <Text style={styles.uploadText}>Select an image to caption</Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                                <Ionicons name="images-outline" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.pickButton} onPress={takePicture}>
                                <Ionicons name="camera-outline" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Camera</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.myImagesButton} onPress={viewMyImages}>
                            <Text style={styles.myImagesText}>View My Images</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: image }} style={styles.previewImage} />

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#2E86C1" />
                                <Text style={styles.loadingText}>Generating caption...</Text>
                            </View>
                        ) : caption ? (
                            <View style={styles.captionContainer}>
                                <Text style={styles.captionTitle}>Generated Caption:</Text>
                                <Text style={styles.caption}>{caption}</Text>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.regenerateButton} onPress={regenerateCaption}>
                                        <Ionicons name="refresh" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Regenerate</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.newImageButton} onPress={resetImage}>
                                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>New Image</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.actionContainer}>
                                <TouchableOpacity style={styles.generateButton} onPress={generateCaption}>
                                    <Text style={styles.generateButtonText}>Generate Caption</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cancelButton} onPress={resetImage}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 30,
    },
    uploadContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 40,
        borderRadius: 10,
        marginTop: 20,
    },
    uploadText: {
        fontSize: 18,
        color: '#333',
        marginTop: 15,
        marginBottom: 30,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginBottom: 20,
    },
    pickButton: {
        backgroundColor: '#2E86C1',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 130,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    myImagesButton: {
        marginTop: 20,
    },
    myImagesText: {
        color: '#2E86C1',
        fontSize: 16,
        fontWeight: '500',
    },
    previewContainer: {
        marginTop: 20,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    captionContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
    },
    captionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    caption: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    actionContainer: {
        marginTop: 20,
    },
    generateButton: {
        backgroundColor: '#2E86C1',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
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