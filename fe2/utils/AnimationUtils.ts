// utils/AnimationUtils.ts
// Animation utilities for the application

import { ANIMATION } from '../constants/AppTheme';

// Animation presets for react-native-animatable
export const ANIMATIONS = {
  // Entrance animations
  FADE_IN: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_IN_RIGHT: {
    from: { translateX: 100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_IN_LEFT: {
    from: { translateX: -100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_IN_UP: {
    from: { translateY: 100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_IN_DOWN: {
    from: { translateY: -100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: ANIMATION.medium,
  },
  
  ZOOM_IN: {
    from: { scale: 0.5, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: ANIMATION.medium,
  },
  
  // Exit animations
  FADE_OUT: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_OUT_RIGHT: {
    from: { translateX: 0, opacity: 1 },
    to: { translateX: 100, opacity: 0 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_OUT_LEFT: {
    from: { translateX: 0, opacity: 1 },
    to: { translateX: -100, opacity: 0 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_OUT_UP: {
    from: { translateY: 0, opacity: 1 },
    to: { translateY: -100, opacity: 0 },
    duration: ANIMATION.medium,
  },
  
  SLIDE_OUT_DOWN: {
    from: { translateY: 0, opacity: 1 },
    to: { translateY: 100, opacity: 0 },
    duration: ANIMATION.medium,
  },
  
  ZOOM_OUT: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.5, opacity: 0 },
    duration: ANIMATION.medium,
  },
  
  // Attention animations
  PULSE: {
    0: { scale: 1 },
    0.5: { scale: 1.1 },
    1: { scale: 1 },
    duration: ANIMATION.fast,
  },
  
  BOUNCE: {
    0: { translateY: 0 },
    0.2: { translateY: -10 },
    0.4: { translateY: 0 },
    0.6: { translateY: -5 },
    0.8: { translateY: 0 },
    1: { translateY: 0 },
    duration: ANIMATION.medium,
  },
  
  SHAKE: {
    0: { translateX: 0 },
    0.2: { translateX: -10 },
    0.4: { translateX: 10 },
    0.6: { translateX: -10 },
    0.8: { translateX: 10 },
    1: { translateX: 0 },
    duration: ANIMATION.fast,
  },
  
  FLASH: {
    0: { opacity: 1 },
    0.25: { opacity: 0 },
    0.5: { opacity: 1 },
    0.75: { opacity: 0 },
    1: { opacity: 1 },
    duration: ANIMATION.fast,
  },
};

// Animation delay sequences for staggered animations
export const createStaggeredDelay = (itemCount: number, baseDelay: number = 100) => {
  return Array.from({ length: itemCount }, (_, i) => i * baseDelay);
};

// Animation timing functions
export const EASING = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  ELASTIC: 'elastic',
  BOUNCE: 'bounce',
};

export default {
  ANIMATIONS,
  createStaggeredDelay,
  EASING,
};
