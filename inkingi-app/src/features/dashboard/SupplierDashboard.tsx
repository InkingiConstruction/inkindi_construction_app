/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SupplierDashboard.tsx
 * WHAT THIS FILE DOES : iOS-style dashboard interface for Supplier users (e.g. Kigali Steel Depot)
 * HOW IT DOES IT      : Renders bottom tab navigation (Dashboard, RFQs, Deliveries, Profile) with Light/Dark mode
 * DATA SOURCE         : AuthContext user details, RFQs lists
 * DATA DESTINATION    : Quote bids, Proof of Delivery uploads, and profile preferences
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

export default function SupplierDashboard() {
  const { 
    user, 
    rfqs, 
    mockUsers,
    theme, 
    toggleTheme, 
    handleLogout,
    updateUserProfile 
  } = useAuth();
  
  // Custom Bottom Tabs Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'rfqs' | 'deliveries' | 'profile'>('dashboard');

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

  // RFQ and Deliveries states
  const [quotePrice, setQuotePrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isReportingDelivery, setIsReportingDelivery] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [proofUri, setProofUri] = useState('');
  const [submittedQuotes, setSubmittedQuotes] = useState<string[]>([]);

  const handleQuoteSubmit = (rfqId: string, material: string) => {
    if (!quotePrice) {
      Alert.alert('Price required', 'Please input a total quote amount in RWF.');
      return;
    }

    setIsSubmittingQuote(true);
    setTimeout(() => {
      setIsSubmittingQuote(false);
      setSubmittedQuotes(prev => [...prev, rfqId]);
      setQuotePrice('');
      Alert.alert(
        'Quote Proposal Submitted!',
        `Your bid has been submitted successfully. Engineer notified to compare quotes.`,
        [{ text: 'Super' }]
      );
    }, 1500);
  };

  const handleMarkDelivered = () => {
    if (!proofUri) {
      Alert.alert('Proof required', 'Please capture or upload Proof of Delivery (PoD) photo first.');
      return;
    }

    setIsReportingDelivery(true);
    setTimeout(() => {
      setIsReportingDelivery(false);
      setDeliveryConfirmed(true);
      Alert.alert(
        'Delivery Confirmed',
        'GPS location verified within project boundary. Escrow release webhook triggered successfully (Payout within 48h).',
        [{ text: 'Excellent' }]
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
            <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Supplier Operations</Text>
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
            <View className="flex-row gap-3">
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Incoming RFQs</Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>{rfqs.length}</Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Active Deliveries</Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>{deliveryConfirmed ? '0' : '1'}</Text>
              </View>
            </View>

            <View className={`p-5 rounded-3xl border ${colors.card}`}>
              <Text className={`${colors.textMuted} text-xs font-bold uppercase mb-1`}>Procurement Status</Text>
              <Text className={`${colors.text} text-base font-bold`}>Kigali General Hardware Escrow Partner</Text>
              <Text className={`${colors.textMuted} text-xs mt-0.5`}>All payouts are instantly collateralized inside smart contracts.</Text>
            </View>
          </View>
        )}

        {/* ================= TAB: RFQS INBOX ================= */}
        {currentTab === 'rfqs' && (
          <View className="space-y-4">
            <Text className={`${colors.text} text-lg font-bold mb-2`}>Procurement Bids (RFQs)</Text>
            {rfqs.map(rfq => {
              const hasBid = submittedQuotes.includes(rfq.id);

              return (
                <View 
                  key={rfq.id}
                  className={`p-4 rounded-2xl border ${colors.card}`}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-2">
                      <Text className={`${colors.textMuted} text-[10px] font-bold uppercase`}>{rfq.project}</Text>
                      <Text className={`${colors.text} font-bold text-sm mt-0.5`}>{rfq.material}</Text>
                      <Text className={`${colors.textMuted} text-xs mt-0.5`}>Required Quantity: {rfq.quantity}</Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded border ${
                      hasBid 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-emerald-600/10 border-emerald-500/20'
                    }`}>
                      <Text className="text-emerald-500 text-[10px] font-bold">{hasBid ? '✓ Bid Submitted' : 'Active'}</Text>
                    </View>
                  </View>

                  {!hasBid ? (
                    <View className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 mt-2">
                      <Text className={`${colors.text} text-xs font-bold ml-1`}>Submit Your Bid Offer</Text>
                      
                      <View className="flex-row gap-2">
                        <TextInput
                          className={`rounded-xl px-4 py-2.5 text-xs flex-1 ${colors.inputBg} ${colors.text}`}
                          placeholder="Price in RWF"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          value={quotePrice}
                          onChangeText={setQuotePrice}
                        />
                        <TextInput
                          className={`rounded-xl px-4 py-2.5 text-xs w-28 text-center ${colors.inputBg} ${colors.text}`}
                          placeholder="Days (e.g. 3)"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          value={deliveryDays}
                          onChangeText={setDeliveryDays}
                        />
                      </View>

                      <TouchableOpacity 
                        onPress={() => handleQuoteSubmit(rfq.id, rfq.material)}
                        disabled={isSubmittingQuote}
                        className="bg-emerald-600 active:bg-emerald-700 py-3 rounded-xl border border-emerald-500 items-center justify-center flex-row"
                      >
                        {isSubmittingQuote ? (
                          <ActivityIndicator color="#white" size="small" className="mr-2" />
                        ) : null}
                        <Text className="text-white font-bold text-xs">Submit Quote Proposal</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 items-center mt-2">
                      <Text className="text-emerald-500 text-xs font-bold">Proposal successfully sent and locked.</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ================= TAB: DELIVERIES ================= */}
        {currentTab === 'deliveries' && (
          <View className="space-y-4">
            <View className={`p-5 rounded-3xl border ${colors.card}`}>
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className={`${colors.textMuted} text-xs font-bold uppercase`}>Villa Nyarutarama</Text>
                  <Text className={`${colors.text} text-base font-bold mt-0.5`}>Roofing sheets delivery</Text>
                  <Text className={`${colors.textMuted} text-xs mt-0.5`}>Quantity: 120 Sheets</Text>
                </View>
                <View className="bg-emerald-650/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Text className="text-emerald-500 text-[10px] font-bold">Awarded PO</Text>
                </View>
              </View>

              <View className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl mb-4 space-y-2 border border-slate-200 dark:border-slate-800">
                <Text className={`${colors.textMuted} text-[10px] font-bold uppercase`}>Proof of Delivery (PoD) Photo</Text>
                
                {proofUri ? (
                  <View className="flex-row justify-between items-center bg-slate-200 dark:bg-slate-950 p-2.5 rounded-lg border border-emerald-500/20">
                    <Text className="text-emerald-500 font-bold text-xs">✓ Photo pod_delivery.jpg Attached</Text>
                    <TouchableOpacity onPress={() => setProofUri('')}>
                      <Text className="text-red-500 text-xs">Reset</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => setProofUri('https://res.cloudinary.com/demo/image/upload/pod')}
                    className="bg-white dark:bg-slate-950 h-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl items-center justify-center"
                  >
                    <Text className={`${colors.textMuted} text-xs font-semibold`}>📷 Capture Delivery Photo or Load Receipt</Text>
                  </TouchableOpacity>
                )}
              </View>

              {deliveryConfirmed ? (
                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 items-center">
                  <Text className="text-emerald-500 text-xs font-semibold">✓ Delivered Successfully.</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={handleMarkDelivered}
                  disabled={isReportingDelivery}
                  className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 items-center flex-row justify-center"
                >
                  {isReportingDelivery ? (
                    <ActivityIndicator color="#white" size="small" className="mr-2" />
                  ) : null}
                  <Text className="text-white font-bold text-sm">📍 Confirm Delivery (GPS Boundary Check)</Text>
                </TouchableOpacity>
              )}
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
                Business ID: #RGB-SUP-2900
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
                Instantly toggle the KYC verification status of your supplier account to test how the screen routing gates behave:
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
          onPress={() => setCurrentTab('rfqs')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'rfqs' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>RFQs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('deliveries')}
          className="items-center justify-center w-14 h-12"
        >
          <Text className={currentTab === 'deliveries' ? 'text-emerald-500 text-xs font-extrabold' : `${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs font-medium`}>Orders</Text>
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
