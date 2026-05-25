/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SupervisorDashboard.tsx
 * WHAT THIS FILE DOES : Comprehensive dashboard interface for Supervisor users (e.g. Aline Mukamana)
 * HOW IT DOES IT      : Renders pending inspection requests, simulated GPS check, and quality forms
 * DATA SOURCE         : AuthContext and local form states
 * DATA DESTINATION    : Updates active inspection record listings
 * PRINCIPLE APPLIED   : SOLID (Supervisor dashboard encapsulation)
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ============================================================================
 * 🔧 FUNCTION: SupervisorDashboard
 * ============================================================================
 * WHAT IT DOES: Renders supervisor workflow, active inspection requests, GPS checklist gates
 * PARAMETERS: None
 * RETURNS: JSX.Element - Dashboard view
 * WHO CALLS IT: index.tsx
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export default function SupervisorDashboard() {
  const { user, handleLogout } = useAuth();

  // Simulated states
  const [gpsCheckedIn, setGpsCheckedIn] = useState(false);
  const [isCheckingGps, setIsCheckingGps] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'form'>('pending');

  // Form checklist items
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [check4, setCheck4] = useState(false);
  const [notes, setNotes] = useState('');
  const [overallRating, setOverallRating] = useState(4);
  const [signatureUri, setSignatureUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 🧱 CODE BLOCK: GPS Site Boundary check simulation
   * WHAT IT IS DOING: Checks device GPS telemetry matches project boundaries
   * WHY IT IS HERE  : Enforces mandatory physical on-site inspection rules (Step 12)
   * PRINCIPLE       : KISS
   */
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
      setActiveTab('form');
    }, 1500);
  };

  /**
   * 🧱 CODE BLOCK: Submit Digital Inspection Report
   * WHAT IT IS DOING: Captures digital signature, compiles checklists, updates milestone
   * WHY IT IS HERE  : Legally binding inspection compliance audits (Steps 13-17)
   * PRINCIPLE       : SOLID
   */
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
              setActiveTab('pending');
            } 
          }
        ]
      );
    }, 1500);
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Welcome Supervisor</Text>
          <Text className="text-white text-2xl font-extrabold">{user?.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl"
        >
          <Text className="text-red-400 text-xs font-bold">Logout ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-slate-800 p-1.5 rounded-2xl mb-6 border border-slate-700/60">
        <TouchableOpacity 
          onPress={() => setActiveTab('pending')}
          className={`py-3 rounded-xl flex-1 items-center ${activeTab === 'pending' ? 'bg-emerald-600' : 'bg-transparent'}`}
        >
          <Text className="text-white font-bold text-xs">🔔 Pending Review Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            if (!gpsCheckedIn) {
              Alert.alert('GPS Locked', 'You must verify your location on-site to open the inspection form.');
              return;
            }
            setActiveTab('form');
          }}
          className={`py-3 rounded-xl flex-1 items-center ${activeTab === 'form' ? 'bg-emerald-600' : 'bg-transparent'}`}
        >
          <Text className="text-white font-bold text-xs">📝 Quality Checklist</Text>
        </TouchableOpacity>
      </View>

      {/* Tab content conditional renders */}
      {activeTab === 'pending' ? (
        <View className="space-y-4">
          <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-xl">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Assigned Request</Text>
                <Text className="text-white text-base font-bold">Kicukiro Family Home</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Milestone: Framing & Masonry inspection</Text>
              </View>
              <View className="bg-amber-600/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Text className="text-amber-400 text-xs font-bold">Pending Review</Text>
              </View>
            </View>

            <View className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl mb-5 space-y-2">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Site Location Boundary</Text>
              <Text className="text-slate-300 text-sm font-semibold">📍 Kicukiro Sector, Kigali</Text>
              <Text className="text-slate-500 text-xs">Accuracy gate requires inspection coordinates matching target coordinates.</Text>
            </View>

            {gpsCheckedIn ? (
              <TouchableOpacity 
                onPress={() => setActiveTab('form')}
                className="bg-emerald-600 py-3.5 rounded-xl border border-emerald-500 shadow-md items-center"
              >
                <Text className="text-white font-bold text-sm">✓ Open Quality Checklist</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleGPSCheckIn}
                disabled={isCheckingGps}
                className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 shadow-md items-center flex-row justify-center"
              >
                {isCheckingGps ? (
                  <ActivityIndicator color="#white" size="small" className="mr-2" />
                ) : null}
                <Text className="text-white font-bold text-sm">📍 Verify GPS Site Boundary Check-in</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 mb-8 shadow-xl">
          <Text className="text-white font-extrabold text-lg mb-4">Inspecting: Kicukiro Build</Text>
          
          <View className="space-y-4 mb-6">
            <View className="flex-row items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
              <Text className="text-slate-300 text-sm font-semibold">Foundation depth meets specifications?</Text>
              <Switch value={check1} onValueChange={setCheck1} trackColor={{ true: '#10b981' }} />
            </View>

            <View className="flex-row items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
              <Text className="text-slate-300 text-sm font-semibold">Reinforcement bars correctly spaced?</Text>
              <Switch value={check2} onValueChange={setCheck2} trackColor={{ true: '#10b981' }} />
            </View>

            <View className="flex-row items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
              <Text className="text-slate-300 text-sm font-semibold">Concrete mixture matches BoQ standard?</Text>
              <Switch value={check3} onValueChange={setCheck3} trackColor={{ true: '#10b981' }} />
            </View>

            <View className="flex-row items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
              <Text className="text-slate-300 text-sm font-semibold">Waterproofing properly applied?</Text>
              <Switch value={check4} onValueChange={setCheck4} trackColor={{ true: '#10b981' }} />
            </View>

            <View>
              <Text className="text-slate-300 text-xs font-bold mb-2 ml-1">Additional Observations / Notes</Text>
              <TextInput
                className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm"
                placeholder="Write any comments regarding quality, materials, or fixes..."
                placeholderTextColor="#475569"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Signature upload simulation */}
            <View className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
              <Text className="text-slate-300 text-xs font-bold mb-3">Digitally Sign Certification</Text>
              
              {signatureUri ? (
                <View className="flex-row justify-between items-center bg-slate-900 p-3 rounded-lg border border-emerald-500/20">
                  <Text className="text-emerald-400 font-bold text-xs">✓ Signature Certificate Captured</Text>
                  <TouchableOpacity onPress={() => setSignatureUri('')}>
                    <Text className="text-red-400 text-xs">Reset</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setSignatureUri('https://res.cloudinary.com/demo/image/upload/signature')}
                  className="bg-slate-900 h-24 border border-dashed border-slate-700 rounded-xl items-center justify-center"
                >
                  <Text className="text-slate-400 text-xs font-bold">✍ Tap to Draw/Simulate Digital Signature</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSubmitReport}
            disabled={isSubmitting}
            className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 shadow-md items-center flex-row justify-center"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white font-bold text-sm">Certify & Submit Inspection Report</Text>
          </TouchableOpacity>
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
