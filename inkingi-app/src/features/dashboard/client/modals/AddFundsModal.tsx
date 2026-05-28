/**
 * FILE NAME   : AddFundsModal.tsx
 * WHAT THIS FILE DOES : Flutterwave gateway simulation modal with modern design.
 */
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';
import LottieAnimation from '../../../../components/ui/LottieAnimation';

interface Props {
  visible: boolean;
  fundAmount: string;
  isProcessing: boolean;
  colors: DashColors;
  onClose: () => void;
  onChangeAmount: (val: string) => void;
  onSubmit: () => void;
}

export default function AddFundsModal({
  visible,
  fundAmount,
  isProcessing,
  colors,
  onClose,
  onChangeAmount,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className={`border-t rounded-t-[32px] p-6 space-y-6 ${colors.card}`}>
          {/* Header */}
          <View className="flex-row justify-between items-center pb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="card" size={20} color="#F5A623" />
              <Text className={`${colors.text} text-lg font-bold tracking-tight`}>Flutterwave Secure Deposit</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <Ionicons name="close" size={20} color={colors.text === 'text-white' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {isProcessing ? (
            <View className="items-center py-12 space-y-4">
              <LottieAnimation type="loading" size={90} />
              <Text className={`${colors.text} font-bold text-sm`}>Authorizing gateway deposit...</Text>
              <Text className="text-slate-400 text-xs">Securing escrow connection via MoMo API</Text>
            </View>
          ) : (
            <View className="space-y-4 mb-5">
              <Text className={`${colors.textMuted} text-xs leading-relaxed`}>
                Escrow funds are safely retained by Inkingi. Payment will only release to your builder when you approve milestones.
              </Text>
              
              <View className="space-y-2">
                <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Deposit Amount (RWF)</Text>
                <View className="relative flex-row items-center">
                  <TextInput
                    value={fundAmount}
                    onChangeText={onChangeAmount}
                    placeholder="1,000,000"
                    keyboardType="numeric"
                    className={`flex-1 rounded-2xl px-5 py-4 border text-xl font-extrabold ${colors.inputBg} ${colors.text}`}
                    placeholderTextColor="#64748b"
                  />
                  <Text className="absolute right-5 text-primary-500 font-extrabold text-sm">RWF</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={onSubmit} 
                className="bg-[#F5A623] active:bg-[#e09214] py-4 rounded-2xl items-center shadow-lg shadow-amber-500/10 flex-row justify-center gap-2 mt-4"
              >
                <Ionicons name="shield-checkmark" size={18} color="white" />
                <Text className="text-white font-bold text-base">Authorize Escrow Payment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
