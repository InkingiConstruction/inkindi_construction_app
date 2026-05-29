/**
 * FILE NAME   : WalletTab.tsx
 * WHAT THIS FILE DOES : Renders the client's escrow wallet with fintech-grade design.
 *                       Features: balance visibility toggle (hidden by default), fund escrow,
 *                       approve milestone payments, transaction history, and downloadable receipts.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'deposit' | 'history' | 'approvals' | 'receipts';

interface Transaction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  sub: string;
  amount: string;
  amountColor: string;
  date: string;
}

interface Approval {
  id: string;
  project: string;
  phase: string;
  amount: number;
  progress: number;
  conditionsMet: string;
  submitted: string;
  approved?: boolean;
}

interface Receipt {
  id: string;
  ref: string;
  type: string;
  amount: string;
  date: string;
}

interface Props {
  walletBalance: number;
  colors: DashColors;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    icon: 'arrow-down-circle-outline',
    iconColor: '#0F6E56',
    iconBg: '#E1F5EE',
    label: 'Deposit confirmed',
    sub: 'Flutterwave gateway',
    amount: '+10,000,000 RWF',
    amountColor: '#0F6E56',
    date: 'May 28, 2026',
  },
  {
    id: 'tx2',
    icon: 'arrow-up-circle-outline',
    iconColor: '#A32D2D',
    iconBg: '#FCEBEB',
    label: 'Milestone payment',
    sub: 'Foundation phase released',
    amount: '-4,500,000 RWF',
    amountColor: '#A32D2D',
    date: 'May 25, 2026',
  },
  {
    id: 'tx3',
    icon: 'lock-closed-outline',
    iconColor: '#007E6E',
    iconBg: '#E1F5EE',
    label: 'Escrow locked',
    sub: 'Nyarutarama Plaza contract',
    amount: '-10,500,000 RWF',
    amountColor: '#64748b',
    date: 'May 20, 2026',
  },
  {
    id: 'tx4',
    icon: 'arrow-down-circle-outline',
    iconColor: '#0F6E56',
    iconBg: '#E1F5EE',
    label: 'Deposit confirmed',
    sub: 'Bank transfer',
    amount: '+20,000,000 RWF',
    amountColor: '#0F6E56',
    date: 'May 12, 2026',
  },
];

const INITIAL_APPROVALS: Approval[] = [
  {
    id: 'ap1',
    project: 'Kimisagara Residential',
    phase: 'Phase 2 — Structural framing',
    amount: 8_000_000,
    progress: 65,
    conditionsMet: '65% of milestone conditions met',
    submitted: 'Submitted May 27',
  },
  {
    id: 'ap2',
    project: 'Nyarutarama Commercial',
    phase: 'Phase 1 — Foundation complete',
    amount: 3_200_000,
    progress: 100,
    conditionsMet: 'All conditions verified',
    submitted: 'Submitted May 26',
  },
];

const RECEIPTS: Receipt[] = [
  { id: 'r1', ref: 'RW-00412', type: 'Deposit', amount: '10,000,000 RWF', date: 'May 28, 2026' },
  { id: 'r2', ref: 'RW-00411', type: 'Milestone', amount: '4,500,000 RWF', date: 'May 25, 2026' },
  { id: 'r3', ref: 'RW-00409', type: 'Deposit', amount: '20,000,000 RWF', date: 'May 12, 2026' },
];

const GATEWAYS = ['Flutterwave', 'Bank transfer', 'Mobile money', 'MTN MoMo'] as const;
type Gateway = (typeof GATEWAYS)[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Segmented tab bar */
function TabBar({
  active,
  onChange,
  colors,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  colors: DashColors;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'deposit', label: 'Deposit' },
    { key: 'history', label: 'History' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'receipts', label: 'Receipts' },
  ];

  return (
    <View
      className="flex-row rounded-xl p-1"
      style={{ backgroundColor: colors.bg ?? '#F1F5F9' }}
    >
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          onPress={() => onChange(t.key)}
          activeOpacity={0.7}
          className="flex-1 items-center rounded-lg py-2"
          style={
            active === t.key
              ? { backgroundColor: '#007E6E' }
              : undefined
          }
        >
          <Text
            className="text-[11px] font-semibold"
            style={{ color: active === t.key ? '#fff' : '#64748b' }}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/** Balance card with visibility toggle */
function BalanceCard({
  balance,
  visible,
  onToggle,
}: {
  balance: number;
  visible: boolean;
  onToggle: () => void;
}) {
  const display = visible ? `${balance.toLocaleString()} RWF` : '••••••• RWF';

  return (
    <View
      className="rounded-2xl p-6 overflow-hidden"
      style={{ backgroundColor: '#007E6E' }}
    >
      {/* Decorative circles */}
      <View
        className="absolute rounded-full"
        style={{
          width: 160,
          height: 160,
          right: -40,
          bottom: -40,
          backgroundColor: 'rgba(255,255,255,0.06)',
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: 110,
          height: 110,
          left: -24,
          top: -24,
          backgroundColor: 'rgba(255,255,255,0.06)',
        }}
      />

      {/* Header row */}
      <View className="flex-row justify-between items-center mb-2">
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' }}>
          Escrow balance
        </Text>
        <View
          className="px-2 py-0.5 rounded-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '700' }}>
            RWF account
          </Text>
        </View>
      </View>

      {/* Amount + eye toggle */}
      <View className="flex-row items-center gap-2 mb-1">
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
          {display}
        </Text>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="rgba(255,255,255,0.65)"
          />
        </TouchableOpacity>
      </View>
      <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Updated just now</Text>

      {/* Stats row */}
      <View
        className="flex-row gap-6 mt-4 pt-4"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}
      >
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
            Locked in projects
          </Text>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 2 }}>
            30,500,000 RWF
          </Text>
        </View>
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
            Released YTD
          </Text>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 2 }}>
            4,500,000 RWF
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Quick action shortcuts */
function ActionRow({ onDeposit, onApprovals }: { onDeposit: () => void; onApprovals: () => void }) {
  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={onDeposit}
        activeOpacity={0.8}
        className="flex-1 items-center rounded-2xl py-4 gap-2"
        style={{ backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0' }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#E1F5EE' }}
        >
          <Ionicons name="arrow-down-outline" size={18} color="#0F6E56" />
        </View>
        <Text className="text-xs font-semibold" style={{ color: '#1E293B' }}>
          Fund escrow
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onApprovals}
        activeOpacity={0.8}
        className="flex-1 items-center rounded-2xl py-4 gap-2"
        style={{ backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0' }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#FAEEDA' }}
        >
          <Ionicons name="checkmark-done-outline" size={18} color="#854F0B" />
        </View>
        <Text className="text-xs font-semibold" style={{ color: '#1E293B' }}>
          Approve payment
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function DepositPanel({ colors }: { colors: DashColors }) {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [gateway, setGateway] = useState<Gateway>('Flutterwave');

  const handleSubmit = () => {
    if (!amount.trim()) {
      Alert.alert('Missing amount', 'Please enter a deposit amount.');
      return;
    }
    Alert.alert(
      'Deposit submitted',
      `${Number(amount.replace(/,/g, '')).toLocaleString()} RWF deposit submitted via ${gateway}.`,
    );
  };

  return (
    <View
      className="rounded-2xl p-5 gap-4"
      style={{ backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0' }}
    >
      {/* Amount */}
      <View className="gap-1.5">
        <Text className="text-xs font-semibold" style={{ color: '#64748b' }}>Amount (RWF)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="e.g. 5,000,000"
          keyboardType="numeric"
          placeholderTextColor="#94a3b8"
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            borderWidth: 0.5,
            borderColor: '#CBD5E1',
            backgroundColor: '#F8FAFC',
            color: '#1E293B',
            fontSize: 14,
          }}
        />
      </View>

      {/* Project reference */}
      <View className="gap-1.5">
        <Text className="text-xs font-semibold" style={{ color: '#64748b' }}>Project reference</Text>
        <TextInput
          value={reference}
          onChangeText={setReference}
          placeholder="e.g. Kimisagara Phase 2"
          placeholderTextColor="#94a3b8"
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            borderWidth: 0.5,
            borderColor: '#CBD5E1',
            backgroundColor: '#F8FAFC',
            color: '#1E293B',
            fontSize: 14,
          }}
        />
      </View>

      {/* Gateway selection */}
      <View className="gap-1.5">
        <Text className="text-xs font-semibold" style={{ color: '#64748b' }}>Payment gateway</Text>
        <View className="flex-row flex-wrap gap-2">
          {GATEWAYS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGateway(g)}
              activeOpacity={0.7}
              className="rounded-xl px-3 py-2"
              style={
                gateway === g
                  ? { backgroundColor: '#E1F5EE', borderWidth: 1, borderColor: '#007E6E' }
                  : { backgroundColor: '#F8FAFC', borderWidth: 0.5, borderColor: '#E2E8F0' }
              }
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: gateway === g ? '#0F6E56' : '#475569' }}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.85}
        className="rounded-xl py-3.5 items-center"
        style={{ backgroundColor: '#007E6E' }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
          Confirm deposit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HistoryPanel({ colors }: { colors: DashColors }) {
  return (
    <View className="gap-3">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-bold" style={{ color: colors.text ?? '#1E293B' }}>
          Recent activity
        </Text>
        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center gap-1">
          <Ionicons name="filter-outline" size={15} color="#64748b" />
          <Text className="text-xs" style={{ color: '#64748b' }}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View className="gap-2">
        {TRANSACTIONS.map((tx) => (
          <View
            key={tx.id}
            className="flex-row items-center gap-3 rounded-2xl p-4"
            style={{ backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0' }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: tx.iconBg }}
            >
              <Ionicons name={tx.icon} size={18} color={tx.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold" style={{ color: '#1E293B' }}>
                {tx.label}
              </Text>
              <Text className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
                {tx.sub}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs font-bold" style={{ color: tx.amountColor }}>
                {tx.amount}
              </Text>
              <Text className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
                {tx.date}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ApprovalsPanel({ colors }: { colors: DashColors }) {
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);

  const handleApprove = (id: string) => {
    Alert.alert(
      'Confirm approval',
      'Release this milestone payment from escrow?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () =>
            setApprovals((prev) =>
              prev.map((a) => (a.id === id ? { ...a, approved: true } : a)),
            ),
        },
      ],
    );
  };

  const pending = approvals.filter((a) => !a.approved);

  return (
    <View className="gap-3">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-bold" style={{ color: colors.text ?? '#1E293B' }}>
          Pending approvals
        </Text>
        {pending.length > 0 && (
          <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: '#FAEEDA' }}>
            <Text className="text-[10px] font-bold" style={{ color: '#854F0B' }}>
              {pending.length} pending
            </Text>
          </View>
        )}
      </View>

      {approvals.map((a) => (
        <View
          key={a.id}
          className="rounded-2xl p-4 gap-3"
          style={{
            backgroundColor: '#fff',
            borderWidth: 0.5,
            borderColor: a.approved ? '#E2E8F0' : '#E2E8F0',
            opacity: a.approved ? 0.55 : 1,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-bold" style={{ color: '#1E293B' }}>
                {a.project}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                {a.phase}
              </Text>
            </View>
            <Text className="text-sm font-bold" style={{ color: '#007E6E' }}>
              {a.amount.toLocaleString()} RWF
            </Text>
          </View>

          {/* Progress bar */}
          <View>
            <View
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: '#F1F5F9' }}
            >
              <View
                className="h-full rounded-full"
                style={{ width: `${a.progress}%`, backgroundColor: '#007E6E' }}
              />
            </View>
            <Text className="text-[10px] mt-1.5" style={{ color: '#94a3b8' }}>
              {a.conditionsMet} · {a.submitted}
            </Text>
          </View>

          {/* Actions */}
          {!a.approved ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleApprove(a.id)}
                activeOpacity={0.85}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{ backgroundColor: '#007E6E' }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{ borderWidth: 0.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
              >
                <Text style={{ color: '#64748b', fontSize: 12 }}>Reject</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="checkmark-circle" size={14} color="#0F6E56" />
              <Text className="text-xs font-semibold" style={{ color: '#0F6E56' }}>
                Approved
              </Text>
            </View>
          )}
        </View>
      ))}

      {pending.length === 0 && (
        <Text className="text-xs text-center py-4" style={{ color: '#94a3b8' }}>
          No pending approvals
        </Text>
      )}
    </View>
  );
}

function ReceiptsPanel({ colors }: { colors: DashColors }) {
  const handleDownload = (ref: string) => {
    Alert.alert('Download receipt', `Receipt #${ref} will be downloaded as PDF.`);
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-bold" style={{ color: colors.text ?? '#1E293B' }}>
        Payment receipts
      </Text>

      <View className="gap-2">
        {RECEIPTS.map((r) => (
          <View
            key={r.id}
            className="flex-row items-center gap-3 rounded-2xl p-4"
            style={{ backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0' }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#E6F1FB' }}
            >
              <Ionicons name="document-text-outline" size={18} color="#185FA5" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold" style={{ color: '#1E293B' }}>
                Receipt #{r.ref}
              </Text>
              <Text className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
                {r.type} · {r.amount} · {r.date}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDownload(r.ref)}
              activeOpacity={0.7}
              className="flex-row items-center gap-1 rounded-lg px-2.5 py-1.5"
              style={{ borderWidth: 0.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
            >
              <Ionicons name="download-outline" size={13} color="#64748b" />
              <Text className="text-[11px]" style={{ color: '#64748b' }}>PDF</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WalletTab({ walletBalance, colors }: Props) {
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('deposit');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="gap-5">

        {/* Screen header */}
        <View className="gap-0.5">
          <Text className="text-2xl font-extrabold tracking-tight" style={{ color: colors.text }}>
            Escrow account
          </Text>
          <Text className="text-xs" style={{ color: colors.textMuted }}>
            Manage escrow reserves and fund transfers.
          </Text>
        </View>

        {/* Balance card */}
        <BalanceCard
          balance={walletBalance}
          visible={balanceVisible}
          onToggle={() => setBalanceVisible((v) => !v)}
        />

        {/* Quick actions */}
        <ActionRow
          onDeposit={() => setActiveTab('deposit')}
          onApprovals={() => setActiveTab('approvals')}
        />

        {/* Tab bar */}
        <TabBar active={activeTab} onChange={setActiveTab} colors={colors} />

        {/* Tab content */}
        {activeTab === 'deposit' && <DepositPanel colors={colors} />}
        {activeTab === 'history' && <HistoryPanel colors={colors} />}
        {activeTab === 'approvals' && <ApprovalsPanel colors={colors} />}
        {activeTab === 'receipts' && <ReceiptsPanel colors={colors} />}

      </View>
    </ScrollView>
  );
}