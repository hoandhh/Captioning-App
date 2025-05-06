// constants/AppTheme.ts
// Centralized theme configuration for the application

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary colors
  primary: '#4A00E0',
  primaryDark: '#3700B3',
  primaryLight: '#8E2DE2',
  
  // Secondary colors
  secondary: '#8E2DE2',
  secondaryDark: '#6A1CB1',
  secondaryLight: '#BB86FC',
  
  // Accent colors
  accent: '#03DAC6',
  accentDark: '#018786',
  accentLight: '#B3F1EA',
  
  // Gradient colors
  gradientStart: '#4A00E0',
  gradientEnd: '#8E2DE2',
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#F5F5F5',
  backgroundLight: '#FAFAFA',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  textGray: '#9E9E9E',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  margin: 20,
  
  // Font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  h5: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,
  
  // App dimensions
  width,
  height,
};

export const FONTS = {
  largeTitle: { fontFamily: 'Roboto-Bold', fontSize: SIZES.largeTitle },
  h1: { fontFamily: 'Roboto-Bold', fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: 'Roboto-Bold', fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: 'Roboto-SemiBold', fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: 'Roboto-SemiBold', fontSize: SIZES.h4, lineHeight: 22 },
  h5: { fontFamily: 'Roboto-SemiBold', fontSize: SIZES.h5, lineHeight: 22 },
  body1: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body4, lineHeight: 22 },
  body5: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body5, lineHeight: 22 },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 7.68,
    elevation: 8,
  },
};

// Animation durations
export const ANIMATION = {
  fast: 300,
  medium: 500,
  slow: 700,
};

// Gradient configurations
export const GRADIENTS = {
  primary: [COLORS.gradientStart, COLORS.gradientEnd],
  purple: ['#8E2DE2', '#4A00E0'],
  blue: ['#396afc', '#2948ff'],
  pink: ['#F15F79', '#B24592'],
  orange: ['#FF8008', '#FFC837'],
  green: ['#11998e', '#38ef7d'],
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  ANIMATION,
  GRADIENTS,
};
