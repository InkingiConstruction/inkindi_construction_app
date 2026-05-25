/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : ClientDashboard.tsx
 * WHAT THIS FILE DOES : Comprehensive dashboard interface for Client users (e.g. Grace Uwase)
 * HOW IT DOES IT      : Renders project progress, escrow actions, and payment release flows with MoMo sandbox
 * DATA SOURCE         : AuthContext user details and project states
 * DATA DESTINATION    : Updates local transaction listings and releases escrow funds
 * PRINCIPLE APPLIED   : SOLID (Encapsulated client dashboard features)
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ProgressBarAndroid, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MockProject } from '../../data/mockAdminService';

/**
 * ============================================================================
 * 🔧 FUNCTION: ClientDashboard
 * ============================================================================
 * WHAT IT DOES: Renders client home, active projects, escrow funding, and payment approvals
 * PARAMETERS: None
 * RETURNS: JSX.Element - Dashboard view
 * WHO CALLS IT: index.tsx
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export default function ClientDashboard() {
  const { user, projects, handleLogout } = useAuth();
  
  // Dashboard states
  const [escrowBalance, setEscrowBalance] = useState(40500000);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Active project list
  const clientProjects = projects.filter(p => p.client === user?.name || p.client === 'Grace Uwase');
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(clientProjects[0] || null);

  // Approval status
  const [milestones, setMilestones] = useState(selectedProject?.milestones || []);

  /**
   * 🧱 CODE BLOCK: Handle Escrow Deposit (MTN Mobile Money webhook simulation)
   * WHAT IT IS DOING: Simulates secure MoMo sandwich payment gateway
   * WHY IT IS HERE  : Business rule validation (REG-13 and funding rules)
   * PRINCIPLE       : KISS
   */
  const handleDepositFunds = () => {
    if (!depositAmount || parseFloat(depositAmount) < 100000) {
      Alert.alert('Minimum Limit', 'Minimum escrow deposit is 100,000 RWF.');
      return;
    }
    
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const added = parseFloat(depositAmount);
      setEscrowBalance(prev => prev + added);
      setShowDepositModal(false);
      setDepositAmount('');
      Alert.alert(
        'Payment Received!',
        `Successfully received ${added.toLocaleString()} RWF from MTN Mobile Money. Escrow account updated.`,
        [{ text: 'Great' }]
      );
    }, 1500);
  };

  /**
   * 🧱 CODE BLOCK: Release Milestone Funds
   * WHAT IT IS DOING: Releases a specific milestone percentage from locked escrow
   * WHY IT IS HERE  : Allows client to pay engineer upon supervisor checklist approval
   * PRINCIPLE       : SOLID
   */
  const handleReleaseMilestone = (index: number, name: string, pct: number) => {
    const amount = (selectedProject?.budget || 0) * (pct / 100);
    Alert.alert(
      'Confirm Payment Release',
      `Release ${amount.toLocaleString()} RWF from escrow to Engineer Eric Ndayisaba for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Release', 
          onPress: () => {
            if (escrowBalance < amount) {
              Alert.alert('Insufficient Balance', 'Your escrow account has insufficient funds. Please deposit more.');
              return;
            }
            setEscrowBalance(prev => prev - amount);
            const updated = [...milestones];
            updated[index].status = 'PAID';
            setMilestones(updated);
            Alert.alert('Payment Approved', `Funds released successfully! Engineer has been notified.`);
          } 
        }
      ]
    );
  };

  /**
   * 🧱 CODE BLOCK: Initiate Dispute
   * WHAT IT IS DOING: Locks escrow balance and flags milestone as disputed
   * WHY IT IS HERE  : Dispute mediation initiation
   * PRINCIPLE       : KISS
   */
  const handleInitiateDispute = (index: number, name: string) => {
    Alert.alert(
      'Initiate Dispute',
      `Hold payment and open mediation dispute against Engineer for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Dispute',
          onPress: () => {
            const updated = [...milestones];
            updated[index].status = 'REVISION';
            setMilestones(updated);
            Alert.alert(
              'Dispute Logged',
              'Mediation dispute opened. Administrator assigned to review checklist & progress photos (SLA: 14 days).'
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Welcome Client</Text>
          <Text className="text-white text-2xl font-extrabold">{user?.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl"
        >
          <Text className="text-red-400 text-xs font-bold">Logout ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Escrow Account Balance Widget */}
      <View className="bg-emerald-950/60 border border-emerald-500/20 rounded-3xl p-6 mb-6 shadow-xl">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-emerald-400 text-sm font-bold tracking-wider uppercase">Project Escrow Vault</Text>
          <View className="bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-md">
            <Text className="text-emerald-400 text-xs font-bold">MTN Partner Wallet</Text>
          </View>
        </View>
        
        <Text className="text-white text-3xl font-extrabold tracking-tight mb-4">
          {escrowBalance.toLocaleString()} <Text className="text-emerald-400 text-xl font-bold">RWF</Text>
        </Text>

        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => setShowDepositModal(true)}
            className="bg-emerald-600 active:bg-emerald-700 py-3 rounded-xl flex-1 items-center border border-emerald-500 shadow-md"
          >
            <Text className="text-white font-bold text-sm">💰 Deposit Escrow</Text>
          </TouchableOpacity>
          <View className="bg-white/5 py-3 rounded-xl flex-1 items-center border border-white/10 justify-center">
            <Text className="text-slate-400 text-xs font-medium">Auto Locked for active builds</Text>
          </View>
        </View>
      </View>

      {/* Active Project Overview */}
      {selectedProject ? (
        <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 mb-8 shadow-xl">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Build</Text>
              <Text className="text-white text-lg font-bold">{selectedProject.name}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">📍 {selectedProject.location}</Text>
            </View>
            <View className="bg-emerald-600/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Text className="text-emerald-400 text-xs font-bold">{selectedProject.progress}% Done</Text>
            </View>
          </View>

          {/* Progress Bar placeholder */}
          <View className="h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
            <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedProject.progress}%` }} />
          </View>

          {/* Assigned Engineer details */}
          <View className="bg-slate-900 border border-slate-700/60 p-4 rounded-2xl flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
                <Text className="text-lg">👷‍♂️</Text>
              </View>
              <View>
                <Text className="text-slate-500 text-xs uppercase font-bold">Assigned Engineer</Text>
                <Text className="text-white font-bold text-sm">{selectedProject.engineer}</Text>
              </View>
            </View>
            <View className="bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg">
              <Text className="text-slate-400 text-xs font-semibold">IER License: Active</Text>
            </View>
          </View>

          {/* Milestones / BoQ Tracker */}
          <Text className="text-white font-extrabold text-base mb-4">Milestone Structure & Payments</Text>
          <View className="space-y-3">
            {milestones.map((m, idx) => (
              <View 
                key={idx} 
                className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">{m.name}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">Budget Allocation: {m.pct}% ({((selectedProject.budget * m.pct) / 100).toLocaleString()} RWF)</Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded border ${
                    m.status === 'PAID' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : m.status === 'REVISION'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    <Text className={`text-[10px] font-extrabold uppercase ${
                      m.status === 'PAID' ? 'text-emerald-400' : m.status === 'REVISION' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {m.status}
                    </Text>
                  </View>
                </View>

                {/* Actions for pending items */}
                {m.status === 'PENDING' && (
                  <View className="flex-row gap-2 border-t border-slate-800 pt-3 mt-2">
                    <TouchableOpacity 
                      onPress={() => handleReleaseMilestone(idx, m.name, m.pct)}
                      className="bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex-1 items-center"
                    >
                      <Text className="text-emerald-400 text-xs font-bold">Release Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleInitiateDispute(idx, m.name)}
                      className="bg-red-600/10 border border-red-500/20 px-3 py-1.5 rounded-lg flex-1 items-center"
                    >
                      <Text className="text-red-400 text-xs font-bold">Raise Dispute</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="bg-slate-800 border border-slate-700 p-8 rounded-3xl items-center">
          <Text className="text-slate-400 text-center font-bold">No projects created yet. Tap below to invite an engineer!</Text>
        </View>
      )}

      {/* Deposit MoMo Webview Simulation Modal */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-800 border-t border-slate-700 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">MTN Mobile Money Gateway</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Text className="text-slate-400 text-lg font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-slate-400 text-sm mb-4">
              Provide payment details to request direct escrow funding verification callback.
            </Text>

            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-slate-300 text-xs font-bold mb-2 ml-1">MTN Phone Number</Text>
                <TextInput
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-base"
                  placeholder="+250788100000"
                  keyboardType="phone-pad"
                  value={momoNumber}
                  onChangeText={setMomoNumber}
                />
              </View>

              <View>
                <Text className="text-slate-300 text-xs font-bold mb-2 ml-1">Deposit Amount (RWF)</Text>
                <TextInput
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-base"
                  placeholder="5,000,000"
                  keyboardType="numeric"
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleDepositFunds}
              disabled={isProcessingPayment}
              className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl items-center flex-row justify-center shadow-lg border border-emerald-500"
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#white" size="small" className="mr-2" />
              ) : null}
              <Text className="text-white font-bold text-lg">Confirm & Authorize MoMo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View className="h-10" />
    </ScrollView>
  );
}
