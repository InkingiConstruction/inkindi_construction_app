/**
 * FILE NAME   : ChatTab.tsx
 * WHAT THIS FILE DOES : Professional chat interface with real-time messaging,
 *                       contact list, and notification center.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  read: boolean;
  delivered: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  typing?: boolean;
}

interface Notification {
  id: string;
  type: 'message' | 'milestone' | 'payment' | 'inspection' | 'system';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  action?: string;
  metadata?: any;
}

interface Props {
  colors: DashColors;
  currentUserId: string;
  currentUserName: string;
  onSendMessage?: (contactId: string, message: string) => void;
  onMarkAsRead?: (messageId: string) => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Contact[] = [
  { 
    id: '1', 
    name: 'Aline Mukamana', 
    role: 'Project Supervisor', 
    online: true, 
    unreadCount: 2,
    lastMessage: 'Foundation phase approved ✓',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
  },
  { 
    id: '2', 
    name: 'Jean Bosco', 
    role: 'Structural Engineer', 
    online: false, 
    lastSeen: new Date(Date.now() - 1000 * 60 * 45),
    unreadCount: 0,
    lastMessage: 'Waiting for permits from KCC',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 120),
  },
  { 
    id: '3', 
    name: 'Inkingi Support', 
    role: 'Platform Support', 
    online: true, 
    unreadCount: 1,
    lastMessage: 'Your KYC is under review.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  { 
    id: '4', 
    name: 'Marie Uwase', 
    role: 'Electrical Engineer', 
    online: false, 
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
    unreadCount: 0,
    lastMessage: 'Electrical plans submitted for review',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 180),
  },
  { 
    id: '5', 
    name: 'Emmanuel Habimana', 
    role: 'Site Inspector', 
    online: true, 
    unreadCount: 3,
    lastMessage: 'Site inspection scheduled for tomorrow',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 45),
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'milestone',
    title: 'Milestone Released',
    body: '12,000,000 RWF has been released for "Foundation Phase".',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message from Aline',
    body: 'Can you review the updated foundation plans?',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: false,
  },
  {
    id: '3',
    type: 'inspection',
    title: 'Inspection Passed',
    body: 'Site compliance check cleared for Plot KG-4.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: true,
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Confirmed',
    body: 'Your payment of 5,000,000 RWF has been processed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'KYC Update Required',
    body: 'Please upload your certified business registration.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
];

// ─── Helper Components ───────────────────────────────────────────────────────

const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

const formatLastSeen = (date?: Date): string => {
  if (!date) return 'Offline';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Online now';
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  if (hours < 24) return `Last seen ${hours}h ago`;
  if (days < 7) return `Last seen ${days}d ago`;
  return `Last seen ${date.toLocaleDateString()}`;
};

// ─── Chat Thread Component ───────────────────────────────────────────────────

const ChatThread = ({
  contact,
  messages,
  currentUserId,
  currentUserName,
  onSendMessage,
  onBack,
  colors,
}: {
  contact: Contact;
  messages: Message[];
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  colors: DashColors;
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setIsTyping(false);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === currentUserId;
    return (
      <View
        style={{
          alignItems: isMine ? 'flex-end' : 'flex-start',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            maxWidth: '80%',
            backgroundColor: isMine ? '#007E6E' : '#F1F5F9',
            borderRadius: 20,
            borderTopRightRadius: isMine ? 4 : 20,
            borderTopLeftRadius: isMine ? 20 : 4,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          {!isMine && (
            <Text style={{ fontSize: 11, color: '#64748B', marginBottom: 3, fontWeight: '500' }}>
              {item.senderName}
            </Text>
          )}
          <Text
            style={{
              fontSize: 14,
              color: isMine ? '#FFFFFF' : '#1E293B',
              lineHeight: 20,
            }}
          >
            {item.text}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: 4,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                color: isMine ? 'rgba(255,255,255,0.6)' : '#94A3B8',
              }}
            >
              {formatMessageTime(item.timestamp)}
            </Text>
            {isMine && item.delivered && (
              <Ionicons
                name={item.read ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={item.read ? '#10B981' : 'rgba(255,255,255,0.6)'}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: 8, marginLeft: -8 }}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>
            {contact.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: contact.online ? '#10B981' : '#94A3B8',
              }}
            />
            <Text style={{ fontSize: 11, color: '#64748B' }}>
              {contact.online ? 'Online' : formatLastSeen(contact.lastSeen)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="call-outline" size={22} color="#007E6E" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="videocam-outline" size={22} color="#007E6E" />
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={32} color="#94A3B8" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 }}>
              No messages yet
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
              Start the conversation with {contact.name}
            </Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <View
            style={{
              backgroundColor: '#F1F5F9',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 11, color: '#64748B' }}>{contact.name} is typing...</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        }}
      >
        <TouchableOpacity style={{ padding: 4 }}>
          <Ionicons name="add-circle-outline" size={28} color="#64748B" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === 'ios' ? 12 : 8,
          }}
        >
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              handleTyping();
            }}
            style={{ flex: 1, fontSize: 14, color: '#1E293B', padding: 0 }}
            multiline
          />
          <TouchableOpacity onPress={handleSend} disabled={!inputText.trim()}>
            <Ionicons
              name="send"
              size={22}
              color={inputText.trim() ? '#007E6E' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Notifications Panel Component ───────────────────────────────────────────

const NotificationsPanel = ({ colors }: { colors: DashColors }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'message': return 'chatbubble-outline';
      case 'milestone': return 'flag-outline';
      case 'payment': return 'wallet-outline';
      case 'inspection': return 'clipboard-outline';
      default: return 'notifications-outline';
    }
  };

  const getColorForType = (type: Notification['type']) => {
    switch (type) {
      case 'message': return '#3B82F6';
      case 'milestone': return '#10B981';
      case 'payment': return '#F59E0B';
      case 'inspection': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
          Notifications
        </Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ fontSize: 12, color: '#007E6E', fontWeight: '500' }}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {(['all', 'unread'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: filter === f ? '#007E6E' : '#F1F5F9',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: filter === f ? '#FFFFFF' : '#64748B',
              }}
            >
              {f === 'all' ? 'All' : 'Unread'}
              {f === 'unread' && notifications.filter(n => !n.read).length > 0 && (
                <Text style={{ marginLeft: 4 }}> ({notifications.filter(n => !n.read).length})</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markAsRead(item.id)}
            style={{
              backgroundColor: item.read ? '#FFFFFF' : '#F0FDF4',
              borderRadius: 12,
              padding: 14,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: item.read ? '#E2E8F0' : '#A7F3D0',
            }}
          >
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${getColorForType(item.type)}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={getIconForType(item.type)}
                  size={20}
                  color={getColorForType(item.type)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#007E6E',
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 18 }}>
                  {item.body}
                </Text>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 6 }}>
                  {formatMessageTime(item.timestamp)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
            <Text style={{ fontSize: 14, color: '#64748B', marginTop: 12, textAlign: 'center' }}>
              No notifications yet
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChatTab({ colors, currentUserId, currentUserName, onSendMessage, onMarkAsRead }: Props) {
  const [activePanel, setActivePanel] = useState<'messages' | 'notifications'>('messages');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize some mock messages
  useEffect(() => {
    const initialMessages: Record<string, Message[]> = {
      '1': [
        {
          id: 'm1',
          text: 'Hello Aline, how is the foundation work progressing?',
          senderId: currentUserId,
          senderName: currentUserName,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: true,
          delivered: true,
        },
        {
          id: 'm2',
          text: 'The foundation phase is 80% complete. We should be done by Friday.',
          senderId: '1',
          senderName: 'Aline Mukamana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
          read: true,
          delivered: true,
        },
        {
          id: 'm3',
          text: 'Great! I\'ll come by for an inspection on Saturday.',
          senderId: currentUserId,
          senderName: currentUserName,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          delivered: true,
        },
      ],
      '2': [
        {
          id: 'm4',
          text: 'Jean, have you submitted the structural calculations?',
          senderId: currentUserId,
          senderName: currentUserName,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          read: true,
          delivered: true,
        },
        {
          id: 'm5',
          text: 'Yes, I submitted them yesterday. Still waiting for KCC permit approval.',
          senderId: '2',
          senderName: 'Jean Bosco',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          read: true,
          delivered: true,
        },
      ],
    };
    setMessages(initialMessages);
  }, [currentUserId, currentUserName]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (text: string) => {
    if (!activeContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date(),
      read: false,
      delivered: true,
    };

    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage],
    }));

    // Update contact's last message
    setContacts(prev =>
      prev.map(c =>
        c.id === activeContact.id
          ? { ...c, lastMessage: text, lastMessageTime: new Date() }
          : c
      )
    );

    if (onSendMessage) {
      onSendMessage(activeContact.id, text);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    // Mark messages as read
    setContacts(prev =>
      prev.map(c =>
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      )
    );
    setActiveContact(contact);
  };

  // Chat Thread View
  if (activeContact) {
    const contactMessages = messages[activeContact.id] || [];
    return (
      <ChatThread
        contact={activeContact}
        messages={contactMessages}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onSendMessage={handleSendMessage}
        onBack={() => setActiveContact(null)}
        colors={colors}
      />
    );
  }

  // Main List View
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 }}>
            Messages
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B' }}>
            Communicate with your project team
          </Text>
        </View>

        {/* Panel Switcher */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setActivePanel('messages')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: activePanel === 'messages' ? '#007E6E' : '#FFFFFF',
              borderWidth: 1,
              borderColor: activePanel === 'messages' ? '#007E6E' : '#E2E8F0',
            }}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={18}
              color={activePanel === 'messages' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activePanel === 'messages' ? '#FFFFFF' : '#64748B',
              }}
            >
              Chats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActivePanel('notifications')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: activePanel === 'notifications' ? '#007E6E' : '#FFFFFF',
              borderWidth: 1,
              borderColor: activePanel === 'notifications' ? '#007E6E' : '#E2E8F0',
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={activePanel === 'notifications' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activePanel === 'notifications' ? '#FFFFFF' : '#64748B',
              }}
            >
              Notifications
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {activePanel === 'messages' && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 16,
            }}
          >
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Search conversations..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Messages Panel */}
      {activePanel === 'messages' && (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item: contact }) => (
            <TouchableOpacity
              onPress={() => handleSelectContact(contact)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: '#FFFFFF',
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              {/* Avatar */}
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#007E6E',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>
                    {contact.name.charAt(0)}
                  </Text>
                </View>
                {contact.online && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#10B981',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}
                  />
                )}
              </View>

              {/* Content */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B' }}>
                    {contact.name}
                  </Text>
                  {contact.lastMessageTime && (
                    <Text style={{ fontSize: 10, color: '#94A3B8' }}>
                      {formatMessageTime(contact.lastMessageTime)}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }} numberOfLines={1}>
                  {contact.lastMessage || 'Start a conversation'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Text style={{ fontSize: 10, color: '#94A3B8' }}>{contact.role}</Text>
                  {contact.unreadCount > 0 && (
                    <View
                      style={{
                        backgroundColor: '#007E6E',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' }}>
                        {contact.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <Ionicons name="chatbubbles-outline" size={48} color="#94A3B8" />
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 12, textAlign: 'center' }}>
                No conversations found
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Notifications Panel */}
      {activePanel === 'notifications' && (
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <NotificationsPanel colors={colors} />
        </View>
      )}
    </View>
  );
}