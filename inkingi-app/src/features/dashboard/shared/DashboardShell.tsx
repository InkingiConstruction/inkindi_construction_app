/**
 * ============================================================================
 * FILE NAME        : DashboardShell.tsx
 * WHAT THIS FILE DOES : Shared top header + bottom pill tab bar for all role dashboards
 * HOW IT DOES IT      : Accepts role-specific tab config; each dashboard only supplies
 *                       its own tab content as children
 * PRINCIPLE APPLIED   : DRY — one component rendered across CLIENT / ENGINEER /
 *                       SUPERVISOR / SUPPLIER workspaces
 * ============================================================================
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabButton from '../../../components/ui/TabButton';

// ── Tab item definition ──────────────────────────────────────────────────────
export interface TabDef {
  key: string;
  label: string;
  icon: string;        // Ionicons outline name
  activeIcon: string;  // Ionicons filled name
}

// ── Shell props ──────────────────────────────────────────────────────────────
interface DashboardShellProps {
  user: any;
  roleLabel: string;           // e.g. "Client Workspace" | "Engineer Desk"
  isDark: boolean;
  colors: Record<string, string>;
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onLogout: () => void;
  unreadCount?: number;        // notification badge count (optional)
  onNotifPress?: () => void;   // bell icon handler (optional)
  onSettingsPress?: () => void;// gear icon handler (optional)
  children: React.ReactNode;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DashboardShell({
  user,
  roleLabel,
  isDark,
  colors,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  unreadCount = 0,
  onNotifPress,
  onSettingsPress,
  children,
}: DashboardShellProps) {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 56 + insets.bottom; // icon + label + home indicator

  const headerBg = isDark
    ? 'bg-slate-900 border-b border-slate-800'
    : 'bg-white border-b border-slate-200';

  return (
    <View className={`flex-1 ${colors.bg}`}>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <View
        className={`flex-row justify-between items-center px-5 pb-3 ${headerBg}`}
        style={{ paddingTop: 52 }}
      >
        {/* Left — avatar + role badge + name */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          {user?.profilePic ? (
            <Image
              source={{ uri: user.profilePic }}
              style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#10b981' }}
            />
          ) : (
            <View
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#007E6E' }}
              className="items-center justify-center"
            >
              <Text className="text-white font-bold text-base">
                {(user?.name || 'U').charAt(0)}
              </Text>
            </View>
          )}

          <View>
            <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>
              {roleLabel}
            </Text>
            <Text className={`${colors.text} text-sm font-bold`}>
              {user?.name || 'User'}
            </Text>
          </View>
        </View>

        {/* Right — optional bells / settings + logout */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          {onNotifPress && (
            <TouchableOpacity
              onPress={onNotifPress}
              style={{ width: 36, height: 36 }}
              className="items-center justify-center"
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={isDark ? '#94a3b8' : '#64748b'}
              />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 16, height: 16, borderRadius: 8,
                    backgroundColor: '#ef4444',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {onSettingsPress && (
            <TouchableOpacity
              onPress={onSettingsPress}
              style={{ width: 36, height: 36 }}
              className="items-center justify-center"
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={isDark ? '#94a3b8' : '#64748b'}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onLogout}
            className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-red-500 text-xs font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CONTENT AREA ── */}
      <View className="flex-1" style={{ paddingBottom: TAB_BAR_HEIGHT }}>
        {children}
      </View>

      {/* ── BOTTOM TAB BAR — LinkedIn style: icon + label, safe area aware ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          paddingTop: 8,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1e293b' : '#e8e8e8',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            iconName={tab.icon as any}
            activeIconName={tab.activeIcon as any}
            isActive={activeTab === tab.key}
            onPress={() => onTabChange(tab.key)}
            isDark={isDark}
            showLabel={true}
          />
        ))}
      </View>

    </View>
  );
}
