import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS, FONTS } from '../constants/AppTheme';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'body' | 'caption' | 'link' | 'error' | 'success';
  animation?: string;
  animationDelay?: number;
  color?: string;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  type = 'default',
  style,
  animation,
  animationDelay = 0,
  color,
  ...props
}) => {
  const textStyle = [
    styles.default,
    type === 'title' && styles.title,
    type === 'subtitle' && styles.subtitle,
    type === 'body' && styles.body,
    type === 'caption' && styles.caption,
    type === 'link' && styles.link,
    type === 'error' && styles.error,
    type === 'success' && styles.success,
    color && { color },
    style,
  ];

  if (animation) {
    return (
      <Animatable.Text
        animation={animation}
        delay={animationDelay}
        style={textStyle}
        {...props}
      >
        {children}
      </Animatable.Text>
    );
  }

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    ...FONTS.body3,
    color: COLORS.textPrimary,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    ...FONTS.h3,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  body: {
    ...FONTS.body3,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  caption: {
    ...FONTS.body5,
    color: COLORS.textGray,
  },
  link: {
    ...FONTS.body3,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  error: {
    ...FONTS.body4,
    color: COLORS.error,
  },
  success: {
    ...FONTS.body4,
    color: COLORS.success,
  },
});
