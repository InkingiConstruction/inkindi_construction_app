// components/ui/PrimaryButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
}) => {
  const { spacing, typography, radius } = useResponsive();

  const handlePress = () => {
    if (!disabled && !loading) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  // ✅ Simpler padding — "large" was 24px vertical which looked like a billboard
  const getPadding = () => {
    switch (size) {
      case 'small':  return { paddingVertical: 10, paddingHorizontal: 20 };
      case 'large':  return { paddingVertical: 14, paddingHorizontal: 24 };
      default:       return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getBorderRadius = () => radius.lg;

  const isGradient = variant === 'primary' && !disabled;

  const innerContent = loading ? (
    <ActivityIndicator color="#ffffff" size="small" />
  ) : (
    <Text
      style={[
        {
          fontSize: typography.base,
          fontWeight: '700',
          color: variant === 'outline' ? '#10b981' : '#ffffff',
          textAlign: 'center',
          letterSpacing: 0.3,
        },
        textStyle,
      ]}
    >
      {title}
    </Text>
  );

  if (isGradient) {
    // ✅ TouchableOpacity is OUTSIDE gradient — gradient is just a background view
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.82}
        style={[
          {
            borderRadius: getBorderRadius(),
            overflow: 'hidden',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
            },
            getPadding(),
          ]}
        >
          {innerContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary': return { backgroundColor: '#334155' };
      case 'outline':   return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#10b981' };
      case 'danger':    return { backgroundColor: '#dc2626' };
      default:          return { backgroundColor: '#10b981' };
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        {
          borderRadius: getBorderRadius(),
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
          opacity: disabled ? 0.5 : 1,
        },
        getPadding(),
        getVariantStyle(),
        style,
      ]}
    >
      {innerContent}
    </TouchableOpacity>
  );
};