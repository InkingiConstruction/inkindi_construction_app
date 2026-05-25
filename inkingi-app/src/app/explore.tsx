/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : explore.tsx
 * WHAT THIS FILE DOES : History and details tracker tab for the logged in user's role
 * HOW IT DOES IT      : Renders custom ledgers, quotes, and audit logs matching profile details
 * DATA SOURCE         : AuthContext users, projects, and transactions
 * DATA DESTINATION    : Visual list renderings on screen
 * PRINCIPLE APPLIED   : SOLID (Workspace routing isolation)
 * ============================================================================
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_PROJECTS, MOCK_RFQS } from '@/data/mockAdminService';

/**
 * ============================================================================
 * 🔧 FUNCTION: TabTwoScreen
 * ============================================================================
 * WHAT IT DOES: Renders custom operations ledgers based on active profile category
 * PARAMETERS: None
 * RETURNS: JSX.Element - Activity details page
 * WHO CALLS IT: App layout tab trigger
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export default function TabTwoScreen() {
  const { user } = useAuth();

  /**
   * 🧱 CODE BLOCK: Render Client Ledger & Disputes
   * WHAT IT IS DOING: Lists escrow transaction logs and disputes for client tracking
   * WHY IT IS HERE  : Transparency for Diaspora investors (Step 19-20)
   * PRINCIPLE       : KISS
   */
  const renderClientHistory = () => (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      <Text className="text-white text-xl font-bold mb-4">Activity & Financial Ledger</Text>
      
      {/* Escrow Transaction History */}
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Transaction History</Text>
      <View className="bg-slate-800 border border-slate-700 rounded-3xl p-4 mb-6 space-y-3">
        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <View>
            <Text className="text-white font-semibold text-sm">MTN Escrow Deposit</Text>
            <Text className="text-slate-500 text-xs mt-0.5">2026-05-20 • Completed</Text>
          </View>
          <Text className="text-emerald-400 font-bold text-sm">+40,500,000 RWF</Text>
        </View>

        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <View>
            <Text className="text-white font-semibold text-sm">Milestone 1 Release</Text>
            <Text className="text-slate-500 text-xs mt-0.5">2026-05-18 • Completed</Text>
          </View>
          <Text className="text-slate-400 font-bold text-sm">-8,200,000 RWF</Text>
        </View>
      </View>

      {/* Disputes logs */}
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Active Disputes Logs</Text>
      <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-semibold text-sm">Dispute: Kicukiro Roofing</Text>
          <View className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
            <Text className="text-red-400 text-[10px] font-bold uppercase">MEDIATION</Text>
          </View>
        </View>
        <Text className="text-slate-400 text-xs mb-3">
          "Client requested third-party inspection of reinforcement steel sheets and column joints before release."
        </Text>
        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <Text className="text-slate-500 text-xs">Locked Escrow Pool</Text>
          <Text className="text-white font-bold text-sm">9,600,000 RWF</Text>
        </View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );

  /**
   * 🧱 CODE BLOCK: Render Engineer RFQs and Supply Chain
   * WHAT IT IS DOING: Lists open RFQs, supplier quotes and delivery statuses
   * WHY IT IS HERE  : Central hub for managing build material procurement
   * PRINCIPLE       : SOLID
   */
  const renderEngineerHistory = () => (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      <Text className="text-white text-xl font-bold mb-4">Supply Chain & Materials</Text>

      {/* RFQ Broadcast Section */}
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Material RFQs Broadcasts</Text>
      <View className="space-y-3 mb-6">
        {MOCK_RFQS.map(rfq => (
          <View key={rfq.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold text-sm">{rfq.material}</Text>
              <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <Text className="text-emerald-400 text-[10px] font-bold">{rfq.status}</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs">Required: {rfq.quantity} • Quotes Received: {rfq.quotes}</Text>
          </View>
        ))}
      </View>

      {/* Delivery tracking */}
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Active In-Transit Deliveries</Text>
      <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-semibold text-sm">Roofing sheets from Rwanda BuildMart</Text>
          <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <Text className="text-emerald-400 text-[10px] font-bold uppercase">IN TRANSIT</Text>
          </View>
        </View>
        <Text className="text-slate-400 text-xs mb-3">
          GPS Tracking matches vehicle progress (ETA: 10:30 AM). Payout will authorize instantly upon delivery.
        </Text>
      </View>
      <View className="h-10" />
    </ScrollView>
  );

  /**
   * 🧱 CODE BLOCK: Render Supervisor inspection logs
   * WHAT IT IS DOING: Renders digital quality reports completed in the past
   * WHY IT IS HERE  : Audit checklist trace logs
   * PRINCIPLE       : KISS
   */
  const renderSupervisorHistory = () => (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      <Text className="text-white text-xl font-bold mb-4">Inspection Certifications</Text>
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Historic QC Reports</Text>
      
      <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-semibold text-sm">Kicukiro Foundation Inspection</Text>
          <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <Text className="text-emerald-400 text-[10px] font-bold uppercase">CERTIFIED PASSED</Text>
          </View>
        </View>
        <Text className="text-slate-400 text-xs mb-4">
          All core checklists (reinforcements, pillar concrete mix) fully validated. Signed certificate sent to escrow manager.
        </Text>
        
        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <Text className="text-slate-500 text-xs">Quality Score</Text>
          <Text className="text-emerald-400 font-bold text-sm">⭐⭐⭐⭐⭐ 5/5</Text>
        </View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );

  /**
   * 🧱 CODE BLOCK: Render Supplier earnings ledger
   * WHAT IT IS DOING: Lists earnings payments and material orders cleared
   * WHY IT IS HERE  : Financial visibility for trading companies
   * PRINCIPLE       : KISS
   */
  const renderSupplierHistory = () => (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      <Text className="text-white text-xl font-bold mb-4">Earnings Ledger & History</Text>
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Recent Payouts</Text>

      <View className="bg-slate-800 border border-slate-700 rounded-3xl p-4 space-y-3 mb-6">
        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <View>
            <Text className="text-white font-semibold text-sm">Bugesera Foundation - PO-8812</Text>
            <Text className="text-slate-500 text-xs mt-0.5">2026-05-15 • Cleared</Text>
          </View>
          <Text className="text-emerald-400 font-bold text-sm">+7,800,000 RWF</Text>
        </View>

        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
          <View>
            <Text className="text-white font-semibold text-sm">Kicukiro Masonry - PO-7741</Text>
            <Text className="text-slate-500 text-xs mt-0.5">2026-05-10 • Cleared</Text>
          </View>
          <Text className="text-emerald-400 font-bold text-sm">+5,200,000 RWF</Text>
        </View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );

  // Match dashboard routing
  if (user?.role === 'CLIENT') return renderClientHistory();
  if (user?.role === 'ENGINEER') return renderEngineerHistory();
  if (user?.role === 'SUPERVISOR') return renderSupervisorHistory();
  if (user?.role === 'SUPPLIER') return renderSupplierHistory();

  return renderClientHistory();
}
