/**
 * FILE NAME   : ProfileSettingsModal.tsx
 * WHAT THIS FILE DOES : Ultra-premium fullscreen Modal for updating client profile,
 *                       managing uploaded KYC/project documents, and configuring preferences.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  visible: boolean;
  colors: DashColors;
  isDark: boolean;
  kycFiles: string[];
  onClose: () => void;
  onUploadKYC: () => void;
  onToggleTheme: () => void;
}

export default function ProfileSettingsModal({
  visible,
  colors,
  isDark,
  kycFiles,
  onClose,
  onUploadKYC,
  onToggleTheme,
}: Props) {
  // Local profile state inputs
  const [name, setName] = useState('Grace Uwase');
  const [email, setEmail] = useState('grace.uwase@inkingi.rw');
  const [phone, setPhone] = useState('+250 788 456 123');
  const [company, setCompany] = useState('Uwase Enterprises Ltd');

  // Push notifications preferences state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'kyc' | 'settings'>('profile');

  const handleSaveProfile = () => {
    Alert.alert('Profile Saved ✓', 'Your contact credentials have been updated securely.');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={false}
    >
      <View className={`flex-1 ${colors.bg} px-5 pt-12 pb-6`}>
        {/* Header Bar */}
        <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <View>
            <Text className={`${colors.text} text-xl font-extrabold tracking-tight`}>Workspace Profile</Text>
            <Text className={`${colors.textMuted} text-xs mt-0.5`}>Verify identity, update settings, and security.</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className={`w-9 h-9 items-center justify-center rounded-full ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <Ionicons name="close" size={20} color={isDark ? '#fff' : '#0f172a'} />
          </TouchableOpacity>
        </View>

        {/* Sub-Tab Switcher */}
        <View className="flex-row gap-2 mt-4 mb-4">
          {(['profile', 'kyc', 'settings'] as const).map((tab) => {
            const isActive = activeSubTab === tab;
            const labels = {
              profile: 'Credentials',
              kyc: 'KYC Files',
              settings: 'Preferences',
            };
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveSubTab(tab)}
                className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                  isActive
                    ? 'bg-primary-600 border-primary-600'
                    : `${colors.card} border-slate-100 dark:border-slate-800`
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? 'text-white' : colors.text
                  }`}
                >
                  {labels[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="flex-1"
        >
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeSubTab === 'profile' && (
            <View className="space-y-4">
              <View className="space-y-1">
                <Text className={`${colors.text} text-base font-bold tracking-tight`}>Personal Details</Text>
                <Text className={`${colors.textMuted} text-xs`}>Essential credentials registered on the Inkingi platform.</Text>
              </View>

              {/* Input Grid */}
              <View className="space-y-3">
                <View className="space-y-1">
                  <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Full Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    className={`rounded-xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                  />
                </View>

                <View className="space-y-1">
                  <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`rounded-xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                  />
                </View>

                <View className="space-y-1">
                  <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Contact Phone</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    className={`rounded-xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                  />
                </View>

                <View className="space-y-1">
                  <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Registered Company</Text>
                  <TextInput
                    value={company}
                    onChangeText={setCompany}
                    className={`rounded-xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                className="bg-primary-600 active:bg-primary-700 py-3.5 rounded-xl items-center justify-center shadow-lg shadow-primary-500/10 mt-2"
              >
                <Text className="text-white font-bold text-sm">Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 2: KYC FILES DOSSIER */}
          {activeSubTab === 'kyc' && (
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <View className="space-y-0.5">
                  <Text className={`${colors.text} text-base font-bold tracking-tight`}>Identity Verification</Text>
                  <Text className={`${colors.textMuted} text-xs`}>National IDs & certified business credentials.</Text>
                </View>
                <TouchableOpacity
                  onPress={onUploadKYC}
                  className="bg-primary-500/10 px-3 py-1.5 rounded-xl flex-row items-center gap-1 border border-primary-500/20 active:bg-primary-500/20"
                >
                  <Ionicons name="cloud-upload-outline" size={12} color="#007E6E" />
                  <Text className="text-primary-500 font-bold text-[10px]">Upload KYC</Text>
                </TouchableOpacity>
              </View>

              {/* Status Header Info */}
              <View className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex-row items-center gap-3">
                <Ionicons name="time" size={18} color="#f59e0b" />
                <View className="flex-1">
                  <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">Pending Verification</Text>
                  <Text className="text-amber-600 dark:text-amber-400 text-[10px] mt-0.5">
                    Our compliance supervisors are checking your documents.
                  </Text>
                </View>
              </View>

              {/* Files Grid */}
              <View className={`border rounded-2xl p-4 ${colors.card} space-y-3`}>
                {kycFiles.map((file, i) => (
                  <View
                    key={i}
                    className="flex-row justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="bg-primary-500/10 p-2 rounded-xl">
                        <Ionicons name="document-text-outline" size={16} color="#007E6E" />
                      </View>
                      <View>
                        <Text className={`${colors.text} text-xs font-semibold`} numberOfLines={1}>
                          {file}
                        </Text>
                        <Text className="text-[9px] text-slate-400">Securely Encrypted • PDF</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                      <Text className="text-emerald-500 text-[10px] font-bold">Encrypted</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: SYSTEM SETTINGS & PREFERENCES */}
          {activeSubTab === 'settings' && (
            <View className="space-y-4">
              <View className="space-y-0.5">
                <Text className={`${colors.text} text-base font-bold tracking-tight`}>App Preferences</Text>
                <Text className={`${colors.textMuted} text-xs`}>Tailor your workspace notification channels & security.</Text>
              </View>

              <View className={`border rounded-2xl p-4 ${colors.card} space-y-4`}>
                {/* Dark Mode toggle */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="moon-outline" size={18} color="#94a3b8" />
                    <View>
                      <Text className={`${colors.text} text-xs font-bold`}>Dark System UI</Text>
                      <Text className="text-slate-400 text-[10px]">Toggles between dark & light visual grading.</Text>
                    </View>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={onToggleTheme}
                    thumbColor={isDark ? '#14b8a6' : '#e2e8f0'}
                    trackColor={{ false: '#cbd5e1', true: '#134e4a' }}
                  />
                </View>

                {/* Push Notifications Toggle */}
                <View className="flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="notifications-outline" size={18} color="#94a3b8" />
                    <View>
                      <Text className={`${colors.text} text-xs font-bold`}>Push Alerts</Text>
                      <Text className="text-slate-400 text-[10px]">Escrow release triggers & contract status warnings.</Text>
                    </View>
                  </View>
                  <Switch
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    thumbColor={pushEnabled ? '#14b8a6' : '#e2e8f0'}
                    trackColor={{ false: '#cbd5e1', true: '#134e4a' }}
                  />
                </View>

                {/* SMS Notifications Toggle */}
                <View className="flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="phone-portrait-outline" size={18} color="#94a3b8" />
                    <View>
                      <Text className={`${colors.text} text-xs font-bold`}>SMS Updates</Text>
                      <Text className="text-slate-400 text-[10px]">OTP prompts and transaction summaries.</Text>
                    </View>
                  </View>
                  <Switch
                    value={smsEnabled}
                    onValueChange={setSmsEnabled}
                    thumbColor={smsEnabled ? '#14b8a6' : '#e2e8f0'}
                    trackColor={{ false: '#cbd5e1', true: '#134e4a' }}
                  />
                </View>

                {/* Biometric Shield Toggle */}
                <View className="flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="finger-print-outline" size={18} color="#94a3b8" />
                    <View>
                      <Text className={`${colors.text} text-xs font-bold`}>Biometric Secure Escrow</Text>
                      <Text className="text-slate-400 text-[10px]">FaceID or TouchID confirmation before disbursements.</Text>
                    </View>
                  </View>
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={setBiometricsEnabled}
                    thumbColor={biometricsEnabled ? '#14b8a6' : '#e2e8f0'}
                    trackColor={{ false: '#cbd5e1', true: '#134e4a' }}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
