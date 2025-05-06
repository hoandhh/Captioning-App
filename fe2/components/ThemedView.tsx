import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/AppTheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'card' | 'gradient' | 'transparent';
  animation?: string;
  animationDelay?: number;
  withShadow?: boolean;
  gradientColors?: string[];
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  children,
  style,
  variant = 'default',
  animation,
  animationDelay = 0,
  withShadow = false,
  gradientColors = [COLORS.gradientStart, COLORS.gradientEnd],
  ...props
}) => {
  const viewStyle = [
    styles.default,
    variant === 'card' && styles.card,
    variant === 'transparent' && styles.transparent,
    withShadow && SHADOWS.medium,
    style,
  ];

  // If gradient variant is selected, use LinearGradient
  if (variant === 'gradient') {
    return (
      <LinearGradient
        // @ts-ignore - LinearGradient has strict typing but this works fine at runtime
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.default, style]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  // If animation is provided, use Animatable.View
  if (animation) {
    return (
      <Animatable.View
        animation={animation}
        delay={animationDelay}
        style={viewStyle}
        {...props}
      >
        {children}
      </Animatable.View>
    );
  }

  // Default View
  return (
    <View style={viewStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...SHADOWS.light,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
});
