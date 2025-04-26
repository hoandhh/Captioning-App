import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Giả lập hình ảnh khi chưa có assets thật
const dummyImage = { uri: 'https://via.placeholder.com/400x300/2E86C1/FFFFFF?text=Image+Captioning+App' };

// Intro slides data
const slides = [
    {
        id: '1',
        title: 'Welcome to Image Captioning App',
        description: 'Discover the power of AI-generated captions for your photos',
        // image: require('../assets/intro-1.png'),
        image: dummyImage,
    },
    {
        id: '2',
        title: 'Upload Your Photos',
        description: 'Simply upload your photos and get automatic captions',
        // image: require('../assets/intro-2.png'),
        image: dummyImage,
    },
    {
        id: '3',
        title: 'Text to Speech',
        description: 'Listen to your captions with our integrated text-to-speech feature',
        // image: require('../assets/intro-3.png'),
        image: dummyImage,
    },
    {
        id: '4',
        title: 'Ready to Start?',
        description: 'Join us now and experience the magic of AI image captioning',
        // image: require('../assets/intro-4.png'),
        image: dummyImage,
    },
];

const IntroScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideListRef = useRef<FlatList>(null);
    const router = useRouter();

    const updateCurrentSlideIndex = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentIndex(currentIndex);
    };

    const goToNextSlide = () => {
        const nextSlideIndex = currentIndex + 1;
        if (nextSlideIndex < slides.length) {
            slideListRef.current?.scrollToIndex({ index: nextSlideIndex });
            setCurrentIndex(nextSlideIndex);
        } else {
            // Last slide - go to authentication
            finishIntro();
        }
    };

    const skip = () => {
        // Go to the last slide
        const lastSlideIndex = slides.length - 1;
        slideListRef.current?.scrollToIndex({ index: lastSlideIndex });
        setCurrentIndex(lastSlideIndex);
    };

    const finishIntro = async () => {
        // Mark intro as completed in AsyncStorage
        await AsyncStorage.setItem('introCompleted', 'true');
        // Navigate to auth screen
        router.replace('/(auth)/login');
    };

    const renderSlide = ({ item }: { item: typeof slides[0] }) => {
        return (
            <View style={styles.slide}>
                <Image source={item.image} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={slideListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={updateCurrentSlideIndex}
            />

            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            currentIndex === index && styles.activeIndicator,
                        ]}
                    />
                ))}
            </View>

            <View style={styles.buttonContainer}>
                {currentIndex < slides.length - 1 ? (
                    <>
                        <TouchableOpacity onPress={skip} style={styles.skipButton}>
                            <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goToNextSlide} style={styles.nextButton}>
                            <Text style={styles.nextButtonText}>Next</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={finishIntro} style={styles.getStartedButton}>
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slide: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: width * 0.8,
        height: height * 0.4,
        resizeMode: 'contain',
    },
    textContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    indicator: {
        height: 10,
        width: 10,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
        borderRadius: 5,
    },
    activeIndicator: {
        backgroundColor: '#2E86C1',
        width: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginVertical: 30,
    },
    skipButton: {
        padding: 10,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#666',
    },
    nextButton: {
        backgroundColor: '#2E86C1',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    nextButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    getStartedButton: {
        backgroundColor: '#2E86C1',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    getStartedText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default IntroScreen; 