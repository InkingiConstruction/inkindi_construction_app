/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : EngineerDashboard.tsx
 * WHAT THIS FILE DOES : Comprehensive dashboard interface for Engineer users (e.g. Eric Ndayisaba)
 * HOW IT DOES IT      : Renders active projects, daily progress upload logs, and payment request prompts
 * DATA SOURCE         : AuthContext states and local state simulations
 * DATA DESTINATION    : Updates milestone status and daily photo records
 * PRINCIPLE APPLIED   : SOLID (Engineer dashboard encapsulation)
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MockProject } from '../../data/mockAdminService';

/**
 * ============================================================================
 * 🔧 FUNCTION: EngineerDashboard
 * ============================================================================
 * WHAT IT DOES: Renders engineer workspace, IER registry badge, milestone progress and camera capture
 * PARAMETERS: None
 * RETURNS: JSX.Element - Dashboard view
 * WHO CALLS IT: index.tsx
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export default function EngineerDashboard() {
  const { user, projects, handleLogout } = useAuth();
  
  // Dashboard states
  const engineerProjects = projects.filter(p => p.engineer === user?.name || p.engineer === 'Eric Ndayisaba');
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(engineerProjects[0] || null);
  
  const [milestones, setMilestones] = useState(selectedProject?.milestones || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
  ]);

  /**
   * 🧱 CODE BLOCK: Daily Progress Upload Simulator
   * WHAT IT IS DOING: Simulates secure Cloudinary upload of on-site photo telemetry
   * WHY IT IS HERE  : Standard engineer daily progress reporting (Step 13)
   * PRINCIPLE       : KISS
   */
  const handleDailyPhotoUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const randomPhotos = [
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80'
      ];
      const newPic = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
      setUploadedPhotos(prev => [newPic, ...prev]);
      Alert.alert(
        'Daily Upload Successful',
        'Uploaded 1 photo with telemetry tags (GPS: Kicukiro, Timestamp: Now) directly to Cloudinary project folder.',
        [{ text: 'Perfect' }]
      );
    }, 1500);
  };

  /**
   * 🧱 CODE BLOCK: Request Milestone Payment Approval
   * WHAT IT IS DOING: Requests verification check from supervisor & client
   * WHY IT IS HERE  : Triggers the payment release inspection flow (Step 14)
   * PRINCIPLE       : KISS
   */
  const handleRequestPayment = (index: number, name: string) => {
    Alert.alert(
      'Submit Completion Request',
      `Flag "${name}" as 100% complete and request supervisor checklist review?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Review',
          onPress: () => {
            const updated = [...milestones];
            // Simulate status update
            updated[index].status = 'PENDING';
            setMilestones(updated);
            Alert.alert(
              'Inspection Scheduled',
              'Alert sent to Supervisor Aline Mukamana. Checklist verification required at site before release.'
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
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Welcome Engineer</Text>
          <Text className="text-white text-2xl font-extrabold">{user?.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl"
        >
          <Text className="text-red-400 text-xs font-bold">Logout ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Professional Registry Status Badge */}
      <View className="bg-emerald-950/60 border border-emerald-500/20 rounded-3xl p-5 mb-6 shadow-xl flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-1">Professional License</Text>
          <Text className="text-white text-lg font-extrabold">{user?.licenseNumber || 'IER-2026-8942'}</Text>
          <Text className="text-slate-400 text-xs mt-1">Status: Active & Registered (Rwanda Institution of Engineers)</Text>
        </View>
        <View className="w-12 h-12 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl items-center justify-center">
          <Text className="text-2xl">✓</Text>
        </View>
      </View>

      {/* Active Project Card */}
      {selectedProject ? (
        <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 mb-6 shadow-xl">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Contracted Build</Text>
              <Text className="text-white text-lg font-bold">{selectedProject.name}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">📍 {selectedProject.location}</Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-md">
              <Text className="text-emerald-400 text-xs font-bold">{selectedProject.progress}% Progress</Text>
            </View>
          </View>

          {/* Daily Progress Camera Section */}
          <Text className="text-white font-extrabold text-base mb-3">Daily Progress Logging</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Capture or simulate uploading progress telemetry to automatically keep the Diaspora investor up-to-date.
          </Text>

          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity 
              onPress={handleDailyPhotoUpload}
              disabled={isUploading}
              className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-2xl items-center justify-center flex-1 border border-emerald-500 shadow-md flex-row"
            >
              {isUploading ? (
                <ActivityIndicator color="#white" size="small" className="mr-2" />
              ) : null}
              <Text className="text-white font-bold text-sm">📸 Upload Photo</Text>
            </TouchableOpacity>

            <View className="bg-slate-900 border border-slate-700 px-4 rounded-2xl justify-center items-center">
              <Text className="text-slate-300 font-bold text-xs">{uploadedPhotos.length} Total Pics</Text>
            </View>
          </View>

          {/* Micro Progress Thumbnail Previews */}
          <View className="flex-row gap-2.5 mb-6">
            {uploadedPhotos.map((url, i) => (
              <View key={i} className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
              </View>
            ))}
          </View>

          {/* Milestone Management Builder */}
          <Text className="text-white font-extrabold text-base mb-4">BoQ Milestones & Completion</Text>
          <View className="space-y-3">
            {milestones.map((m, idx) => (
              <View 
                key={idx} 
                className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">{m.name}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">Budget Allocation: {m.pct}% ({((selectedProject.budget * m.pct) / 100).toLocaleString()} RWF)</Text>
                  </View>
                  
                  <View className="items-end">
                    <View className={`px-2 py-0.5 rounded border mb-2 ${
                      m.status === 'PAID' 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-amber-500/10 border-amber-500/20'
                    }`}>
                      <Text className={`text-[10px] font-extrabold uppercase ${
                        m.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {m.status}
                      </Text>
                    </View>

                    {m.status !== 'PAID' && m.status !== 'PENDING' && (
                      <TouchableOpacity
                        onPress={() => handleRequestPayment(idx, m.name)}
                        className="bg-emerald-600/20 border border-emerald-500/30 px-3 py-1 rounded-lg"
                      >
                        <Text className="text-emerald-400 text-xs font-bold">Request Pay</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="bg-slate-800 border border-slate-700 p-8 rounded-3xl items-center">
          <Text className="text-slate-400 text-center font-bold">No projects assigned yet.</Text>
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
