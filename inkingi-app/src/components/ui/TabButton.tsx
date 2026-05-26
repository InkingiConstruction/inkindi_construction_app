import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  activeIconName: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  isDark: boolean;
}

export default function TabButton({
  label,
  iconName,
  activeIconName,
  isActive,
  onPress,
  isDark,
}: TabButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.88,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const activeColor = '#007E6E'; // Strict InkingiPro Corporate Teal
  const inactiveColor = isDark ? '#64748b' : '#94a3b8'; // Slate-500 / Slate-400

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="flex-1 items-center justify-center h-14"
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
        <Ionicons
          name={isActive ? activeIconName : iconName}
          size={22}
          color={isActive ? activeColor : inactiveColor}
        />
        <Text
          style={{
            color: isActive ? activeColor : inactiveColor,
            fontSize: 10,
            fontWeight: isActive ? '700' : '500',
            marginTop: 2,
          }}
          className="font-openSans"
        >
          {label}
        </Text>
        {isActive && (
          <View 
            style={{ 
              width: 14, 
              height: 2.5, 
              backgroundColor: activeColor, 
              borderRadius: 10, 
              marginTop: 3 
            }} 
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
