/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SupervisorDashboard.tsx
 * WHAT THIS FILE DOES : iOS-style dashboard interface for Supervisor users (e.g. Aline Mukamana)
 * HOW IT DOES IT      : Renders bottom tab navigation (Dashboard, Inspections, Projects, Profile) with Light/Dark mode
 * DATA SOURCE         : AuthContext user details and project states
 * DATA DESTINATION    : Quality inspection certificates and profile preferences
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

export default function SupervisorDashboard() {
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
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inspections' | 'projects' | 'profile'>('dashboard');

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

  // Simulated inspection details
  const [gpsCheckedIn, setGpsCheckedIn] = useState(false);
  const [isCheckingGps, setIsCheckingGps] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [check4, setCheck4] = useState(false);
  const [notes, setNotes] = useState('');
  const [signatureUri, setSignatureUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGPSCheckIn = () => {
    setIsCheckingGps(true);
    setTimeout(() => {
      setIsCheckingGps(false);
      setGpsCheckedIn(true);
      Alert.alert(
        'GPS Boundary Verified',
        'Device telemetry successfully checked in inside project boundary polygon (Accuracy: 4 meters).',
        [{ text: 'Proceed to Checklist' }]
      );
      setCurrentTab('inspections');
    }, 1500);
  };

  const handleSubmitReport = () => {
    if (!check1 || !check2 || !check3 || !check4) {
      Alert.alert('Incomplete Form', 'All core checklist items must be verified before submitting quality report.');
      return;
    }
    if (!signatureUri) {
      Alert.alert('Signature required', 'Please sign the digital certificate to authorize.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Report Certified!',
        'Digital quality report has been signed, encrypted, and uploaded to the immutable audit trail.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset
              setGpsCheckedIn(false);
              setCheck1(false);
              setCheck2(false);
              setCheck3(false);
              setCheck4(false);
              setNotes('');
              setSignatureUri('');
              setCurrentTab('dashboard');
            } 
          }
        ]
      );
    }, 1500);
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
            <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Supervisor Desk</Text>
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
            <View className={`p-5 rounded-3xl border ${colors.card}`}>
              <Text className={`${colors.textMuted} text-xs font-bold uppercase mb-1`}>Next Inspection Task</Text>
              <Text className={`${colors.text} text-lg font-bold`}>Kicukiro Family Home</Text>
              <Text className={`${colors.textMuted} text-xs mt-0.5`}>Milestone: Framing & Masonry inspection</Text>
              
              <View className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl my-4 space-y-1.5">
                <Text className={`${colors.textMuted} text-[10px] font-bold uppercase`}>Location Details</Text>
                <Text className={`${colors.text} text-xs font-semibold`}>📍 Kicukiro Sector, Kigali</Text>
                <Text className={`${colors.textMuted} text-[10px]`}>Site GPS match coordinates are required to unlock audit certificate form.</Text>
              </View>

              {gpsCheckedIn ? (
                <TouchableOpacity 
                  onPress={() => setCurrentTab('inspections')}
                  className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 items-center"
                >
                  <Text className="text-white font-bold text-sm">✓ Open Quality Checklist</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={handleGPSCheckIn}
                  disabled={isCheckingGps}
                  className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 items-center flex-row justify-center"
                >
                  {isCheckingGps ? (
                    <ActivityIndicator color="#white" size="small" className="mr-2" />
                  ) : null}
                  <Text className="text-white font-bold text-sm">📍 Verify GPS Site Boundary Check-in</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ================= TAB: INSPECTION FORM ================= */}
        {currentTab === 'inspections' && (
          <View className="space-y-4">
            {!gpsCheckedIn ? (
              <View className={`p-5 rounded-3xl border ${colors.card} items-center`}>
                <Text className="text-3xl mb-2">🔒</Text>
                <Text className={`${colors.text} font-bold text-sm text-center mb-1`}>Location Check-In Locked</Text>
                <Text className={`${colors.textMuted} text-xs text-center px-4 mb-4`}>
                  You must complete a physical GPS check-in boundary test at the construction site first.
                </Text>
                <TouchableOpacity 
                  onPress={() => setCurrentTab('dashboard')}
                  className="bg-emerald-600/10 border border-emerald-500/25 px-4 py-2 rounded-xl"
                >
                  <Text className="text-emerald-500 font-bold text-xs">Verify GPS Bounds</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className={`p-5 rounded-3xl border ${colors.card} space-y-4`}>
                <Text className={`${colors.text} font-extrabold text-base mb-2`}>Inspecting: Kicukiro Build</Text>
                
                <View className="space-y-3">
                  <View className="flex-row items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Text className={`${colors.textSecondary} text-xs font-semibold flex-1 pr-2`}>Foundation depth meets specifications?</Text>
                    <Switch value={check1} onValueChange={setCheck1} trackColor={{ true: '#10b981' }} />
                  </View>

                  <View className="flex-row items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Text className={`${colors.textSecondary} text-xs font-semibold flex-1 pr-2`}>Reinforcement bars correctly spaced?</Text>
                    <Switch value={check2} onValueChange={setCheck2} trackColor={{ true: '#10b981' }} />
                  </View>

                  <View className="flex-row items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Text className={`${colors.textSecondary} text-xs font-semibold flex-1 pr-2`}>Concrete mixture matches BoQ standard?</Text>
                    <Switch value={check3} onValueChange={setCheck3} trackColor={{ true: '#10b981' }} />
                  </View>

                  <View className="flex-row items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Text className={`${colors.textSecondary} text-xs font-semibold flex-1 pr-2`}>Waterproofing properly applied?</Text>
                    <Switch value={check4} onValueChange={setCheck4} trackColor={{ true: '#10b981' }} />
                  </View>
                </View>

                <View>
                  <Text className={`${colors.text} text-xs font-bold mb-2 ml-1`}>Observations / Notes</Text>
                  <TextInput
                    className={`border text-xs rounded-xl px-4 py-3 ${colors.inputBg} ${colors.text}`}
                    placeholder="Write any comments regarding quality, materials, or fixes..."
                    placeholderTextColor="#94a3b8"
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>

                {/* Digital Signature Drawing Pad */}
                <View className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                  <Text className={`${colors.text} text-xs font-bold mb-3`}>Digitally Sign Certification</Text>
                  
                  {signatureUri ? (
                    <View className="flex-row justify-between items-center bg-slate-200 dark:bg-slate-950 p-3 rounded-lg border border-emerald-500/20">
                      <Text className="text-emerald-500 font-bold text-xs">✓ Signature Certificate Captured</Text>
                      <TouchableOpacity onPress={() => setSignatureUri('')}>
                        <Text className="text-red-500 text-xs">Reset</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setSignatureUri('https://res.cloudinary.com/demo/image/upload/signature')}
                      className="bg-white dark:bg-slate-950 h-24 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl items-center justify-center"
                    >
                      <Text className={`${colors.textMuted} text-xs font-bold`}>✍ Tap to Draw/Simulate Digital Signature</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  onPress={handleSubmitReport}
                  disabled={isSubmitting}
                  className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 items-center flex-row justify-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#white" size="small" className="mr-2" />
                  ) : null}
                  <Text className="text-white font-bold text-sm">Certify & Submit Inspection Report</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB: PROJECTS ================= */}
        {currentTab === 'projects' && (
          <View className="space-y-4">
            <Text className={`${colors.text} text-lg font-bold mb-2`}>Assigned Inspection Sites</Text>
            {projects.map((proj, idx) => (
              <View 
                key={idx} 
                className={`p-4 rounded-2xl border ${colors.card}`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className={`${colors.text} font-bold text-sm`}>{proj.name}</Text>
                    <Text className={`${colors.textMuted} text-xs mt-0.5`}>📍 {proj.location}</Text>
                  </View>
                  <View className="bg-emerald-500/10 px-2 py-0.5 rounded">
                    <Text className="text-emerald-500 text-[10px] font-bold">{proj.progress}% Done</Text>
                  </View>
                </View>
                <Text className={`${colors.textMuted} text-[11px] mt-1`}>Engineer: {proj.engineer} | Client: {proj.client}</Text>
              </View>
            ))}
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
                License ID: #IER-SP-0021
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
                Instantly toggle the KYC verification status of your supervisor account to test how the screen routing gates behave:
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
          onPress={() => setCurrentTab('inspections')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'inspections' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>Inspect</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('projects')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'projects' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>Sites</Text>
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
