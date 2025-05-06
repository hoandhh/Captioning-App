import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { AnimatableProps } from 'react-native-animatable';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/AppTheme';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  colors?: string[] | readonly string[];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  animation?: string | AnimatableProps<any>['animation'];
  animationDelay?: number;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors = [COLORS.gradientStart, COLORS.gradientEnd],
  loading = false,
  disabled = false,
  style,
  textStyle,
  startIcon,
  endIcon,
  animation = 'fadeIn',
  animationDelay = 0,
  ...props
}) => {
  return (
    <Animatable.View
      animation={animation}
      delay={animationDelay}
      style={[styles.container, style]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={styles.touchable}
        {...props}
      >
        <LinearGradient
          // @ts-ignore - LinearGradient has strict typing but this works fine at runtime
          colors={disabled ? ['#A9A9A9', '#808080'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            disabled && styles.disabledGradient
          ]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              {startIcon && <View style={styles.iconContainer}>{startIcon}</View>}
              <Text style={[styles.text, textStyle]}>{title}</Text>
              {endIcon && <View style={styles.iconContainer}>{endIcon}</View>}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    ...SHADOWS.medium,
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    height: 50,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
  },
  disabledGradient: {
    opacity: 0.7,
  },
  text: {
    color: COLORS.white,
    ...FONTS.h3,
    fontWeight: '600',
  },
  iconContainer: {
    marginHorizontal: 8,
  }
});

export default GradientButton;
