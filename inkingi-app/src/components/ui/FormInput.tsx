// components/ui/FormInput.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  Platform,
  ViewStyle,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import * as Haptics from 'expo-haptics';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  containerStyle,
  ...props
}) => {
  const { spacing, typography, radius, touchTarget } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;
  const isPasswordVisible = isPassword ? showPassword : false;

  const handleFocus = () => {
    setIsFocused(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Get border color based on state
  const getBorderColor = () => {
    if (isFocused) return '#10b981';
    if (error) return '#ef4444';
    return '#334155';
  };

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      <Text
        style={{
          fontSize: typography.sm,
          fontWeight: '600',
          marginBottom: spacing.xs,
          marginLeft: spacing.xs,
          color: error ? '#ef4444' : '#64748b',
        }}
      >
        {label}
      </Text>
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: isFocused ? 2 : 1,
          borderRadius: radius.lg,
          backgroundColor: '#1e293b',
          borderColor: getBorderColor(),
        }}
      >
        {leftIcon && (
          <View style={{ paddingLeft: spacing.md }}>{leftIcon}</View>
        )}
        
        <TextInput
          style={{
            flex: 1,
            fontSize: typography.base,
            color: '#f1f5f9',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            minHeight: touchTarget.minHeight,
          }}
          placeholderTextColor="#64748b"
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{
              padding: spacing.md,
              minWidth: touchTarget.minWidth,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#94a3b8', fontSize: typography.sm }}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{
              padding: spacing.md,
              minWidth: touchTarget.minWidth,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text
          style={{
            fontSize: typography.xs,
            color: '#ef4444',
            marginTop: spacing.xs,
            marginLeft: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};