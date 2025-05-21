import React, { useEffect, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ImageUpdateProvider } from '../context/ImageUpdateContext';
import { LanguageProvider } from '../context/LanguageContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Định nghĩa hook để xử lý các navigation redirect
function useProtectedRoutes() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Lưu trạng thái điều hướng trước đó để xử lý vuốt back
  const previousSegmentsRef = useRef<string[]>([]);

  useEffect(() => {
    if (isLoading) return;

    // Kiểm tra các nhóm trang
    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';
    const inIntroScreen = segments[0] === 'intro';
    const inWelcomeScreen = segments[0] === 'welcome';
    const inResetPasswordScreen = segments[0] === 'reset-password';
    const inForgotPasswordScreen = segments[0] === 'forgot-password';
    
    // Kiểm tra trang chính an toàn hơn, tránh lỗi TypeScript
    const inRootScreen = segments.length <= 0 || !segments[0];
    
    // Kiểm tra xem đang vuốt back từ trang đăng nhập về trang public hay không
    const isNavigatingBackFromAuth = 
      previousSegmentsRef.current[0] === '(auth)' && 
      (inPublicGroup || inRootScreen || inWelcomeScreen);
    
    // Cập nhật tham chiếu cho lần render tiếp theo
    previousSegmentsRef.current = [...segments];

    // Bỏ qua việc chuyển hướng nếu đang ở trang public, trang welcome, trang reset-password, trang forgot-password hoặc đang vuốt back từ trang đăng nhập
    if (inPublicGroup || inWelcomeScreen || inResetPasswordScreen || inForgotPasswordScreen || isNavigatingBackFromAuth) return;

    const checkIntroStatus = async () => {
      const isIntroCompleted = await AsyncStorage.getItem('introCompleted');

      // Logic chuyển hướng chính
      if (!isAuthenticated) {
        // Nếu chưa đăng nhập và không ở trang auth, trang chính, trang welcome, trang reset-password, trang forgot-password hoặc trang public
        if (!inAuthGroup && !inRootScreen && !inWelcomeScreen && !inPublicGroup && !inResetPasswordScreen && !inForgotPasswordScreen) {
          // Sử dụng router.push thay vì router.replace để giữ lại lịch sử điều hướng
          router.push('/(auth)/login');
        }
      } else {
        // Đã đăng nhập
        if (inAuthGroup) {
          // Sử dụng router.push thay vì router.replace để giữ lại lịch sử điều hướng
          router.push('/(tabs)');
        } else if (!isIntroCompleted && !inIntroScreen) {
          // Chưa xem intro
          router.push('/intro');
        }
      }
    };

    checkIntroStatus();
  }, [isLoading, isAuthenticated, segments]);
}

// Component that handles redirects based on authentication state
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  // Sử dụng hook bảo vệ route
  useProtectedRoutes();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, title: "AI Image Captioning" }} />
        <Stack.Screen name="intro" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ImageUpdateProvider>
        <LanguageProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayoutNav />
          </ThemeProvider>
        </LanguageProvider>
      </ImageUpdateProvider>
    </AuthProvider>
  );
}
