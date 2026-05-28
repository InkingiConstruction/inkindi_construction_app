/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : EngineerDashboard.tsx
 * WHAT THIS FILE DOES : iOS-style dashboard interface for Engineer users (e.g. Eric Ndayisaba)
 * HOW IT DOES IT      : Renders bottom tab navigation (Dashboard, Projects, BoQ, Messages, Profile) with Light/Dark mode
 * DATA SOURCE         : AuthContext user details and project states
 * DATA DESTINATION    : Milestone requests, chat, and profile preferences
 * PRINCIPLE APPLIED   : SOLID (Decoupled and state-driven screens)
 * ============================================================================
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Image,
  Switch 
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import TabButton from '../../components/ui/TabButton';
import LottieAnimation from '../../components/ui/LottieAnimation';

export default function EngineerDashboard() {
  const { 
    user, 
    projects, 
    mockUsers,
    theme, 
    toggleTheme, 
    handleLogout,
    updateUserProfile 
  } = useAuth();
  
  // Custom Bottom Tabs Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'boq' | 'messages' | 'profile'>('dashboard');

  // Theme support
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    card: isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/80 shadow-sm',
    text: isDark ? 'text-white font-openSans' : 'text-slate-900 font-openSans',
    textSecondary: isDark ? 'text-slate-355' : 'text-slate-855',
    textMuted: isDark ? 'text-slate-400 font-openSans' : 'text-slate-500 font-openSans',
    border: isDark ? 'border-slate-800' : 'border-slate-200',
    inputBg: isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200',
    tabBar: isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200',
    activeTab: 'text-primary-500',
  };

  // Assigned project list
  const engineerProjects = projects.filter(p => p.engineer === user?.name || p.engineer === 'Eric Ndayisaba');
  const [selectedProject, setSelectedProject] = useState(engineerProjects[0] || null);

  // States
  const [isSubmittingRFQ, setIsSubmittingRFQ] = useState(false);
  const [rfqMaterial, setRfqMaterial] = useState('');
  const [rfqQty, setRfqQty] = useState('');

  // Milestone requests
  const [milestones, setMilestones] = useState(selectedProject?.milestones || []);

  // Messages states
  const [chatText, setChatText] = useState('');
  const [messagesList, setMessagesList] = useState([
    { id: '1', sender: 'Grace (Client)', text: 'Hello Eric! Did you coordinate the steel reinforcement inspection with Aline?', time: '10:10 AM' },
    { id: '2', sender: 'You', text: 'Yes Grace, Aline verified the site bounds and inspected the foundation reinforcement rebar spacing this morning.', time: '10:15 AM' },
    { id: '3', sender: 'Aline (Supervisor)', text: 'Correct. Checklists match professional guidelines. I have submitted the certificate into the ledger.', time: '11:05 AM' },
    { id: '4', sender: 'You', text: 'Thank you Aline! Grace, the foundation milestone payout can now be safely approved.', time: '11:15 AM' },
  ]);

  // BoQ database
  const [boqItems, setBoqItems] = useState([
    { id: '1', item: 'T12 High-Yield Steel Rebars', qty: '4.5 Tons', rate: '1,200,000 RWF', total: '5,400,000 RWF', status: 'PURCHASED' },
    { id: '2', item: 'Cem-V Kigali Cement Bags (42.5N)', qty: '650 Bags', rate: '14,500 RWF', total: '9,425,000 RWF', status: 'PURCHASED' },
    { id: '3', item: 'River Sand Premium Grade', qty: '120 Cubics', rate: '25,000 RWF', total: '3,000,000 RWF', status: 'DELIVERED' },
    { id: '4', item: 'Volcanic Gravel (20mm aggregate)', qty: '80 Cubics', rate: '35,000 RWF', total: '2,800,000 RWF', status: 'DELIVERED' },
    { id: '5', item: 'Pre-Painted G28 Roofing Sheets', qty: '150 Sheets', rate: '18,500 RWF', total: '2,775,000 RWF', status: 'RFQ_PENDING' },
  ]);

  const handleSendMessage = () => {
    if (!chatText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessagesList(prev => [...prev, newMessage]);
    setChatText('');
  };

  const handleRequestMilestoneInspection = (index: number, name: string) => {
    Alert.alert(
      'Request Milestone Approval',
      `Submit a structural certification request to supervisor for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: () => {
            const updated = [...milestones];
            updated[index].status = 'PENDING';
            setMilestones(updated);
            Alert.alert('Request Sent', 'Site inspection request issued to Supervisor Aline Mukamana.');
          } 
        }
      ]
    );
  };

  return (
    <View className={`flex-1 ${colors.bg}`}>
      
      {/* Dynamic Header */}
      <View className={`px-6 pt-14 pb-4 flex-row justify-between items-center ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'}`}>
        <View className="flex-row items-center gap-3">
          {user?.profilePic ? (
            <Image 
              source={{ uri: user.profilePic }} 
              className="w-10 h-10 rounded-full border border-emerald-500" 
            />
          ) : (
            <View className="w-10 h-10 bg-emerald-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-base">{(user?.name || 'U').charAt(0)}</Text>
            </View>
          )}
          <View>
            <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Engineer Desk</Text>
            <Text className={`${colors.text} text-base font-bold`}>{user?.name}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-red-500 text-xs font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Scroll View Area */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        
        {/* ================= TAB: DASHBOARD ================= */}
        {currentTab === 'dashboard' && (
          <View className="space-y-4">
            {/* Quick Metrics */}
            <View className="flex-row gap-3">
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Active Sites</Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>{engineerProjects.length}</Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Active RFQs</Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>1 Pending</Text>
              </View>
            </View>
            
            {/* Today's Focus Build Card */}
            {selectedProject ? (
              <View className={`p-5 rounded-3xl border ${colors.card} flex-row justify-between items-center`}>
                <View className="flex-1 pr-2 space-y-1">
                  <Text className={`${colors.textMuted} text-xs font-bold uppercase`}>Project Focused</Text>
                  <Text className={`${colors.text} text-base font-bold mt-0.5`}>{selectedProject.name}</Text>
                  <Text className={`${colors.textMuted} text-xs mt-0.5`}>📍 {selectedProject.location}</Text>
                  
                  <View className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden my-2">
                    <View className="h-full bg-primary-500" style={{ width: `${selectedProject.progress}%` }} />
                  </View>
 
                  <View className="flex-row justify-between items-center bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-xl mt-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs">🤵</Text>
                      <View>
                        <Text className={`${colors.textMuted} text-[8px] font-bold uppercase`}>Client / Investor</Text>
                        <Text className={`${colors.text} text-[11px] font-bold`}>{selectedProject.client}</Text>
                      </View>
                    </View>
                    <View className="bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                      <Text className="text-primary-500 text-[10px] font-bold">{selectedProject.progress}% Done</Text>
                    </View>
                  </View>
                </View>
                <LottieAnimation type="construction" size={80} />
              </View>
            ) : null}
          </View>
        )}

        {/* ================= TAB: PROJECTS / MILESTONES ================= */}
        {currentTab === 'projects' && (
          <View className="space-y-4">
            <Text className={`${colors.text} text-lg font-bold mb-2`}>Milestones Certifications</Text>
            {milestones.map((m, idx) => (
              <View 
                key={idx} 
                className={`p-4 rounded-2xl border ${colors.card}`}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1 pr-2">
                    <Text className={`${colors.text} font-bold text-sm`}>{m.name}</Text>
                    <Text className={`${colors.textMuted} text-xs mt-0.5`}>Budget Allocation: {m.pct}% ({((selectedProject?.budget || 0) * m.pct / 100).toLocaleString()} RWF)</Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded border ${
                    m.status === 'PAID' 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : m.status === 'PENDING'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <Text className={`text-[10px] font-bold uppercase ${
                      m.status === 'PAID' ? 'text-emerald-500' : m.status === 'PENDING' ? 'text-amber-500' : colors.textMuted
                    }`}>
                      {m.status}
                    </Text>
                  </View>
                </View>

                {m.status === 'PENDING' && (
                  <View className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-2">
                    <TouchableOpacity 
                      onPress={() => handleRequestMilestoneInspection(idx, m.name)}
                      className="bg-emerald-500/10 border border-emerald-500/25 py-2 rounded-lg items-center"
                    >
                      <Text className="text-emerald-500 text-xs font-bold">Request Inspection Cert</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB: BOQ SPREADSHEET ================= */}
        {currentTab === 'boq' && (
          <View className="space-y-4">
            <Text className={`${colors.text} text-lg font-bold mb-1`}>Bill of Quantities (BoQ)</Text>
            
            <View className={`p-4 rounded-2xl border ${colors.card} space-y-3`}>
              {boqItems.map(item => (
                <View 
                  key={item.id} 
                  className="pb-3 border-b border-slate-150 dark:border-slate-700/60 last:border-b-0 space-y-1.5"
                >
                  <View className="flex-row justify-between items-start">
                    <Text className={`${colors.text} font-bold text-xs flex-1 pr-2`}>{item.item}</Text>
                    <View className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                      <Text className={`${colors.textMuted} text-[9px] font-bold`}>{item.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between text-[11px]">
                    <Text className={colors.textMuted}>Qty: {item.qty} | Rate: {item.rate}</Text>
                    <Text className={`${colors.text} font-semibold`}>Total: {item.total}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB: MESSAGES ================= */}
        {currentTab === 'messages' && (
          <View className="space-y-4">
            <View className={`p-4 rounded-2xl border ${colors.card} h-96 flex-col justify-between`}>
              <ScrollView showsVerticalScrollIndicator={false} className="space-y-3 flex-1 pr-1">
                {messagesList.map(msg => (
                  <View 
                    key={msg.id} 
                    className={`p-3 rounded-2xl max-w-[80%] ${
                      msg.sender === 'You' 
                        ? 'bg-emerald-600 self-end rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-700/50 self-start rounded-tl-none'
                    }`}
                  >
                    <Text className={`${colors.textMuted} text-[9px] font-bold mb-0.5`}>{msg.sender}</Text>
                    <Text className={`text-xs ${msg.sender === 'You' ? 'text-white' : colors.text}`}>{msg.text}</Text>
                    <Text className={`text-[8px] text-right mt-1 ${msg.sender === 'You' ? 'text-emerald-250' : colors.textMuted}`}>{msg.time}</Text>
                  </View>
                ))}
              </ScrollView>

              <View className="flex-row gap-2 border-t border-slate-100 dark:border-slate-700 pt-3 mt-2">
                <TextInput
                  value={chatText}
                  onChangeText={setChatText}
                  placeholder="Type message to client / supervisor..."
                  placeholderTextColor="#94a3b8"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs ${colors.inputBg} ${colors.text}`}
                />
                <TouchableOpacity 
                  onPress={handleSendMessage}
                  className="bg-emerald-600 px-4 py-2.5 rounded-xl justify-center items-center"
                >
                  <Text className="text-white font-bold text-xs">Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB: PROFILE ================= */}
        {currentTab === 'profile' && (
          <View className="space-y-4">
            {/* User Meta Card */}
            <View className={`p-5 rounded-3xl border ${colors.card} items-center`}>
              {user?.profilePic ? (
                <Image 
                  source={{ uri: user.profilePic }} 
                  className="w-20 h-20 rounded-full border-2 border-emerald-500 mb-3" 
                />
              ) : null}
              <Text className={`${colors.text} text-lg font-bold`}>{user?.name}</Text>
              <Text className={`${colors.textMuted} text-xs`}>{user?.email}</Text>
              <Text className="text-[10px] bg-slate-100 dark:bg-slate-900 px-3 py-1 text-slate-500 rounded-full mt-2 font-mono">
                IER License: #IER-RW-8821
              </Text>
            </View>

            {/* Profile Preferences */}
            <View className={`p-5 rounded-3xl border ${colors.card} space-y-4`}>
              <Text className={`${colors.text} font-bold text-sm mb-1`}>Settings</Text>
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className={`${colors.text} text-xs font-semibold`}>Dark Mode Theme</Text>
                  <Text className={`${colors.textMuted} text-[10px]`}>Toggle dark mode visual workspace</Text>
                </View>
                <Switch 
                  value={theme === 'dark'} 
                  onValueChange={toggleTheme} 
                  trackColor={{ true: '#10b981', false: '#cbd5e1' }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl items-center"
            >
              <Text className="text-red-500 font-bold text-sm">Logout</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* iOS style custom bottom navigation */}
      <View className="absolute bottom-4 left-0 right-0">
        <View className="mx-6 bg-[#007E6E] rounded-full flex-row justify-around items-center h-16 shadow-lg">
        <TabButton
          label="Dash"
          iconName="home-outline"
          activeIconName="home"
          isActive={currentTab === 'dashboard'}
          onPress={() => setCurrentTab('dashboard')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="Builds"
          iconName="construct-outline"
          activeIconName="construct"
          isActive={currentTab === 'projects'}
          onPress={() => setCurrentTab('projects')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="BoQ"
          iconName="document-text-outline"
          activeIconName="document-text"
          isActive={currentTab === 'boq'}
          onPress={() => setCurrentTab('boq')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="Chat"
          iconName="chatbubbles-outline"
          activeIconName="chatbubbles"
          isActive={currentTab === 'messages'}
          onPress={() => setCurrentTab('messages')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="User"
          iconName="person-outline"
          activeIconName="person"
          isActive={currentTab === 'profile'}
          onPress={() => setCurrentTab('profile')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        </View>
      </View>
    </View>
  );
}
