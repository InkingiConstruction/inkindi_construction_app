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
    text: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-350' : 'text-slate-850',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    border: isDark ? 'border-slate-800' : 'border-slate-200',
    inputBg: isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200',
    tabBar: isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200',
    activeTab: 'text-emerald-500',
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
              <View className={`p-5 rounded-3xl border ${colors.card}`}>
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className={`${colors.textMuted} text-xs font-bold uppercase`}>Project Focused</Text>
                    <Text className={`${colors.text} text-base font-bold mt-0.5`}>{selectedProject.name}</Text>
                    <Text className={`${colors.textMuted} text-xs mt-0.5`}>📍 {selectedProject.location}</Text>
                  </View>
                  <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    <Text className="text-emerald-500 text-xs font-bold">{selectedProject.progress}%</Text>
                  </View>
                </View>
                
                <View className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <View className="h-full bg-emerald-500" style={{ width: `${selectedProject.progress}%` }} />
                </View>

                <View className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl flex-row justify-between items-center mt-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm">🤵</Text>
                    <View>
                      <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Client / Investor</Text>
                      <Text className={`${colors.text} text-xs font-bold`}>{selectedProject.client}</Text>
                    </View>
                  </View>
                </View>
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

                {m.status === 'UNSTARTED' && (
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

            {/* Verification bypass */}
            <View className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-3xl space-y-3">
              <Text className="text-blue-500 font-bold text-sm">🛠 Admin & KYC Simulation Desk</Text>
              <Text className="text-slate-500 text-[11px] leading-4">
                Instantly toggle the KYC verification status of your engineer account to test how the screen routing gates behave:
              </Text>
              
              <View className="flex-row flex-wrap gap-2 pt-1">
                {(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => updateUserProfile({ kycStatus: status })}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      user?.kycStatus === status 
                        ? 'bg-blue-500 border-blue-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <Text className={user?.kycStatus === status ? 'text-white text-[11px] font-bold' : 'text-slate-700 text-[11px]'}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-slate-500 font-semibold text-[11px] pt-3">Seeded Mock Users Reference:</Text>
              <View className="bg-slate-200/50 p-2.5 rounded-xl space-y-1">
                {mockUsers.map(u => (
                  <Text key={u.id} className="text-[10px] text-slate-700 font-mono">
                    • {u.role}: <Text className="font-bold">{u.email}</Text> | {u.password} ({u.name})
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* iOS style custom bottom navigation */}
      <View className={`border-t flex-row justify-around items-center h-20 shadow-lg absolute bottom-0 left-0 right-0 ${colors.tabBar}`}>
        <TouchableOpacity 
          onPress={() => setCurrentTab('dashboard')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'dashboard' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>Dash</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('projects')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'projects' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>Builds</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('boq')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'boq' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>BoQ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('messages')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'messages' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('profile')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'profile' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
