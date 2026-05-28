/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : ClientDashboard.tsx
 * WHAT THIS FILE DOES : iOS-style dashboard interface for Client users with multi-level nested page navigation
 * HOW IT DOES IT      : Bottom tabs (Dashboard, Projects, Escrow, Messages, Profile) with Light/Dark mode
 *                       and sub-navigation routing (Projects List -> Project Details -> Milestone Inspection Modal)
 * DATA SOURCE         : AuthContext user details and project states
 * DATA DESTINATION    : Escrow transactions, messaging, and profile preferences
 * PRINCIPLE APPLIED   : SOLID (Nested layout separation)
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
  Modal, 
  ActivityIndicator, 
  Image,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import { MockProject } from '../../data/mockAdminService';
import TabButton from '../../components/ui/TabButton';
import LottieAnimation from '../../components/ui/LottieAnimation';
import { EvilIcons, MaterialIcons } from '@expo/vector-icons';

type AddedProject = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  dueDate: string;
  leadEngineer: string;
  description: string;
  planFileName: string;
  planFileUri: string;
  progress: number;
  budget: number;
  status: 'Pending' | 'Active' | 'Completed';
};

type DashboardProject = MockProject & {
  planFileName?: string;
  planFileUri?: string;
  statusLabel?: string;
};

export default function ClientDashboard() {
  const screenHeight = Dimensions.get('window').height;
  const centeredModalMaxHeight = Math.floor(screenHeight * 0.9);
  const bottomSheetModalMaxHeight = Math.floor(screenHeight * 0.85);
  const addProjectFormMaxHeight = Math.floor(screenHeight * 0.6);

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
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'escrow' | 'messages' | 'profile'>('dashboard');

  // Sub-Navigation State (High-level vs Low-level drill-down detail pages inside Projects Tab)
  const [projectsView, setProjectsView] = useState<'list' | 'details'>('list');
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(-1);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  // Theme support
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    card: isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/80 shadow-sm',
    text: isDark ? 'text-white font-openSans' : 'text-slate-900 font-openSans',
    textSecondary: isDark ? 'text-slate-300 font-openSans' : 'text-slate-800 font-openSans',
    textMuted: isDark ? 'text-slate-400 font-openSans' : 'text-slate-500 font-openSans',
    border: isDark ? 'border-slate-800' : 'border-slate-250',
    inputBg: isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200',
    tabBar: isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200',
    activeTab: 'text-primary-500',
    inactiveTab: isDark ? 'text-slate-500' : 'text-slate-400',
  };

  // Dashboard states
  const [escrowBalance, setEscrowBalance] = useState(40500000);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [addedProjects, setAddedProjects] = useState<AddedProject[]>([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Add project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  const [newProjectLeadEngineer, setNewProjectLeadEngineer] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [projectPlanFileName, setProjectPlanFileName] = useState('');
  const [projectPlanFileUri, setProjectPlanFileUri] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'start' | 'due'>('start');

  // Active project list
  const clientProjects: DashboardProject[] = projects.filter(
    (p) => p.client === user?.name || p.client === 'Grace Uwase'
  );
  const addedProjectsAsDashboard: DashboardProject[] = addedProjects.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    client: user?.name || 'Client User',
    engineer: p.leadEngineer,
    supervisor: 'Not assigned',
    progress: p.progress,
    budget: p.budget,
    escrowBalance: 0,
    milestones: [],
    status: 'DRAFT',
    planFileName: p.planFileName,
    planFileUri: p.planFileUri,
    statusLabel: p.status,
  }));
  const allClientProjects: DashboardProject[] = [
    ...addedProjectsAsDashboard,
    ...clientProjects,
  ];
  const [selectedProject, setSelectedProject] = useState<DashboardProject | null>(
    allClientProjects[0] || null
  );

  // Milestone list state
  const [milestones, setMilestones] = useState(
    selectedProject?.milestones || []
  );

  // Messages states
  const [chatText, setChatText] = useState('');
  const [messagesList, setMessagesList] = useState([
    { id: '1', sender: 'Eric (Engineer)', text: 'Hello Grace! The foundation concrete has set. I have issued the check to Aline.', time: '10:15 AM' },
    { id: '2', sender: 'You', text: 'Great. Let me check the inspection report inside the portal now.', time: '10:20 AM' },
    { id: '3', sender: 'Aline (Supervisor)', text: 'Perfect. Inspection verified! Rebar alignment and concrete depth meet specifications.', time: '11:05 AM' },
    { id: '4', sender: 'You', text: 'Excellent, releasing foundation escrow cash now.', time: '11:30 AM' },
  ]);

  // Construction progress photo slides widget
  const progressPhotos = [
    { id: '1', title: 'Foundation Footing Pour', date: 'May 12, 2026', uri: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80' },
    { id: '2', title: 'Reinforcement Steel Placement', date: 'May 18, 2026', uri: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=400&q=80' },
    { id: '3', title: 'Framing & Pillar Masonry', date: 'May 23, 2026', uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80' },
  ];

  const handleSendMessage = () => {
    if (!chatText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessagesList(prev => [...prev, newMessage]);
    setChatText('');

    setTimeout(() => {
      setMessagesList(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'Eric (Engineer)',
        text: 'Received! We are setting up masonry scaffoldings next.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

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
            setShowMilestoneModal(false);
            Alert.alert('Payment Approved', `Funds released successfully! Engineer has been notified.`);
          } 
        }
      ]
    );
  };

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
            setShowMilestoneModal(false);
            Alert.alert(
              'Dispute Logged',
              'Mediation dispute opened. Administrator assigned to review checklist & progress photos.'
            );
          }
        }
      ]
    );
  };

  const handleOpenMilestoneDetails = (m: any, index: number) => {
    setSelectedMilestone(m);
    setSelectedMilestoneIndex(index);
    setShowMilestoneModal(true);
  };

  const handlePickProjectPlan = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length) {
        setProjectPlanFileName(result.assets[0].name || 'Selected file');
        setProjectPlanFileUri(result.assets[0].uri || '');
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to select project plan file.');
    }
  };

  const formatDateValue = (date: Date) => date.toISOString().split('T')[0];

  const openDatePicker = (field: 'start' | 'due') => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const getPickerDate = () => {
    const sourceDate =
      activeDateField === 'start' ? newProjectStartDate : newProjectDueDate;
    const parsed = sourceDate ? new Date(sourceDate) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShowDatePicker(false);
      return;
    }

    const formatted = formatDateValue(selectedDate);
    if (activeDateField === 'start') {
      setNewProjectStartDate(formatted);
    } else {
      setNewProjectDueDate(formatted);
    }

    // Close picker immediately after selection for all platforms.
    setShowDatePicker(false);
  };

  const resetAddProjectForm = () => {
    setNewProjectName('');
    setNewProjectLocation('');
    setNewProjectStartDate('');
    setNewProjectDueDate('');
    setNewProjectLeadEngineer('');
    setNewProjectDescription('');
    setProjectPlanFileName('');
    setProjectPlanFileUri('');
  };

  const handleAddProject = () => {
    if (!newProjectName.trim() || !newProjectLocation.trim()) {
      Alert.alert('Missing Details', 'Project name and location are required.');
      return;
    }

    const newProject: AddedProject = {
      id: `added-project-${Date.now()}`,
      name: newProjectName.trim(),
      location: newProjectLocation.trim(),
      startDate: newProjectStartDate.trim(),
      dueDate: newProjectDueDate.trim(),
      leadEngineer: newProjectLeadEngineer.trim() || 'Not assigned',
      description: newProjectDescription.trim(),
      planFileName: projectPlanFileName || 'No file uploaded',
      planFileUri: projectPlanFileUri,
      progress: 3,
      budget: 0,
      status: 'Pending',
    };

    setAddedProjects((prev) => [newProject, ...prev]);
    setShowAddProjectModal(false);
    resetAddProjectForm();
    Alert.alert('Success', 'Project added successfully.');
  };

  return (
    <View className={`flex-1 ${colors.bg}`}>
      
      {/* Dynamic Header */}
      <View className={`px-6 pt-14 pb-4 ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'}`}>
        <View className="flex-row justify-between items-center">
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
            <Text className={`${colors.textSecondary} text-sm font-bold`}>Welcome !</Text>
            <Text className="text-[#007E6E] text-base font-extrabold">{user?.name}</Text>
          </View>
          </View>

          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Text className="text-[#007E6E] text-xl">🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Areas based on Tab state */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        
        {/* ================= TAB: DASHBOARD ================= */}
        {currentTab === 'dashboard' && (
          <View className="space-y-5">
            {/* Search bar */}
            <View className={`flex-row items-center border rounded-xl mb-3 px-4 py-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              
              <TextInput
                placeholder="Enter project name or location"
                placeholderTextColor="#94a3b8"
                className={`flex-1 text-sm ${colors.text}`}
              />
              <TouchableOpacity className="ml-2">
              <EvilIcons name="search" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Stats grid */}
            <View className="flex-row gap-4">
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[11px] font-bold`}>Active project</Text>
                <Text className={`${colors.text} text-2xl font-extrabold mt-2`}>{allClientProjects.length}</Text>
                <Text className={`${colors.textMuted} text-[10px] mt-1`}>+ this month</Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[11px] font-bold`}>Total Budget</Text>
                <Text className={`${colors.text} text-2xl font-extrabold mt-2`}>
                  {allClientProjects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                </Text>
                <Text className={`${colors.textMuted} text-[10px] mt-1`}>Managed</Text>
              </View>
            </View>

            <View className="flex-row gap-4 mt-2">
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[11px] font-bold`}>Pending Milestones</Text>
                <Text className={`${colors.text} text-2xl font-extrabold mt-2`}>
                  {milestones.filter((m: any) => m.status === 'PENDING').length}
                </Text>
                <Text className={`${colors.textMuted} text-[10px] mt-1`}>in review</Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[11px] font-bold`}>Completion Rate</Text>
                <Text className={`${colors.text} text-2xl font-extrabold mt-2`}>{selectedProject?.progress ?? 0}%</Text>
                <Text className={`${colors.textMuted} text-[10px] mt-1`}>Above average</Text>
              </View>
            </View>

            {/* Latest project */}
            <View className="pt-2">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#007E6E] text-base font-extrabold tracking-wider">LATEST PROJECT</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddProjectModal(true);
                  }}
                  className="bg-[#007E6E] px-4 py-2 rounded-lg flex-row items-center"
                >
                  <Text className="text-white font-bold text-sm">+ </Text>
                  <Text className="text-white font-bold text-sm">Project</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setCurrentTab('projects');
                  setProjectsView('list');
                }}
                className="items-end mb-2"
              >
                <Text className="text-blue-500 text-sm">View all</Text>
              </TouchableOpacity>

              {addedProjects.length > 0 ? (
                <View className="space-y-3">
                  {addedProjects.slice(0, 3).map((proj) => (
                    <View key={proj.id} className={`rounded-2xl border p-4 ${colors.card}`}>
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-3">
                          <View className="flex-row items-center mb-2">
                            <Text className="text-slate-500 text-xl mr-2">🕒</Text>
                            <Text className={`${colors.text} text-2xl font-bold mr-3`}>
                              {proj.name}
                            </Text>
                            <View className="bg-amber-600 px-3 py-1 rounded-full">
                              <Text className="text-white text-xs font-semibold">{proj.status}</Text>
                            </View>
                          </View>
                          <Text className={`${colors.textSecondary} text-base mb-1`}>
                            📍 <Text className="text-[#007E6E] font-semibold">Location</Text> : {proj.location}
                          </Text>
                          <Text className={`${colors.textSecondary} text-base`}>
                            💰 <Text className="text-[#007E6E] font-semibold">Budget</Text> : {proj.budget} Rwf
                          </Text>
                        </View>
                        <View className="w-16 h-16 rounded-full border-[8px] border-slate-300 items-center justify-center">
                          <Text className={`${colors.text} font-bold text-lg`}>{proj.progress}%</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className={`p-6 rounded-2xl border ${colors.card} items-center justify-center`}>
                  <Text className={`${colors.textMuted} text-sm`}>No Project created Yet</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= TAB: PROJECTS (WITH SUB-NAVIGATION NESTED PAGES) ================= */}
        {currentTab === 'projects' && (
          <View className="space-y-4">
            
            {/* View 1: High-Level Projects directory list */}
            {projectsView === 'list' ? (
              <View className="space-y-4">
                <Text className={`${colors.text} text-lg font-bold mb-1`}>Your Construction Investments</Text>
                {allClientProjects.map((proj) => (
                  <TouchableOpacity
                    key={proj.id}
                    onPress={() => {
                      setSelectedProject(proj);
                      setMilestones(proj.milestones || []);
                      setProjectsView('details');
                    }}
                    className={`p-5 rounded-3xl border ${colors.card} space-y-3`}
                  >
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text className={`${colors.text} font-bold text-base`}>{proj.name}</Text>
                        <Text className={`${colors.textMuted} text-xs mt-0.5`}>📍 {proj.location}</Text>
                        {proj.planFileName ? (
                          <Text className={`${colors.textMuted} text-[10px] mt-0.5`}>
                            📎 Plan: {proj.planFileName}
                          </Text>
                        ) : null}
                      </View>
                      <View className="bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                        <Text className="text-primary-500 text-xs font-bold">{proj.progress}%</Text>
                      </View>
                    </View>
                    
                    <View className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <View className="h-full bg-primary-500" style={{ width: `${proj.progress}%` }} />
                    </View>

                    <View className="flex-row justify-between items-center text-xs pt-1">
                      <Text className={colors.textMuted}>Budget: {proj.budget.toLocaleString()} RWF</Text>
                      <Text className="text-primary-500 font-bold text-xs">
                        {proj.statusLabel ? `${proj.statusLabel} • ` : ''}View Details ➔
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              
              /* View 2: Low-Level Drill-Down Detail page */
              <View className="space-y-5">
                {/* Back Navigation Bar */}
                <TouchableOpacity
                  onPress={() => setProjectsView('list')}
                  className="flex-row items-center py-2"
                >
                  <Text className="text-primary-500 text-lg font-bold">←</Text>
                  <Text className="text-primary-500 text-sm font-bold ml-2">Back to Project Directory</Text>
                </TouchableOpacity>

                {/* Project Header Widget */}
                <View className={`p-5 rounded-3xl border ${colors.card} flex-row justify-between items-center`}>
                  <View className="flex-1 pr-2 space-y-1">
                    <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Currently Managing</Text>
                    <Text className={`${colors.text} text-xl font-extrabold`}>{selectedProject?.name}</Text>
                    <Text className={`${colors.textSecondary} text-xs font-medium`}>📍 Location: {selectedProject?.location}</Text>
                    <Text className={`${colors.textSecondary} text-xs font-medium`}>👷‍♂️ Contractor: {selectedProject?.engineer}</Text>
                    <Text className={`${colors.textSecondary} text-xs font-medium`}>💰 Total Budget: {selectedProject?.budget.toLocaleString()} RWF</Text>
                  </View>
                  <LottieAnimation type="construction" size={75} />
                </View>

                {/* Widget 1: Horizontally Scrollable Construction Progress Photos */}
                <View className="space-y-3">
                  <Text className={`${colors.text} font-bold text-sm ml-1`}>Recent Site Progress Photos</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row gap-3"
                  >
                    {progressPhotos.map(photo => (
                      <View 
                        key={photo.id}
                        className={`w-64 rounded-2xl overflow-hidden border mr-3 ${colors.card}`}
                      >
                        <Image 
                          source={{ uri: photo.uri }}
                          className="w-full h-32"
                        />
                        <View className="p-3">
                          <Text className={`${colors.text} font-bold text-xs`}>{photo.title}</Text>
                          <Text className={`${colors.textMuted} text-[10px] mt-0.5`}>Uploaded: {photo.date}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Widget 2: Vertical Stepper Timeline for Milestones */}
                <View className="space-y-3">
                  <Text className={`${colors.text} font-bold text-sm ml-1`}>Milestones Checklist Timeline</Text>
                  
                  <View className="space-y-4 pl-3 relative border-l border-slate-350 dark:border-slate-700 ml-4 pt-2">
                    {milestones.map((m, idx) => {
                      const isPaid = m.status === 'PAID';
                      const isPending = m.status === 'PENDING';
                      
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleOpenMilestoneDetails(m, idx)}
                          className="relative pl-6 pb-2"
                        >
                          {/* Timeline node marker indicator */}
                          <View 
                            className={`w-4 h-4 rounded-full border-2 absolute -left-[30px] top-0.5 justify-center items-center ${
                              isPaid 
                                ? 'bg-emerald-500 border-emerald-600' 
                                : isPending
                                ? 'bg-amber-500 border-amber-600'
                                : 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700'
                            }`}
                          />

                          <View className={`p-4 rounded-2xl border ${colors.card} flex-row justify-between items-center`}>
                            <View className="flex-1 pr-2">
                              <Text className={`${colors.text} font-bold text-xs`}>{m.name}</Text>
                              <Text className={`${colors.textMuted} text-[10px] mt-0.5`}>Weight: {m.pct}% ({((selectedProject?.budget || 0) * m.pct / 100).toLocaleString()} RWF)</Text>
                            </View>
                            <Text className={`text-[10px] font-bold ${isPaid ? 'text-emerald-500' : isPending ? 'text-amber-500' : colors.textMuted}`}>
                              {m.status} ➔
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB: ESCROW VAULT ================= */}
        {currentTab === 'escrow' && (
          <View className="space-y-4">
            <View className={`p-5 rounded-3xl border ${colors.card} items-center`}>
              <LottieAnimation type="secure" size={100} />
              <Text className={`${colors.textMuted} text-xs font-bold uppercase mt-2`}>Partnership Escrow Vault</Text>
              <Text className={`${colors.text} text-3xl font-robotoMono font-extrabold mt-1 mb-4`}>
                {escrowBalance.toLocaleString()} <Text className="text-primary-500 text-xl font-bold">RWF</Text>
              </Text>
              
              <TouchableOpacity 
                onPress={() => setShowDepositModal(true)}
                className="bg-primary-500 active:bg-primary-650 py-3.5 w-full rounded-xl items-center border border-primary-600"
              >
                <Text className="text-white font-openSans font-bold text-sm">💰 Deposit Escrow Wallet</Text>
              </TouchableOpacity>
            </View>

            <Text className={`${colors.text} text-base font-bold mt-4 mb-2`}>Recent Transactions</Text>
            <View className={`p-4 rounded-2xl border ${colors.card} space-y-3`}>
              <View className="flex-row justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/50">
                <View>
                  <Text className={`${colors.text} text-xs font-bold`}>MTN MoMo Deposit</Text>
                  <Text className={`${colors.textMuted} text-[10px]`}>May 25, 2026</Text>
                </View>
                <Text className="text-emerald-500 font-bold text-xs">+10,000,000 RWF</Text>
              </View>
              <View className="flex-row justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/50">
                <View>
                  <Text className={`${colors.text} text-xs font-bold`}>Milestone #1 Paid</Text>
                  <Text className={`${colors.textMuted} text-[10px]`}>May 24, 2026</Text>
                </View>
                <Text className="text-slate-500 font-bold text-xs">-8,200,000 RWF</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className={`${colors.text} text-xs font-bold`}>Milestone #2 Paid</Text>
                  <Text className={`${colors.textMuted} text-[10px]`}>May 24, 2026</Text>
                </View>
                <Text className="text-slate-500 font-bold text-xs">-20,500,000 RWF</Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB: MESSAGES ================= */}
        {currentTab === 'messages' && (
          <View className="space-y-4">
            <View className={`p-4 rounded-2xl border ${colors.card} h-96 flex-col justify-between`}>
              <ScrollView showsVerticalScrollIndicator={false} className="space-y-3 flex-1 pr-1">
                {messagesList.map(msg => (
                  <View 
                    key={msg.id} 
                    className={`p-3 rounded-2xl max-w-[80%] ${
                      msg.sender === 'You' 
                        ? 'bg-emerald-600 self-end rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-700/50 self-start rounded-tl-none'
                    }`}
                  >
                    <Text className={`${colors.textMuted} text-[9px] font-bold mb-0.5`}>{msg.sender}</Text>
                    <Text className={`text-xs ${msg.sender === 'You' ? 'text-white' : colors.text}`}>{msg.text}</Text>
                    <Text className={`text-[8px] text-right mt-1 ${msg.sender === 'You' ? 'text-emerald-250' : colors.textMuted}`}>{msg.time}</Text>
                  </View>
                ))}
              </ScrollView>

              <View className="flex-row gap-2 border-t border-slate-100 dark:border-slate-700 pt-3 mt-2">
                <TextInput
                  value={chatText}
                  onChangeText={setChatText}
                  placeholder="Type message to constructor..."
                  placeholderTextColor="#94a3b8"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs ${colors.inputBg} ${colors.text}`}
                />
                <TouchableOpacity 
                  onPress={handleSendMessage}
                  className="bg-emerald-600 px-4 py-2.5 rounded-xl justify-center items-center"
                >
                  <Text className="text-white font-bold text-xs">Send</Text>
                </TouchableOpacity>
              </View>
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
              <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded mt-2">
                <Text className="text-emerald-500 text-[10px] font-bold uppercase">KYC status: {user?.kycStatus}</Text>
              </View>
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

            {/* Verification admin controller */}
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl items-center"
            >
              <Text className="text-red-500 font-bold text-sm">Logout</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* iOS style custom bottom navigation */}
      <View className="absolute bottom-4 left-0 right-0">
        <View className="mx-6 bg-[#007E6E] rounded-full flex-row justify-around items-center h-16 shadow-lg">
        <TabButton
          label="Dash"
          iconName="home-outline"
          activeIconName="home"
          isActive={currentTab === 'dashboard'}
          onPress={() => setCurrentTab('dashboard')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="Builds"
          iconName="construct-outline"
          activeIconName="construct"
          isActive={currentTab === 'projects'}
          onPress={() => setCurrentTab('projects')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="Vault"
          iconName="wallet-outline"
          activeIconName="wallet"
          isActive={currentTab === 'escrow'}
          onPress={() => setCurrentTab('escrow')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="Chat"
          iconName="chatbubbles-outline"
          activeIconName="chatbubbles"
          isActive={currentTab === 'messages'}
          onPress={() => setCurrentTab('messages')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        <TabButton
          label="User"
          iconName="person-outline"
          activeIconName="person"
          isActive={currentTab === 'profile'}
          onPress={() => setCurrentTab('profile')}
          isDark={isDark}
          variant="pill"
          showLabel={false}
        />
        </View>
      </View>

      {/* Add Project Modal */}
      <Modal
        visible={showAddProjectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddProjectModal(false)}
      >
        <View className="flex-1 bg-black/35 justify-center px-4">
          <View
            style={{ maxHeight: centeredModalMaxHeight }}
            className={`rounded-3xl p-5 border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[#007E6E] text-xl font-bold tracking-wide">Create new project</Text>
              <TouchableOpacity onPress={() => setShowAddProjectModal(false)}>
                <Text className={`${colors.text} text-xl`}>✕</Text>
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-[#007E6E] mb-4" />

            <ScrollView
              style={{ maxHeight: addProjectFormMaxHeight }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text className={`${colors.textSecondary} text-lg mb-2`}>Project Name</Text>
              <View className={`border rounded-xl px-4 py-0.5 mb-3 flex-row items-center ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'}`}>
                <MaterialIcons name="folder" size={24} color="#94a3b8" />
                <TextInput
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  placeholder="Enter Project"
                  placeholderTextColor="#9ca3af"
                  className={`flex-1 text-lg ${colors.text}`}
                />
              </View>

              <Text className={`${colors.textSecondary} text-lg mb-2`}>Location</Text>
              <View className={`border rounded-xl px-4 py-0.5 mb-3 flex-row items-center ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'}`}>
                <MaterialIcons name="location-on" size={24} color="#94a3b8" />
                <TextInput
                  value={newProjectLocation}
                  onChangeText={setNewProjectLocation}
                  placeholder="Project location"
                  placeholderTextColor="#9ca3af"
                  className={`flex-1 text-lg ${colors.text}`}
                />
              </View>

              <Text className={`${colors.textSecondary} text-lg mb-2`}>Start Date</Text>
              <TouchableOpacity
                onPress={() => openDatePicker('start')}
                className={`border rounded-xl px-4 py-3 mb-3 flex-row items-center ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'}`}
              >
                <Text className={`flex-1 text-lg text-center ${newProjectStartDate ? colors.text : 'text-slate-400'}`}>
                  {newProjectStartDate || 'Starting Date'}
                </Text>
                <MaterialIcons name="date-range" size={24} color="#94a3b8" />
              </TouchableOpacity>

              <Text className={`${colors.textSecondary} text-lg mb-2`}>Due Date</Text>
              <TouchableOpacity
                onPress={() => openDatePicker('due')}
                className={`border rounded-xl px-4 py-3 mb-3 flex-row items-center ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'}`}
              >
                <Text className={`flex-1 text-lg text-center ${newProjectDueDate ? colors.text : 'text-slate-400'}`}>
                  {newProjectDueDate || 'Project Deadline'}
                </Text>
                <MaterialIcons name="date-range" size={24} color="#94a3b8" />
              </TouchableOpacity>

              <Text className={`${colors.textSecondary} text-lg mb-2`}>Project Plan File</Text>
              <TouchableOpacity
                onPress={handlePickProjectPlan}
                className={`border rounded-xl px-4 py-4 mb-3 flex-row items-center ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'}`}
              >
                <MaterialIcons name="attach-file" size={24} color="#94a3b8" />
                <Text className={`${projectPlanFileName ? colors.text : 'text-slate-400'} text-base flex-1`}>
                  {projectPlanFileName || 'Upload project plan (any file type)'}
                </Text>
                <Text className="text-[#007E6E] text-xs font-bold">Browse</Text>
              </TouchableOpacity>

              <Text className={`${colors.textSecondary} text-lg mb-2`}>Project Description</Text>
              <View className={`border rounded-xl px-4 py-3 mb-4 ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'}`}>
                <TextInput
                  value={newProjectDescription}
                  onChangeText={setNewProjectDescription}
                  placeholder="Describe project scope and objectives"
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="top"
                  className={`min-h-28 text-lg ${colors.text}`}
                />
              </View>
            </ScrollView>

            <View className={`pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <TouchableOpacity
                onPress={handleAddProject}
                className="bg-[#007E6E] py-4 rounded-2xl items-center"
              >
                <Text className="text-white text-xl font-bold tracking-wide">Add Project</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker ? (
              <DateTimePicker
                value={getPickerDate()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Widget 3: Low-Level Drill-Down Milestone Inspection Details Modal */}
      <Modal
        visible={showMilestoneModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMilestoneModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ maxHeight: bottomSheetModalMaxHeight }}
            className={`border-t rounded-t-3xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`${colors.text} text-base font-bold`}>Milestone Verification Audit</Text>
              <TouchableOpacity onPress={() => setShowMilestoneModal(false)}>
                <Text className={`${colors.textMuted} text-lg font-bold`}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <View className="space-y-3 mb-5">
                <View className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Text className={`${colors.textMuted} text-[10px] font-bold uppercase`}>Milestone Title</Text>
                  <Text className={`${colors.text} text-sm font-bold mt-0.5`}>{selectedMilestone?.name}</Text>
                  <Text className={`${colors.textMuted} text-xs mt-1`}>Status: <Text className="text-emerald-500 font-bold uppercase">{selectedMilestone?.status}</Text></Text>
                </View>

                {/* Inspector Quality Checklist widget */}
                <View className="space-y-2">
                  <Text className={`${colors.text} text-xs font-bold mb-1 ml-1`}>Inspector Checklist Certifications</Text>
                  <View className="space-y-1.5 pl-1.5">
                    <Text className={`${colors.textSecondary} text-xs`}>✓ Concrete strength matches IER spec (Verified)</Text>
                    <Text className={`${colors.textSecondary} text-xs`}>✓ Foundation depth meets required limits (Verified)</Text>
                    <Text className={`${colors.textSecondary} text-xs`}>✓ Steel rebar alignment strictly checked (Verified)</Text>
                    <Text className={`${colors.textSecondary} text-xs`}>✓ Digital signature certificate ledger ID: #SIG-89240 (Signed)</Text>
                  </View>
                </View>
              </View>

              {selectedMilestone?.status === 'PENDING' && (
                <View className="flex-row gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <TouchableOpacity 
                    onPress={() => handleReleaseMilestone(selectedMilestoneIndex, selectedMilestone?.name, selectedMilestone?.pct)}
                    className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl flex-1 items-center justify-center shadow-lg border border-emerald-500"
                  >
                    <Text className="text-white font-bold text-xs">Release Milestone Cash</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleInitiateDispute(selectedMilestoneIndex, selectedMilestone?.name)}
                    className="bg-red-500/10 border border-red-500/25 py-3.5 rounded-xl flex-1 items-center justify-center"
                  >
                    <Text className="text-red-500 font-bold text-xs">Raise Dispute</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Deposit MoMo Webview Simulation Modal */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ maxHeight: bottomSheetModalMaxHeight }}
            className={`border-t rounded-t-3xl p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`${colors.text} text-lg font-bold`}>MTN Mobile Money Gateway</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Text className={`${colors.textMuted} text-lg font-bold`}>✕</Text>
              </TouchableOpacity>
            </View>

            {isProcessingPayment ? (
              <View className="items-center justify-center py-10 space-y-4">
                <LottieAnimation type="loading" size={90} />
                <Text className={`${colors.text} text-sm font-semibold text-center mt-2`}>
                  Connecting to MTN Mobile Money...
                </Text>
                <Text className={`${colors.textMuted} text-xs text-center`}>
                  Please approve the USSD prompt on device: {momoNumber}
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text className={`${colors.textMuted} text-xs mb-4`}>
                  Provide payment details to request direct escrow funding verification callback.
                </Text>

                <View className="space-y-3 mb-5">
                  <View>
                    <Text className={`${colors.textMuted} text-[10px] font-bold mb-1.5 ml-1`}>MTN Phone Number</Text>
                    <TextInput
                      className={`rounded-xl px-4 py-3 text-sm ${colors.inputBg} ${colors.text}`}
                      placeholder="+250788100000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      value={momoNumber}
                      onChangeText={setMomoNumber}
                    />
                  </View>

                  <View>
                    <Text className={`${colors.textMuted} text-[10px] font-bold mb-1.5 ml-1`}>Deposit Amount (RWF)</Text>
                    <TextInput
                      className={`rounded-xl px-4 py-3 text-sm ${colors.inputBg} ${colors.text}`}
                      placeholder="5,000,000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      value={depositAmount}
                      onChangeText={setDepositAmount}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={handleDepositFunds}
                  className="bg-primary-500 active:bg-primary-600 py-3.5 rounded-xl items-center flex-row justify-center shadow-lg border border-primary-600"
                >
                  <Text className="text-white font-openSans font-bold text-sm">Confirm & Authorize MoMo</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
