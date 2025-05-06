import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService } from '../services/api';

interface User {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: { email?: string; username?: string; password: string }) => Promise<void>;
    register: (userData: { username: string; password: string; email: string; full_name?: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    // Get user profile
                    const userProfile = await userService.getProfile();
                    setUser(userProfile);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                await AsyncStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: { email?: string; username?: string; password: string }) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            console.log('Login response:', response);

            // Lưu token đúng theo cấu trúc của backend
            if (response.access_token) {
                await AsyncStorage.setItem('token', response.access_token);
            } else if (response.token) {
                await AsyncStorage.setItem('token', response.token);
            } else {
                console.error('Login không trả về token');
                throw new Error('Không tìm thấy token trong response');
            }

            try {
                // Get user profile after login
                const userProfile = await userService.getProfile();
                console.log('User profile:', userProfile);

                // Đảm bảo userProfile có cấu trúc đúng
                if (userProfile && userProfile.id) {
                    setUser(userProfile);
                } else if (userProfile && userProfile.user) {
                    // Nếu backend trả về dữ liệu trong field "user"
                    setUser(userProfile.user);
                } else if (response.user) {
                    // Nếu backend trả về user trong response login
                    setUser(response.user);
                } else {
                    console.error('Profile không chứa thông tin user:', userProfile);

                    // Tạo user tạm thời từ thông tin đăng nhập
                    setUser({
                        id: 'temp-id',
                        username: credentials.username || credentials.email || 'user',
                        email: credentials.email || '',
                        role: 'user',
                        is_active: true
                    });
                }
            } catch (profileError) {
                console.error('Lấy profile thất bại:', profileError);

                // Nếu backend trả về user trong response login
                if (response.user) {
                    setUser(response.user);
                } else {
                    // Tạo user tạm thời từ thông tin đã có
                    setUser({
                        id: 'temp-id',
                        username: credentials.username || credentials.email || 'user',
                        email: credentials.email || '',
                        role: 'user',
                        is_active: true
                    });
                }
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: { username: string; password: string; email: string; full_name?: string }) => {
        setIsLoading(true);
        try {
            await authService.register(userData);
            // After registration, log the user in
            await login({
                username: userData.username,
                password: userData.password
            });
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 