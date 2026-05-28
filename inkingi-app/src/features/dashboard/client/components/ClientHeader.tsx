/**
 * FILE NAME   : ClientHeader.tsx
 * WHAT THIS FILE DOES: Premium personalized client workspace header with user greeting,
 * avatar, engineers quick access, notifications, and interactive dropdown panels.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';
import { AppNotification } from '../../../../hooks/useNotifications';

interface Props {
  user: any;
  isDark: boolean;
  colors: DashColors;
  unreadCount: number;
  notifications: AppNotification[];
  kycFiles: string[];

  showProfileDrop: boolean;
  showNotifDrop: boolean;

  onToggleProfile: () => void;
  onToggleNotif: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onMarkAllRead: () => void;
  onUploadKYC: () => void;

  onCloseDropdowns?: () => void;
  onOpenSettings?: () => void;

  // NEW
  onOpenEngineers?: () => void;
}

export default function ClientHeader({
  user,
  isDark,
  colors,
  unreadCount,
  notifications,
  kycFiles,

  showProfileDrop,
  showNotifDrop,

  onToggleProfile,
  onToggleNotif,
  onToggleTheme,
  onLogout,
  onMarkAllRead,
  onUploadKYC,

  onCloseDropdowns,
  onOpenSettings,

  // NEW
  onOpenEngineers,
}: Props) {
  const headerBg = isDark
    ? 'bg-[#0f172a] border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <>
      {/* BACKDROP */}
      {(showProfileDrop || showNotifDrop) && (
        <Pressable
          onPress={onCloseDropdowns}
          className="absolute inset-0 bg-black/10 z-40"
        />
      )}

      {/* HEADER */}
      <View
        className={`px-4 pt-12 pb-4 border-b flex-row justify-between items-center z-50 ${headerBg}`}
      >
        {/* LEFT SIDE */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleProfile}
          className="flex-row items-center gap-3"
        >
          {user?.profilePic ? (
            <Image
              source={{ uri: user.profilePic }}
              className="w-10 h-10 rounded-xl border-2 border-primary-500/20"
            />
          ) : (
            <View className="w-10 h-10 rounded-xl bg-primary-600 items-center justify-center">
              <Text className="text-white font-bold text-sm">
                {(user?.name || 'Grace Uwase').charAt(0)}
              </Text>
            </View>
          )}

          <View className="space-y-0.5">
            <Text
              className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}
            >
              Welcome Back 👋
            </Text>

            <Text
              className={`${colors.text} text-sm font-extrabold tracking-tight`}
            >
              {user?.name || 'Grace Uwase'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* RIGHT SIDE ACTIONS */}
        <View className="flex-row items-center gap-2">

          {/* ENGINEERS QUICK ACCESS */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenEngineers}
            className={`relative p-2.5 rounded-full ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={isDark ? '#fff' : '#0f172a'}
            />

            {/* ONLINE INDICATOR */}
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
          </TouchableOpacity>

          {/* NOTIFICATION BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggleNotif}
            className={`relative p-2.5 rounded-full ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={isDark ? '#fff' : '#0f172a'}
            />

            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-rose-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1 border border-white">
                <Text className="text-white text-[9px] font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFILE DROPDOWN */}
      {showProfileDrop && (
        <View
          className={`absolute top-24 left-4 w-72 rounded-2xl border z-50 overflow-hidden ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
          style={{
            elevation: 20,
          }}
        >
          {/* USER */}
          <View className="p-4 border-b border-slate-200 dark:border-slate-800">
            <View className="flex-row items-center">
              {user?.profilePic ? (
                <Image
                  source={{ uri: user.profilePic }}
                  className="w-12 h-12 rounded-xl"
                />
              ) : (
                <View className="w-12 h-12 rounded-xl bg-primary-600 items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {(user?.name || 'Grace Uwase').charAt(0)}
                  </Text>
                </View>
              )}

              <View className="ml-3 flex-1">
                <Text className={`${colors.text} font-bold text-sm`}>
                  {user?.name || 'Grace Uwase'}
                </Text>

                <Text
                  className={`${colors.textMuted} text-xs mt-0.5`}
                  numberOfLines={1}
                >
                  {user?.email || 'grace.uwase@inkingi.rw'}
                </Text>
              </View>
            </View>
          </View>

          {/* KYC */}
          <View className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-primary-500/5">
            <View className="flex-row justify-between items-center">
              <Text
                className={`${colors.text} font-bold text-[10px] uppercase tracking-wider`}
              >
                KYC Dossier
              </Text>

              <View className="bg-amber-500/10 px-2 py-0.5 rounded">
                <Text className="text-amber-600 text-[8px] font-extrabold">
                  VERIFYING
                </Text>
              </View>
            </View>

            <View className="mt-2 space-y-1.5">
              {kycFiles.slice(0, 2).map((file, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center gap-1.5"
                >
                  <Ionicons
                    name="document-attach-outline"
                    size={11}
                    color="#64748b"
                  />

                  <Text
                    className="text-slate-500 dark:text-slate-400 text-[9px] flex-1"
                    numberOfLines={1}
                  >
                    {file}
                  </Text>

                  <Ionicons
                    name="checkmark-circle"
                    size={10}
                    color="#10b981"
                  />
                </View>
              ))}

              <TouchableOpacity
                onPress={onUploadKYC}
                className="bg-primary-500/15 py-1.5 rounded-xl items-center justify-center flex-row gap-1 mt-1 border border-primary-500/20 active:bg-primary-500/25"
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={12}
                  color="#007E6E"
                />

                <Text className="text-primary-500 font-bold text-[9px]">
                  Add KYC Credential
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SETTINGS */}
          <TouchableOpacity
            onPress={() => {
              if (onOpenSettings) {
                onCloseDropdowns?.();
                onOpenSettings();
              }
            }}
            className="flex-row items-center px-4 py-4 active:bg-slate-100 dark:active:bg-slate-800"
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={isDark ? '#94a3b8' : '#475569'}
            />

            <Text className={`${colors.text} ml-3 font-semibold text-sm`}>
              My Profile Settings
            </Text>
          </TouchableOpacity>

          {/* THEME */}
          <View className="flex-row items-center justify-between px-4 py-4 border-t border-slate-200 dark:border-slate-800">
            <View className="flex-row items-center">
              <Ionicons
                name="moon-outline"
                size={20}
                color={isDark ? '#94a3b8' : '#475569'}
              />

              <Text className={`${colors.text} ml-3 font-semibold text-sm`}>
                Dark Mode
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={onToggleTheme}
              thumbColor={isDark ? '#14b8a6' : '#e2e8f0'}
              trackColor={{
                false: '#cbd5e1',
                true: '#134e4a',
              }}
            />
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={onLogout}
            className="flex-row items-center px-4 py-4 border-t border-slate-200 dark:border-slate-800 active:bg-rose-50"
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#f43f5e"
            />

            <Text className="ml-3 text-rose-500 font-bold text-sm">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* NOTIFICATION DROPDOWN */}
      {showNotifDrop && (
        <View
          className={`absolute top-24 right-4 w-[92%] max-w-[360px] rounded-2xl border z-50 overflow-hidden ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
          style={{
            maxHeight: 450,
            elevation: 20,
          }}
        >
          <View className="px-4 py-4 flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <Text className={`${colors.text} font-bold text-base`}>
              Notifications
            </Text>

            {notifications.length > 0 && (
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text className="text-primary-500 text-xs font-bold">
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 10,
            }}
          >
            {notifications.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <Ionicons
                    name="notifications-off-outline"
                    size={30}
                    color="#94a3b8"
                  />
                </View>

                <Text className={`${colors.text} mt-4 font-semibold`}>
                  No Notifications
                </Text>

                <Text className={`${colors.textMuted} text-xs mt-1`}>
                  You're all caught up
                </Text>
              </View>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <TouchableOpacity
                  key={n.id}
                  activeOpacity={0.8}
                  className={`mx-3 mt-3 p-4 rounded-xl border ${
                    !n.read
                      ? 'bg-primary-500/10 border-primary-500/20'
                      : isDark
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <View className="flex-row">
                    <View className="w-10 h-10 rounded-xl bg-primary-500/10 items-center justify-center">
                      <Ionicons
                        name={
                          n.type === 'payment'
                            ? 'wallet-outline'
                            : n.type === 'milestone'
                            ? 'construct-outline'
                            : n.type === 'message'
                            ? 'chatbubble-ellipses-outline'
                            : 'notifications-outline'
                        }
                        size={18}
                        color="#14b8a6"
                      />
                    </View>

                    <View className="flex-1 ml-3">
                      <Text className={`${colors.text} font-bold text-sm`}>
                        {n.title}
                      </Text>

                      <Text
                        className={`${colors.textMuted} text-xs mt-1 leading-5`}
                      >
                        {n.body}
                      </Text>

                      <Text className="text-slate-400 text-[10px] mt-2">
                        {n.time}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </>
  );
}