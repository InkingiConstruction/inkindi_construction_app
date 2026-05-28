/**
 * FILE NAME   : ChatTab.tsx
 * WHAT THIS FILE DOES : Two-panel workspace tab. Switches between:
 *   - "Messages" panel: user list → tapping a contact opens a chat thread.
 *   - "Notifications" panel: read-only activity feed list.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  messages: any[];
  colors: DashColors;
  onSendMessage: (text: string) => void;
}

// Static mock contacts list for demo – will be replaced by API
const MOCK_CONTACTS = [
  { id: 'c1', name: 'Aline Mukamana', role: 'Supervisor', lastMsg: 'Foundation phase approved ✓', time: '10:22', unread: 2, online: true },
  { id: 'c2', name: 'Jean Bosco Nkurunziza', role: 'Engineer', lastMsg: 'Waiting for permits from KCC', time: '09:14', unread: 0, online: false },
  { id: 'c3', name: 'Inkingi Support', role: 'Platform Admin', lastMsg: 'Your KYC is under review.', time: 'Yesterday', unread: 1, online: true },
];

// Static mock notifications for demo
const MOCK_NOTIFS = [
  { id: 'n1', icon: 'wallet-outline', color: '#10b981', title: 'Milestone Disbursed', body: '12,000,000 RWF released for Frame & Slab phase.', time: '10:30 AM', read: false },
  { id: 'n2', icon: 'construct-outline', color: '#007E6E', title: 'Inspection Passed', body: 'Site compliance check cleared for Plot KG-4.', time: '08:55 AM', read: false },
  { id: 'n3', icon: 'document-text-outline', color: '#6366f1', title: 'KYC Update Required', body: 'Please upload a certified business registration.', time: 'Yesterday', read: true },
  { id: 'n4', icon: 'warning-outline', color: '#f59e0b', title: 'Payment Pending', body: 'Milestone 2 is due for client approval release.', time: 'Yesterday', read: true },
];

export default function ChatTab({ messages, colors, onSendMessage }: Props) {
  const [activePanel, setActivePanel] = useState<'messages' | 'notifications'>('messages');
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const activeContact = MOCK_CONTACTS.find((c) => c.id === activeContactId);

  // Thread messages per contact (mock)
  const threadMessages = activeContactId ? messages : [];

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // ── CHAT THREAD VIEW ────────────────────────────────────────────────────────
  if (activeContactId && activeContact) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Thread Header */}
          <View className="flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <TouchableOpacity
              onPress={() => setActiveContactId(null)}
              className={`w-9 h-9 items-center justify-center rounded-xl ${colors.card}`}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text.includes('text-white') ? '#fff' : '#0f172a'} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className={`${colors.text} font-bold text-sm tracking-tight`}>{activeContact.name}</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <View className={`w-1.5 h-1.5 rounded-full ${activeContact.online ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                <Text className={`${colors.textMuted} text-[10px]`}>{activeContact.role}</Text>
              </View>
            </View>
            <Ionicons name="call-outline" size={18} color="#007E6E" />
          </View>

          {/* Message Bubbles */}
          <ScrollView
            className="flex-1 pt-3"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {threadMessages.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${colors.card}`}>
                  <Ionicons name="chatbubble-ellipses-outline" size={26} color="#94a3b8" />
                </View>
                <Text className={`${colors.textMuted} text-xs mt-3 text-center`}>
                  Start the project conversation with {activeContact.name}.
                </Text>
              </View>
            ) : (
              threadMessages.map((m: any) => {
                const isMe = m.sender === 'You';
                return (
                  <View
                    key={m.id}
                    className={`p-3.5 max-w-[85%] rounded-2xl mb-3 ${
                      isMe
                        ? 'bg-primary-600 self-end rounded-tr-none shadow-md shadow-primary-500/10'
                        : `${colors.card} self-start rounded-tl-none`
                    }`}
                  >
                    <Text className={`text-sm leading-relaxed ${isMe ? 'text-white' : colors.text}`}>
                      {m.text}
                    </Text>
                    <View className="flex-row justify-end items-center gap-1 mt-1">
                      {isMe && <Ionicons name="checkmark-done" size={11} color="rgba(255,255,255,0.6)" />}
                      <Text className={`text-[8px] ${isMe ? 'text-white/50' : 'text-slate-400'}`}>{m.time}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input Row */}
          <View className="flex-row items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 pb-4">
            <TextInput
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              className={`flex-1 rounded-xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              onPress={handleSend}
              className="bg-primary-600 active:bg-primary-700 p-3.5 rounded-xl items-center justify-center shadow-lg shadow-primary-500/15"
            >
              <Ionicons name="send" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── MAIN LIST VIEW ──────────────────────────────────────────────────────────
  return (
    <View className="flex-1 space-y-5 pb-6">
      {/* Screen Title */}
      <View className="space-y-0.5">
        <Text className={`${colors.text} text-2xl font-extrabold tracking-tight`}>Workspace Chat</Text>
        <Text className={`${colors.textMuted} text-xs`}>
          Communicate securely with your project team and track key activity.
        </Text>
      </View>

      {/* Panel Switcher Tabs */}
      <View className="flex-row gap-2">
        {(['messages', 'notifications'] as const).map((panel) => {
          const isActive = activePanel === panel;
          const label = panel === 'messages' ? 'Messages' : 'Notifications';
          const icon: any = panel === 'messages' ? 'chatbubbles-outline' : 'notifications-outline';
          return (
            <TouchableOpacity
              key={panel}
              onPress={() => setActivePanel(panel)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                isActive
                  ? 'bg-primary-600 border-primary-600'
                  : `${colors.card} border-slate-100 dark:border-slate-800`
              }`}
            >
              <Ionicons name={icon} size={14} color={isActive ? 'white' : '#94a3b8'} />
              <Text className={`text-xs font-bold ${isActive ? 'text-white' : colors.textMuted}`}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MESSAGES: Contact List */}
      {activePanel === 'messages' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          {MOCK_CONTACTS.length === 0 ? (
            <View className="py-16 items-center">
              <Ionicons name="people-outline" size={40} color="#94a3b8" />
              <Text className={`${colors.textMuted} text-xs mt-3 text-center`}>
                No team members assigned yet. Create a project first.
              </Text>
            </View>
          ) : (
            MOCK_CONTACTS.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => setActiveContactId(contact.id)}
                className={`flex-row items-center gap-3 p-4 rounded-xl border mb-2 active:opacity-75 ${colors.card}`}
              >
                {/* Avatar */}
                <View className="relative">
                  <View className="w-12 h-12 rounded-xl bg-primary-600 items-center justify-center">
                    <Text className="text-white font-bold text-lg">{contact.name.charAt(0)}</Text>
                  </View>
                  {contact.online && (
                    <View className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </View>

                {/* Info */}
                <View className="flex-1 space-y-0.5">
                  <View className="flex-row justify-between items-center">
                    <Text className={`${colors.text} font-bold text-sm`}>{contact.name}</Text>
                    <Text className="text-slate-400 text-[10px]">{contact.time}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className={`${colors.textMuted} text-xs flex-1`} numberOfLines={1}>
                      {contact.lastMsg}
                    </Text>
                    {contact.unread > 0 && (
                      <View className="bg-primary-600 min-w-[20px] h-5 rounded-full items-center justify-center px-1.5 ml-2">
                        <Text className="text-white text-[10px] font-bold">{contact.unread}</Text>
                      </View>
                    )}
                  </View>
                  <Text className={`${colors.textMuted} text-[10px]`}>{contact.role}</Text>
                </View>

                <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* NOTIFICATIONS: Read-Only Activity Feed */}
      {activePanel === 'notifications' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          {MOCK_NOTIFS.map((notif) => (
            <View
              key={notif.id}
              className={`flex-row gap-3 p-4 rounded-xl border mb-2 ${
                !notif.read ? `${colors.card} border-primary-500/20` : `${colors.card}`
              }`}
            >
              {/* Icon Badge */}
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${notif.color}18` }}
              >
                <Ionicons name={notif.icon as any} size={18} color={notif.color} />
              </View>

              {/* Content */}
              <View className="flex-1 space-y-0.5">
                <View className="flex-row justify-between items-center">
                  <Text className={`${colors.text} font-bold text-xs tracking-tight`}>{notif.title}</Text>
                  {!notif.read && <View className="w-2 h-2 rounded-full bg-primary-500" />}
                </View>
                <Text className={`${colors.textMuted} text-[11px] leading-relaxed`}>{notif.body}</Text>
                <Text className="text-slate-400 text-[10px] mt-1">{notif.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
