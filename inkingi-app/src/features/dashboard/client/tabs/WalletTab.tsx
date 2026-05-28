/**
 * FILE NAME   : WalletTab.tsx
 * WHAT THIS FILE DOES : Renders the client's escrow wallet status and transaction list.
 *                       No arbitrary manual deposit buttons here as per user instructions.
 */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  walletBalance: number;
  colors: DashColors;
}

export default function WalletTab({
  walletBalance,
  colors,
}: Props) {
  return (
    <View className="space-y-6 pb-6">
      {/* Screen Title */}
      <View className="space-y-0.5">
        <Text className={`${colors.text} text-2xl font-extrabold tracking-tight`}>Escrow Account</Text>
        <Text className={`${colors.textMuted} text-xs`}>View your active escrow reserves and historical fund transfers.</Text>
      </View>

      {/* Balance card */}
      <View className="bg-[#007E6E] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <View className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5" />
        <View className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/5" />

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/70 font-bold uppercase text-[9px] tracking-widest">Escrow Balance</Text>
          <View className="bg-white/10 px-2 py-0.5 rounded-md">
            <Text className="text-white text-[10px] font-extrabold">RWF Account</Text>
          </View>
        </View>

        <Text className="text-white text-3xl font-extrabold tracking-tight">
          {walletBalance.toLocaleString()} RWF
        </Text>

        {/* Quick stats row inside card */}
        <View className="flex-row gap-4 mt-4 pt-4 border-t border-white/10">
          <View>
            <Text className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Locked in Projects</Text>
            <Text className="text-white font-extrabold text-sm mt-0.5">30,500,000 RWF</Text>
          </View>
          <View>
            <Text className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Released YTD</Text>
            <Text className="text-white font-extrabold text-sm mt-0.5">4,500,000 RWF</Text>
          </View>
        </View>
      </View>

      {/* Locked Reserves Breakdown */}
      <View className={`p-4 rounded-2xl border ${colors.card} space-y-3`}>
        <Text className={`${colors.text} text-xs font-bold tracking-tight`}>Locked Escrow Breakdown</Text>
        <View className="h-px bg-slate-100 dark:bg-slate-800/60" />
        {[
          { label: 'Kimisagara Residential Complex', locked: 20_000_000, pct: 65 },
          { label: 'Nyarutarama Commercial Plaza', locked: 10_500_000, pct: 30 },
        ].map((item, i) => (
          <View key={i} className="space-y-1.5">
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.text} text-xs font-semibold`} numberOfLines={1}>{item.label}</Text>
              <Text className="text-primary-500 font-bold text-xs">{item.locked.toLocaleString()} RWF</Text>
            </View>
            <View className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <View className="h-full bg-primary-500 rounded-full" style={{ width: `${item.pct}%` }} />
            </View>
          </View>
        ))}
      </View>

      {/* Transaction History */}
      <View className="flex-row justify-between items-center">
        <Text className={`${colors.text} text-base font-bold tracking-tight`}>Recent Activity</Text>
        <Ionicons name="filter-outline" size={16} color="#64748b" />
      </View>

      <View className="space-y-2">
        {[
          { icon: 'arrow-down-outline', iconColor: '#10b981', bg: 'bg-emerald-500/10', label: 'Deposit Confirmed', sub: 'Flutterwave Gateway', amount: '+10,000,000 RWF', amtColor: 'text-emerald-500' },
          { icon: 'arrow-up-outline', iconColor: '#f43f5e', bg: 'bg-rose-500/10', label: 'Milestone Payment', sub: 'Foundation Phase Released', amount: '-4,500,000 RWF', amtColor: 'text-rose-500' },
          { icon: 'lock-closed-outline', iconColor: '#007E6E', bg: 'bg-primary-500/10', label: 'Escrow Locked', sub: 'Nyarutarama Plaza Contract', amount: '-10,500,000 RWF', amtColor: 'text-slate-500' },
        ].map((tx, i) => (
          <View key={i} className={`p-4 rounded-2xl border ${colors.card} flex-row justify-between items-center`}>
            <View className="flex-row items-center gap-3">
              <View className={`${tx.bg} p-2.5 rounded-xl`}>
                <Ionicons name={tx.icon as any} size={16} color={tx.iconColor} />
              </View>
              <View>
                <Text className={`${colors.text} font-bold text-xs`}>{tx.label}</Text>
                <Text className="text-slate-400 text-[10px]">{tx.sub}</Text>
              </View>
            </View>
            <Text className={`${tx.amtColor} font-extrabold text-xs`}>{tx.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
