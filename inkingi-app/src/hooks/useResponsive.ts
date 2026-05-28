// hooks/useResponsive.ts
import { useWindowDimensions, Platform, PixelRatio } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export const useResponsive = () => {
  const { width, height, fontScale } = useWindowDimensions();
  
  // Base design reference (iPhone 14 Pro - 390x844)
  const baseWidth = 390;
  const baseHeight = 844;
  
  // Responsive spacing values that scale but maintain proportions
  const spacing = {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(16),
    lg: moderateScale(24),
    xl: moderateScale(32),
    '2xl': moderateScale(48),
    '3xl': moderateScale(64),
  };
  
  // Typography that scales but has max/min limits
  const typography = {
    xs: Math.min(Math.max(moderateScale(10), 10), 12),
    sm: Math.min(Math.max(moderateScale(12), 12), 14),
    base: Math.min(Math.max(moderateScale(14), 14), 16),
    lg: Math.min(Math.max(moderateScale(16), 16), 18),
    xl: Math.min(Math.max(moderateScale(18), 18), 20),
    '2xl': Math.min(Math.max(moderateScale(20), 20), 24),
    '3xl': Math.min(Math.max(moderateScale(24), 24), 28),
    '4xl': Math.min(Math.max(moderateScale(28), 28), 32),
    '5xl': Math.min(Math.max(moderateScale(32), 32), 40),
  };
  
  // Border radius that scales with screen size
  const radius = {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
    '2xl': moderateScale(32),
    full: 9999,
  };
  
  // Icon sizes
  const iconSize = {
    sm: moderateScale(16),
    md: moderateScale(20),
    lg: moderateScale(24),
    xl: moderateScale(28),
    '2xl': moderateScale(32),
  };
  
  // Touch target minimum (WCAG compliant - 44x44 minimum)
  const touchTarget = {
    minWidth: Math.max(44, moderateScale(44)),
    minHeight: Math.max(44, moderateScale(44)),
  };
  
  // Get if device is tablet
  const isTablet = width >= 768;
  
  // Get content max width (for better reading on large devices)
  const contentMaxWidth = isTablet ? 500 : width - spacing['2xl'];
  
  return {
    wp,
    hp,
    scale,
    verticalScale,
    moderateScale, // Make sure this is exported!
    spacing,
    typography,
    radius,
    iconSize,
    touchTarget,
    isTablet,
    contentMaxWidth,
    width,
    height,
    fontScale,
    baseWidth,
    baseHeight,
  };
};