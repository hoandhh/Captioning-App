import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { COLORS, FONTS, SIZES } from '../constants/AppTheme';
import { useRouter } from 'expo-router';

interface GradientHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            {showBackButton ? (
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholderView} />
            )}

            <Animatable.Text
              animation="fadeIn"
              style={styles.title}
              numberOfLines={1}
            >
              {title}
            </Animatable.Text>

            {rightComponent ? (
              rightComponent
            ) : (
              <View style={styles.placeholderView} />
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  safeArea: {
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.white,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: SIZES.base,
  },
  placeholderView: {
    width: 40,
  },
});

export default GradientHeader;
