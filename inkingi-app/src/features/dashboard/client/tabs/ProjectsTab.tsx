/**
 * FILE NAME   : ProjectsTab.tsx
 * WHAT THIS FILE DOES : Client project detail view, milestone inspection list,
 *                       escrow milestone release, and documents upload space with premium styling.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  clientProjects: any[];
  selectedProject: any;
  projectMilestones: any[];
  colors: DashColors;
  onSelectProject: (proj: any) => void;
  onReleaseMilestone: (index: number) => void;
  onDisputeMilestone: (index: number) => void;
  onUploadDocument: (projectId: string, docName: string) => void;
}

export default function ProjectsTab({
  clientProjects,
  selectedProject,
  projectMilestones,
  colors,
  onSelectProject,
  onReleaseMilestone,
  onDisputeMilestone,
  onUploadDocument,
}: Props) {

  const handleDocUploadPress = () => {
    if (!selectedProject) return;
    Alert.prompt(
      'Attach Document',
      'Enter document name to upload (e.g., Land_Title_Kigali.pdf):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload',
          onPress: (val?: string) => {
            if (val && val.trim()) {
              onUploadDocument(selectedProject.id, val.trim());
            }
          },
        },
      ],
      'plain-text',
      'Permit_Approval.pdf'
    );
  };

  return (
    <View className="space-y-6 pb-6">
      {/* Screen Title */}
      <View className="space-y-0.5">
        <Text className={`${colors.text} text-2xl font-extrabold tracking-tight`}>Build Contracts</Text>
        <Text className={`${colors.textMuted} text-xs`}>Select an active project to inspect escrow milestones and manage workspace files.</Text>
      </View>
      
      {/* Horizontal Project Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
        {clientProjects.map((p) => {
          const isSelected = selectedProject?.id === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => onSelectProject(p)}
              className={`px-4 py-2.5 rounded-full border mr-3 flex-row items-center gap-1.5 ${
                isSelected 
                  ? 'bg-primary-600 border-primary-600 shadow-md shadow-primary-500/10' 
                  : colors.card
              }`}
            >
              <Ionicons 
                name={isSelected ? 'business' : 'business-outline'} 
                size={14} 
                color={isSelected ? 'white' : '#007E6E'} 
              />
              <Text className={isSelected ? 'text-white font-bold text-xs' : `${colors.text} text-xs font-semibold`}>
                {p.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedProject ? (
        <View className="space-y-6">
          {/* Project Header Info Card */}
          <View className={`p-5 rounded-2xl border ${colors.card} space-y-3`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.text} font-bold text-lg tracking-tight`}>{selectedProject.name}</Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="shield-checkmark" size={14} color="#007E6E" />
                <Text className="text-primary-500 text-xs font-bold">Escrow Active</Text>
              </View>
            </View>

            <View className="space-y-2 border-t border-slate-100 dark:border-slate-800/40 pt-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={14} color="#94a3b8" />
                <Text className={`${colors.textMuted} text-xs`}>{selectedProject.location}</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Ionicons name="person-outline" size={14} color="#94a3b8" />
                <Text className={`${colors.text} text-xs font-medium`}>
                  Supervisor: <Text className="font-bold text-primary-500">{selectedProject.supervisor || 'Aline Mukamana'}</Text>
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Ionicons name="wallet-outline" size={14} color="#94a3b8" />
                <Text className={`${colors.textMuted} text-xs`}>
                  Budget Allocation: <Text className="font-semibold text-slate-700 dark:text-slate-200">{selectedProject.budget.toLocaleString()} RWF</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Milestones Escrow List */}
          <View className="space-y-3">
            <Text className={`${colors.text} text-base font-bold tracking-tight`}>Contract Milestones</Text>
            {projectMilestones.map((m, index) => {
              const milestoneVal = selectedProject.budget * (m.pct / 100);
              const isPaid = m.status === 'PAID';
              const isPending = m.status === 'PENDING';

              return (
                <View key={index} className={`p-4 rounded-2xl border ${colors.card} space-y-3`}>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 space-y-1">
                      <Text className={`${colors.text} font-bold text-sm tracking-tight`}>{m.title}</Text>
                      <Text className={`${colors.textMuted} text-xs`}>
                        {m.pct}% allocation • {milestoneVal.toLocaleString()} RWF
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full border ${
                        isPaid
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : isPending
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      <Ionicons
                        name={
                          isPaid ? 'checkmark-circle' :
                          isPending ? 'time-outline' : 'alert-circle-outline'
                        }
                        size={12}
                        color={isPaid ? '#10b981' : isPending ? '#f59e0b' : '#f43f5e'}
                      />
                      <Text
                        className={`text-[10px] font-extrabold uppercase tracking-wide ${
                          isPaid ? 'text-emerald-500' : isPending ? 'text-amber-500' : 'text-rose-500'
                        }`}
                      >
                        {m.status}
                      </Text>
                    </View>
                  </View>

                  {isPending && (
                    <View className="flex-row gap-2 pt-1">
                      <TouchableOpacity
                        onPress={() => onDisputeMilestone(index)}
                        className="flex-1 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 active:bg-rose-500/10 flex-row items-center justify-center gap-1.5"
                      >
                        <Ionicons name="warning-outline" size={14} color="#f43f5e" />
                        <Text className="text-rose-500 font-bold text-xs">Request Revision</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onReleaseMilestone(index)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 active:bg-emerald-700 flex-row items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                      >
                        <Ionicons name="checkmark" size={14} color="white" />
                        <Text className="text-white font-bold text-xs">Release Funds</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Project Documents Section */}
          <View className="space-y-3 pt-2">
            <View className="flex-row justify-between items-center">
              <Text className={`${colors.text} text-base font-bold tracking-tight`}>Workspace Documents</Text>
              <TouchableOpacity 
                onPress={handleDocUploadPress}
                className="bg-primary-500/10 px-3 py-1.5 rounded-xl flex-row items-center gap-1 border border-primary-500/20 active:bg-primary-500/20"
              >
                <Ionicons name="cloud-upload-outline" size={14} color="#007E6E" />
                <Text className="text-primary-500 font-bold text-xs">Attach File</Text>
              </TouchableOpacity>
            </View>

            <View className={`border rounded-2xl p-4 ${colors.card} space-y-3`}>
              {selectedProject.documents && selectedProject.documents.length > 0 ? (
                selectedProject.documents.map((doc: any, i: number) => (
                  <View key={i} className="flex-row justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-primary-500/10 p-2 rounded-xl">
                        <Ionicons name="document-text-outline" size={16} color="#007E6E" />
                      </View>
                      <View>
                        <Text className={`${colors.text} text-xs font-semibold`} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <Text className="text-[9px] text-slate-400">Uploaded {doc.uploadedAt} • {doc.size}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => Alert.alert('Open File', `Opening ${doc.name}...`)}>
                      <Ionicons name="eye-outline" size={16} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text className="text-slate-400 text-xs py-3 text-center">No documents uploaded yet.</Text>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View className="py-12 items-center justify-center">
          <Ionicons name="folder-open-outline" size={48} color="#94a3b8" />
          <Text className={`${colors.textMuted} text-xs mt-3`}>Select a workspace project above to inspect details.</Text>
        </View>
      )}
    </View>
  );
}
