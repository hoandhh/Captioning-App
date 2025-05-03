import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function PublicLayout() {
    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Stack
                screenOptions={{
                    headerShown: false, // Ẩn hoàn toàn header
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