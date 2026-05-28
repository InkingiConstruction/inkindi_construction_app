/**
 * FILE NAME   : HomeTab.tsx
 * WHAT THIS FILE DOES : Renders the Home screen of the Client Dashboard
 *                       with premium welcome messages, 2-column stats, and custom actions.
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';
import LottieAnimation from '../../../../components/ui/LottieAnimation';
import DashboardHeroSlider from '../components/DashboardHeroSlider';

interface Props {
  stats: {
    totalBudget: number;
    totalProjects: number;
    pendingMilestones: number;
    completionRate: number;
  };
  clientProjects: any[];
  colors: DashColors;
  onAddProject: () => void;
  onSelectProject: (proj: any) => void;
  onChangeTab: (tab: any) => void;
}

export default function HomeTab({
  stats,
  clientProjects,
  colors,
  onAddProject,
  onSelectProject,
  onChangeTab,
}: Props) {
  return (
    <View className="space-y-6 pb-6">
      {/* Welcome Banner Card */}
    <DashboardHeroSlider
  slides={[
    {
      id: 1,
      title: 'Escrow Operations Hub',
      description:
        'Secure construction payments and manage engineering milestones safely.',
      buttonText: 'Manage Escrow',
      icon: 'shield-checkmark',
      image:
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
    },

    {
      id: 2,
      title: 'Track Construction Progress',
      description:
        'Monitor active builds, timelines, and contractor performance in real time.',
      buttonText: 'View Projects',
      icon: 'business-outline',
      image:
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5',
    },

    {
      id: 3,
      title: 'Engineering Milestones',
      description:
        'Approve inspections, verify progress, and release secure payments instantly.',
      buttonText: 'Review Milestones',
      icon: 'construct-outline',
      image:
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
    },

    {
      id: 4,
      title: 'Legal & Permit Management',
      description:
        'Upload contracts, permits, and compliance documents securely.',
      buttonText: 'Open Documents',
      icon: 'document-text-outline',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    },
  ]}
/>

      {/* 2x2 Stats Grid (Maximum 2 per row) */}
      <View className="space-y-3">
        <Text className={`${colors.text} text-base font-bold tracking-tight`}>Workspace Activity</Text>
        
        {/* Row 1: Escrow Volume & Active Builds */}
        <View className="flex-row gap-3">
          <View className={`flex-1 p-4 rounded-2xl border ${colors.card} justify-between min-h-[90px]`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider`}>Escrow Reserves</Text>
              <Ionicons name="cash-outline" size={14} color="#007E6E" />
            </View>
            <Text className={`${colors.text} text-sm font-extrabold tracking-tight mt-2`}>
              {stats.totalBudget.toLocaleString()} RWF
            </Text>
          </View>

          <View className={`flex-1 p-4 rounded-2xl border ${colors.card} justify-between min-h-[90px]`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider`}>Active Builds</Text>
              <Ionicons name="business-outline" size={14} color="#007E6E" />
            </View>
            <Text className={`${colors.text} text-xl font-extrabold tracking-tight mt-2`}>
              {stats.totalProjects}
            </Text>
          </View>
        </View>

        {/* Row 2: Pending Milestones & Completion Rate */}
        <View className="flex-row gap-3">
          <View className={`flex-1 p-4 rounded-2xl border ${colors.card} justify-between min-h-[90px]`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider`}>Pending Checks</Text>
              <Ionicons name="time-outline" size={14} color="#f59e0b" />
            </View>
            <Text className={`${colors.text} text-xl font-extrabold tracking-tight mt-2`}>
              {stats.pendingMilestones}
            </Text>
          </View>

          <View className={`flex-1 p-4 rounded-2xl border ${colors.card} justify-between min-h-[90px]`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider`}>Completion Rate</Text>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
            </View>
            <Text className={`${colors.text} text-xl font-extrabold tracking-tight mt-2`}>
              {stats.completionRate}%
            </Text>
          </View>
        </View>
      </View>

      {/* Projects List Header with Right Side "Add Project" Plus button */}
      <View className="flex-row justify-between items-center mt-2">
        <Text className={`${colors.text} text-base font-bold tracking-tight`}>Latest Projects</Text>
        <TouchableOpacity 
          onPress={onAddProject}
          className="bg-primary-500/10 px-3 py-1.5 rounded-xl flex-row items-center gap-1 border border-primary-500/20 active:bg-primary-500/20"
        >
          <Ionicons name="add" size={14} color="#007E6E" />
          <Text className="text-primary-500 font-bold text-xs">Add Project</Text>
        </TouchableOpacity>
      </View>

      {clientProjects.length === 0 ? (
        <View className={`p-8 rounded-2xl border items-center justify-center ${colors.card}`}>
          <LottieAnimation type="empty" size={80} />
          <Text className={`${colors.textMuted} text-sm font-semibold mt-4 text-center`}>No projects registered yet</Text>
          <Text className="text-slate-400 text-xs text-center mt-1">Tap the plus icon on the right to configure a secure build.</Text>
        </View>
      ) : (
        clientProjects.map((proj) => (
          <View key={proj.id} className={`p-5 rounded-2xl border ${colors.card} space-y-4`}>
            <View className="flex-row justify-between items-start">
              <View className="space-y-1">
                <Text className={`${colors.text} font-bold text-base tracking-tight`}>{proj.name}</Text>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="location-outline" size={12} color="#94a3b8" />
                  <Text className={`${colors.textMuted} text-xs`}>{proj.location}</Text>
                </View>
              </View>
              <View className="bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20">
                <Text className="text-primary-500 text-xs font-extrabold">{proj.progress}%</Text>
              </View>
            </View>

            {/* Premium Progress Bar */}
            <View className="space-y-1">
              <View className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <View className="h-full bg-primary-500 rounded-full" style={{ width: `${proj.progress}%` }} />
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/40">
              <View className="flex-row items-center gap-1">
                <Ionicons name="lock-closed-outline" size={12} color="#64748b" />
                <Text className={`${colors.textMuted} text-xs`}>
                  {proj.budget.toLocaleString()} RWF Locked
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => { onSelectProject(proj); onChangeTab('projects'); }}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Text className="text-primary-500 font-bold text-xs">Manage Escrow</Text>
                <Ionicons name="chevron-forward" size={12} color="#007E6E" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
