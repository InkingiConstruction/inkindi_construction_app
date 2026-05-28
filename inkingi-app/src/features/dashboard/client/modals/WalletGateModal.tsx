/**
 * FILE NAME   : WalletGateModal.tsx
 * WHAT THIS FILE DOES : Warns the client when attempting to start projects with insufficient funds.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  visible: boolean;
  colors: DashColors;
  onClose: () => void;
  onAddFunds: () => void;
}

export default function WalletGateModal({
  visible,
  colors,
  onClose,
  onAddFunds,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center p-6">
        <View className={`w-full rounded-[32px] p-6 border space-y-5 shadow-2xl ${colors.card}`}>
          {/* Warning Icon Banner */}
          <View className="items-center space-y-3 pt-2">
            <View className="bg-rose-500/10 p-4 rounded-full">
              <Ionicons name="warning-outline" size={40} color="#f43f5e" />
            </View>
            <Text className={`${colors.text} text-xl font-extrabold text-center tracking-tight`}>
              Funding Threshold Required
            </Text>
          </View>

          <Text className={`${colors.textMuted} text-center text-xs leading-relaxed px-2`}>
            Before launching a construction contract and booking builders, platform policy requires a minimum escrow reserve of <Text className="font-bold text-slate-800 dark:text-slate-100">1,000,000 RWF</Text> to guarantee milestone execution trust.
          </Text>

          <View className="flex-row gap-3 pt-2">
            <TouchableOpacity 
              onPress={onClose} 
              className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 items-center active:opacity-75"
            >
              <Text className={`${colors.text} font-bold text-xs`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onAddFunds} 
              className="flex-1 py-3.5 rounded-xl bg-primary-600 active:bg-primary-700 items-center justify-center flex-row gap-1 shadow-md shadow-primary-500/20"
            >
              <Ionicons name="wallet-outline" size={14} color="white" />
              <Text className="text-white font-bold text-xs">Deposit Escrow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
