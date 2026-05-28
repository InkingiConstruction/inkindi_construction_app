// components/ui/OtpInput.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Platform, Keyboard } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  onChange,
}) => {
  const { spacing, typography, radius, moderateScale } = useResponsive();
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    // Only take the last character if multiple are pasted
    newCode[index] = text.slice(-1);
    setCode(newCode);
    
    const fullCode = newCode.join('');
    onChange?.(fullCode);
    
    // Move to next input if text was entered
    if (text && text.length > 0 && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
    
    // Check if all digits are filled
    const allFilled = newCode.every(digit => digit && digit.length > 0);
    if (fullCode.length === length && allFilled) {
      // Dismiss keyboard before completing
      Keyboard.dismiss();
      onComplete(fullCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input on backspace when current is empty
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputs.current[index - 1]?.focus();
        onChange?.(newCode.join(''));
      }
    }
  };

  const inputWidth = moderateScale(48);
  const inputHeight = moderateScale(56);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
        paddingHorizontal: spacing.sm,
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref: TextInput | null) => {
            inputs.current[index] = ref;
          }}
          value={code[index]}
          onChangeText={(text: string) => handleChange(text, index)}
          onKeyPress={(e: any) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={{
            width: inputWidth,
            height: inputHeight,
            backgroundColor: '#1e293b',
            borderRadius: radius.lg,
            textAlign: 'center',
            fontSize: typography['3xl'],
            fontWeight: '700',
            color: '#10b981',
            borderWidth: 1,
            borderColor: code[index] && code[index].length > 0 ? '#10b981' : '#334155',
          }}
          selectionColor="#10b981"
        />
      ))}
    </View>
  );
};  