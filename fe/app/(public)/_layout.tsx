import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function PublicLayout() {
    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#4A00E0',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShadowVisible: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        title: 'Welcome',
                    }}
                />
            </Stack>
        </>
    );
}