/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : EngineerDashboard.tsx
 * WHAT THIS FILE DOES : iOS-style dashboard interface for Engineer users (e.g. Eric Ndayisaba)
 * HOW IT DOES IT      : Renders bottom tab navigation (Dashboard, Projects, BoQ, Messages, Profile) with Light/Dark mode
 * DATA SOURCE         : AuthContext user details and project states
 * DATA DESTINATION    : Milestone requests, chat, and profile preferences
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
  Modal,
  ActivityIndicator, 
  Image,
  Switch 
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LottieAnimation from '../../components/ui/LottieAnimation';
import DashboardShell, { TabDef } from './shared/DashboardShell';

const ENGINEER_TABS: TabDef[] = [
  { key: 'dashboard', label: 'Home',     icon: 'home-outline',         activeIcon: 'home' },
  { key: 'projects',  label: 'Projects', icon: 'construct-outline',    activeIcon: 'construct' },
  { key: 'rfqs',      label: 'RFQs',     icon: 'document-text-outline', activeIcon: 'document-text' },
  { key: 'earnings',  label: 'Earnings', icon: 'cash-outline',         activeIcon: 'cash' },
  { key: 'profile',   label: 'Profile',  icon: 'person-outline',       activeIcon: 'person' },
];
import { MockProject } from '../../data/mockAdminService';
import * as ImagePicker from 'expo-image-picker';

type ProjectInvitation = {
  id: string;
  name: string;
  clientName: string;
  clientContact: string;
  budget: number;
  location: string;
  locationMapPreview: string;
  description: string;
  startDate: string;
  dueDate: string;
  sitePhotos: string[];
};

type ManagedProject = MockProject & {
  engineerId: string;
  clientContact: string;
  startDate: string;
  dueDate: string;
  description: string;
  documents: string[];
};

type EngineerMilestone = {
  id: string;
  name: string;
  pct: number;
  durationDays: number;
  acceptanceCriteria: string;
  status: 'PAID' | 'PENDING' | 'REVISION';
};

type BoqCategory =
  | 'Concrete'
  | 'Steel'
  | 'Timber'
  | 'Finishes'
  | 'Labor'
  | 'Equipment';

type BoqUnit =
  | 'bags'
  | 'cubic_meters'
  | 'pieces'
  | 'lumpsum'
  | 'meters'
  | 'tons';

type BoqItem = {
  id: string;
  category: BoqCategory;
  materialName: string;
  quantity: number;
  unit: BoqUnit;
  unitPrice: number;
};

type DailyProgressMedia = {
  id: string;
  uri: string;
  type: 'image' | 'video';
};

type DailyProgressUpdate = {
  id: string;
  description: string;
  media: DailyProgressMedia[];
  createdAt: string;
};

export default function EngineerDashboard() {
  const { 
    user, 
    projects, 
    theme, 
    toggleTheme, 
    handleLogout
  } = useAuth();
  
  // Custom Bottom Tabs Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'rfqs' | 'earnings' | 'profile'>('dashboard');

  // Theme support
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    card: isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/80 shadow-sm',
    text: isDark ? 'text-white font-openSans' : 'text-slate-900 font-openSans',
    textSecondary: isDark ? 'text-slate-355' : 'text-slate-855',
    textMuted: isDark ? 'text-slate-400 font-openSans' : 'text-slate-500 font-openSans',
    border: isDark ? 'border-slate-800' : 'border-slate-200',
    inputBg: isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200',
    tabBar: isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200',
    activeTab: 'text-primary-500',
  };

  const engineerId = user?.id || 'usr-engineer-001';
  const engineerName = user?.name || 'Eric Ndayisaba';

  const [pendingInvitations, setPendingInvitations] = useState<ProjectInvitation[]>([
    {
      id: 'inv-villa-nyarutarama',
      name: 'Villa Nyarutarama',
      clientName: 'Mucyo Herve',
      clientContact: '+250 788 345 901',
      budget: 85000000,
      location: 'Nyarutarama, Kigali',
      locationMapPreview:
        'https://res.cloudinary.com/demo/image/upload/v1717413470/samples/landscapes/nature-mountains.jpg',
      description:
        'A modern 4-bedroom villa with landscaping and swimming pool, including premium finishing.',
      startDate: '2025-03-15',
      dueDate: '2025-10-30',
      sitePhotos: [
        'https://res.cloudinary.com/demo/image/upload/v1693007360/cld-sample-2.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1693007360/cld-sample-3.jpg',
      ],
    },
  ]);
  const [selectedInvitation, setSelectedInvitation] =
    useState<ProjectInvitation | null>(null);

  const baseEngineerProjects: ManagedProject[] = projects
    .filter((p) => p.engineer === user?.name || p.engineer === 'Eric Ndayisaba')
    .map((p) => ({
      ...p,
      engineerId,
      clientContact: '+250 788 000 000',
      startDate: '2025-03-15',
      dueDate: '2025-12-15',
      description: `Engineering supervision for ${p.name}.`,
      documents: ['Project plan'],
    }));

  const [acceptedProjects, setAcceptedProjects] =
    useState<ManagedProject[]>(baseEngineerProjects);
  const [projectView, setProjectView] = useState<'list' | 'overview'>('list');
  const [selectedProject, setSelectedProject] = useState<ManagedProject | null>(
    baseEngineerProjects[0] || null
  );
  const [projectStatusTab, setProjectStatusTab] = useState<'active' | 'completed'>('active');

  const activeProjects = acceptedProjects.filter(
    (p) => p.status !== 'COMPLETED'
  );
  const completedProjects = acceptedProjects.filter(
    (p) => p.status === 'COMPLETED'
  );

  const projectsForTab =
    projectStatusTab === 'active' ? activeProjects : completedProjects;

  // States
  const [isSubmittingRFQ, setIsSubmittingRFQ] = useState(false);
  const [rfqMaterial, setRfqMaterial] = useState('');
  const [rfqQty, setRfqQty] = useState('');

  // Milestone requests
  const [milestones, setMilestones] = useState(
    selectedProject?.milestones || []
  );

  const [milestonesByProject, setMilestonesByProject] = useState<Record<string, EngineerMilestone[]>>({});
  const [showMilestoneBuilder, setShowMilestoneBuilder] = useState(false);
  const [builderMilestones, setBuilderMilestones] = useState<EngineerMilestone[]>([]);

  const [showBoqModal, setShowBoqModal] = useState(false);
  const [boqProjectId, setBoqProjectId] = useState<string>('');
  const [boqMilestoneId, setBoqMilestoneId] = useState<string>('');
  const [boqByProject, setBoqByProject] = useState<Record<string, Record<string, BoqItem[]>>>({});

  const [boqCategory, setBoqCategory] = useState<BoqCategory>('Concrete');
  const [boqMaterial, setBoqMaterial] = useState('');
  const [boqQty, setBoqQty] = useState('');
  const [boqUnit, setBoqUnit] = useState<BoqUnit>('bags');
  const [boqUnitPrice, setBoqUnitPrice] = useState('');

  const [dailyUpdatesByProject, setDailyUpdatesByProject] = useState<
    Record<string, DailyProgressUpdate[]>
  >({});
  const [showDailyProgressModal, setShowDailyProgressModal] = useState(false);
  const [dailyProgressTab, setDailyProgressTab] = useState<'draft' | 'history'>(
    'draft'
  );
  const [draftDailyDescription, setDraftDailyDescription] = useState('');
  const [draftDailyMedia, setDraftDailyMedia] = useState<DailyProgressMedia[]>(
    []
  );

  // Messages states
  const [chatText, setChatText] = useState('');
  const [messagesList, setMessagesList] = useState([
    { id: '1', sender: 'Grace (Client)', text: 'Hello Eric! Did you coordinate the steel reinforcement inspection with Aline?', time: '10:10 AM' },
    { id: '2', sender: 'You', text: 'Yes Grace, Aline verified the site bounds and inspected the foundation reinforcement rebar spacing this morning.', time: '10:15 AM' },
    { id: '3', sender: 'Aline (Supervisor)', text: 'Correct. Checklists match professional guidelines. I have submitted the certificate into the ledger.', time: '11:05 AM' },
    { id: '4', sender: 'You', text: 'Thank you Aline! Grace, the foundation milestone payout can now be safely approved.', time: '11:15 AM' },
  ]);

  // BoQ database
  const [boqItems, setBoqItems] = useState([
    { id: '1', item: 'T12 High-Yield Steel Rebars', qty: '4.5 Tons', rate: '1,200,000 RWF', total: '5,400,000 RWF', status: 'PURCHASED' },
    { id: '2', item: 'Cem-V Kigali Cement Bags (42.5N)', qty: '650 Bags', rate: '14,500 RWF', total: '9,425,000 RWF', status: 'PURCHASED' },
    { id: '3', item: 'River Sand Premium Grade', qty: '120 Cubics', rate: '25,000 RWF', total: '3,000,000 RWF', status: 'DELIVERED' },
    { id: '4', item: 'Volcanic Gravel (20mm aggregate)', qty: '80 Cubics', rate: '35,000 RWF', total: '2,800,000 RWF', status: 'DELIVERED' },
    { id: '5', item: 'Pre-Painted G28 Roofing Sheets', qty: '150 Sheets', rate: '18,500 RWF', total: '2,775,000 RWF', status: 'RFQ_PENDING' },
  ]);

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
  };

  const handleRequestMilestoneInspection = (index: number, name: string) => {
    Alert.alert(
      'Request Milestone Approval',
      `Submit a structural certification request to supervisor for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: () => {
            const updated = [...milestones];
            updated[index].status = 'PENDING';
            setMilestones(updated);
            Alert.alert('Request Sent', 'Site inspection request issued to Supervisor Aline Mukamana.');
          } 
        }
      ]
    );
  };

  const currentEngineerMilestones: EngineerMilestone[] =
    (selectedProject && milestonesByProject[selectedProject.id]) || [];

  const openMilestoneBuilder = () => {
    if (!selectedProject) return;
    const existing = milestonesByProject[selectedProject.id];
    if (existing && existing.length) {
      setBuilderMilestones(existing);
    } else {
      setBuilderMilestones([
        {
          id: `ms-${Date.now()}-1`,
          name: '',
          pct: 0,
          durationDays: 0,
          acceptanceCriteria: '',
          status: 'PENDING',
        },
      ]);
    }
    setShowMilestoneBuilder(true);
  };

  const updateBuilderMilestone = (id: string, patch: Partial<EngineerMilestone>) => {
    setBuilderMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addBuilderMilestoneRow = () => {
    setBuilderMilestones((prev) => [
      ...prev,
      {
        id: `ms-${Date.now()}-${prev.length + 1}`,
        name: '',
        pct: 0,
        durationDays: 0,
        acceptanceCriteria: '',
        status: 'PENDING',
      },
    ]);
  };

  const totalBuilderPct = builderMilestones.reduce((sum, m) => sum + (Number(m.pct) || 0), 0);

  const saveMilestones = () => {
    if (!selectedProject) return;
    if (builderMilestones.some((m) => !m.name.trim())) {
      Alert.alert('Missing name', 'Please provide a name for every milestone.');
      return;
    }
    if (totalBuilderPct !== 100) {
      Alert.alert('Invalid percentage', 'Total milestone percentage must equal 100%.');
      return;
    }

    setMilestonesByProject((prev) => ({
      ...prev,
      [selectedProject.id]: builderMilestones,
    }));

    // Keep legacy milestones list for the rest of the screen logic.
    const legacy = builderMilestones.map((m) => ({
      name: m.name,
      pct: m.pct,
      status: m.status,
    }));
    setMilestones(legacy);

    setShowMilestoneBuilder(false);
    Alert.alert('Saved', 'Milestones saved and linked to this project.');
  };

  const openBoqForProject = () => {
    if (!selectedProject) return;
    const ms = milestonesByProject[selectedProject.id];
    if (!ms || ms.length === 0) {
      Alert.alert('No milestones', 'Create milestones first before adding BoQ items.');
      return;
    }
    setBoqProjectId(selectedProject.id);
    setBoqMilestoneId(ms[0].id);
    setShowBoqModal(true);
  };

  const resetBoqForm = () => {
    setBoqCategory('Concrete');
    setBoqMaterial('');
    setBoqQty('');
    setBoqUnit('bags');
    setBoqUnitPrice('');
  };

  const getSuggestedAvgPrice = (category: BoqCategory) => {
    const avg: Record<BoqCategory, number> = {
      Concrete: 14500,
      Steel: 1200000,
      Timber: 35000,
      Finishes: 25000,
      Labor: 200000,
      Equipment: 300000,
    };
    return avg[category];
  };

  const saveBoqItem = () => {
    if (!boqProjectId || !boqMilestoneId) return;
    const qty = Number(boqQty);
    const price = Number(boqUnitPrice);
    if (!boqMaterial.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) {
      Alert.alert('Invalid BoQ item', 'Please fill material, quantity, and unit price.');
      return;
    }

    const item: BoqItem = {
      id: `boq-${Date.now()}`,
      category: boqCategory,
      materialName: boqMaterial.trim(),
      quantity: qty,
      unit: boqUnit,
      unitPrice: price,
    };

    setBoqByProject((prev) => {
      const projectBoq = prev[boqProjectId] || {};
      const list = projectBoq[boqMilestoneId] || [];
      return {
        ...prev,
        [boqProjectId]: {
          ...projectBoq,
          [boqMilestoneId]: [item, ...list],
        },
      };
    });

    resetBoqForm();
    Alert.alert('Saved', 'BoQ item saved.');
  };

  const openDailyProgress = () => {
    if (!selectedProject) return;
    setDailyProgressTab('draft');
    setDraftDailyDescription('');
    setDraftDailyMedia([]);
    setShowDailyProgressModal(true);
  };

  const uploadDailyProgressMedia = async (kind: 'photo' | 'video') => {
    if (!selectedProject) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: kind === 'photo' ? ['images'] : ['videos'],
      quality: 0.8,
      videoMaxDuration: 120,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const type: 'image' | 'video' =
      asset.type === 'video' ? 'video' : 'image';

    setDraftDailyMedia((prev) => {
      const photosCount = prev.filter((m) => m.type === 'image').length;
      const hasVideo = prev.some((m) => m.type === 'video');

      if (type === 'image' && photosCount >= 10) {
        Alert.alert('Limit reached', 'You can upload up to 10 photos per update.');
        return prev;
      }
      if (type === 'video' && hasVideo) {
        Alert.alert('Limit reached', 'Only one video is allowed per daily update.');
        return prev;
      }

      return [
        {
          id: `dp-media-${Date.now()}`,
          uri: asset.uri,
          type,
        },
        ...prev,
      ];
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const saveDailyUpdate = () => {
    if (!selectedProject) return;

    const photosCount = draftDailyMedia.filter((m) => m.type === 'image').length;
    if (photosCount < 5) {
      Alert.alert('More photos needed', 'Please capture at least 5 photos.');
      return;
    }
    if (!draftDailyDescription.trim()) {
      Alert.alert('Description required', 'Please describe what was done today.');
      return;
    }

    const update: DailyProgressUpdate = {
      id: `dp-update-${Date.now()}`,
      description: draftDailyDescription.trim(),
      media: draftDailyMedia,
      createdAt: new Date().toISOString(),
    };

    setDailyUpdatesByProject((prev) => {
      const list = prev[selectedProject.id] || [];
      return { ...prev, [selectedProject.id]: [update, ...list] };
    });

    setDraftDailyDescription('');
    setDraftDailyMedia([]);
    setDailyProgressTab('history');
    Alert.alert('Saved', 'Daily update saved successfully.');
  };

  const handleOpenInvitationDetails = (invitation: ProjectInvitation) => {
    setSelectedInvitation(invitation);
  };

  const handleAcceptInvitation = () => {
    if (!selectedInvitation) return;

    const acceptedProject: ManagedProject = {
      id: `prj-inv-${Date.now()}`,
      name: selectedInvitation.name,
      client: selectedInvitation.clientName,
      engineer: engineerName,
      supervisor: 'Unassigned',
      location: selectedInvitation.location,
      budget: selectedInvitation.budget,
      escrowBalance: selectedInvitation.budget * 0.5,
      progress: 3,
      status: 'IN_PROGRESS',
      milestones: [
        { name: 'Foundation', pct: 25, status: 'PENDING' },
        { name: 'Structural Frame', pct: 35, status: 'PENDING' },
        { name: 'Finishing', pct: 40, status: 'PENDING' },
      ],
      engineerId,
      clientContact: selectedInvitation.clientContact,
      startDate: selectedInvitation.startDate,
      dueDate: selectedInvitation.dueDate,
      description: selectedInvitation.description,
      documents: ['Project plan'],
    };

    setAcceptedProjects((prev) => [acceptedProject, ...prev]);
    setPendingInvitations((prev) =>
      prev.filter((i) => i.id !== selectedInvitation.id)
    );
    setSelectedProject(acceptedProject);
    setMilestones(acceptedProject.milestones);
    setSelectedInvitation(null);

    Alert.alert(
      'Invitation Accepted',
      `${acceptedProject.name} assigned to your dashboard successfully.`
    );
  };

  return (
    <DashboardShell
      user={user}
      roleLabel="Engineer Desk"
      isDark={isDark}
      colors={colors}
      tabs={ENGINEER_TABS}
      activeTab={currentTab}
      onTabChange={(k) => setCurrentTab(k as typeof currentTab)}
      onLogout={handleLogout}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        
        {/* ================= TAB: DASHBOARD ================= */}
        {currentTab === 'dashboard' && (
          <View className="space-y-4">
            {/* Quick Metrics */}
            <View className="flex-row gap-3">
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>
                  Pending Invitations
                </Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>
                  {pendingInvitations.length}
                </Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>
                  Active Projects
                </Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>
                  {activeProjects.length}
                </Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>
                  Completed
                </Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>
                  {completedProjects.length}
                </Text>
              </View>
            </View>

            {/* Pending Invitations */}
            <View className="space-y-3">
              <Text className="text-[#007E6E] text-base font-bold">
                Pending Invitations
              </Text>
              {pendingInvitations.length === 0 ? (
                <View className={`p-4 rounded-2xl border ${colors.card}`}>
                  <Text className={`${colors.textMuted} text-xs`}>
                    No pending invitations at the moment.
                  </Text>
                </View>
              ) : (
                pendingInvitations.map((invitation) => (
                  <View
                    key={invitation.id}
                    className={`p-4 rounded-2xl border ${colors.card}`}
                  >
                    <Text className={`${colors.text} text-sm font-bold`}>
                      {invitation.name}
                    </Text>
                    <Text className={`${colors.textMuted} text-xs mt-1`}>
                      Client: {invitation.clientName}
                    </Text>
                    <Text className={`${colors.textMuted} text-xs`}>
                      Budget: {invitation.budget.toLocaleString()} RWF
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleOpenInvitationDetails(invitation)}
                      className="mt-3 bg-[#007E6E] py-2.5 rounded-xl items-center"
                    >
                      <Text className="text-white text-xs font-bold">
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Active Projects */}
            <View className="space-y-3">
              <Text className="text-[#007E6E] text-base font-bold">
                Active Projects
              </Text>
              {activeProjects.length === 0 ? (
                <View className={`p-4 rounded-2xl border ${colors.card}`}>
                  <Text className={`${colors.textMuted} text-xs`}>
                    You do not have active projects yet.
                  </Text>
                </View>
              ) : (
                activeProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    className={`p-4 rounded-2xl border ${colors.card}`}
                    onPress={() => {
                      setSelectedProject(project);
                      setMilestones(project.milestones);
                      setCurrentTab('projects');
                      setProjectView('overview');
                    }}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-2">
                        <Text className={`${colors.text} text-sm font-bold`}>
                          {project.name}
                        </Text>
                        <Text className={`${colors.textMuted} text-xs mt-1`}>
                          📍 {project.location}
                        </Text>
                      </View>
                      <Text className="text-[#007E6E] text-xs font-bold">
                        {project.progress}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Completed Projects */}
            <View className="space-y-3">
              <Text className="text-[#007E6E] text-base font-bold">
                Completed Projects
              </Text>
              {completedProjects.length === 0 ? (
                <View className={`p-4 rounded-2xl border ${colors.card}`}>
                  <Text className={`${colors.textMuted} text-xs`}>
                    Completed projects history will appear here.
                  </Text>
                </View>
              ) : (
                completedProjects.map((project) => (
                  <View key={project.id} className={`p-4 rounded-2xl border ${colors.card}`}>
                    <Text className={`${colors.text} text-sm font-bold`}>
                      {project.name}
                    </Text>
                    <Text className={`${colors.textMuted} text-xs mt-1`}>
                      ✅ Completed
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ================= TAB: PROJECTS / MILESTONES ================= */}
        {currentTab === 'projects' && (
          <View className="space-y-4">
            {projectView === 'list' ? (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#007E6E] text-lg font-bold">
                    LIST OF PROJECTS
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setProjectStatusTab('active')}
                    className={`px-4 py-2 rounded-full border ${
                      projectStatusTab === 'active'
                        ? 'bg-[#007E6E] border-[#007E6E]'
                        : isDark
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        projectStatusTab === 'active'
                          ? 'text-white'
                          : isDark
                            ? 'text-slate-200'
                            : 'text-slate-700'
                      }`}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setProjectStatusTab('completed')}
                    className={`px-4 py-2 rounded-full border ${
                      projectStatusTab === 'completed'
                        ? 'bg-[#007E6E] border-[#007E6E]'
                        : isDark
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        projectStatusTab === 'completed'
                          ? 'text-white'
                          : isDark
                            ? 'text-slate-200'
                            : 'text-slate-700'
                      }`}
                    >
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
                {projectsForTab.length === 0 ? (
                  <View className={`p-4 rounded-2xl border ${colors.card}`}>
                    <Text className={`${colors.textMuted} text-xs`}>
                      No projects in this status.
                    </Text>
                  </View>
                ) : null}
                {projectsForTab.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    className={`p-4 rounded-2xl border ${colors.card}`}
                    onPress={() => {
                      setSelectedProject(project);
                      setMilestones(project.milestones);
                      setProjectView('overview');
                    }}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-3">
                        <Text className={`${colors.text} text-base font-bold mb-1`}>
                          {project.name}
                        </Text>
                        <Text className={`${colors.textSecondary} text-xs`}>
                          📍 <Text className="text-[#007E6E] font-semibold">Location</Text> : {project.location}
                        </Text>
                        <Text className={`${colors.textSecondary} text-xs mt-1`}>
                          💰 <Text className="text-[#007E6E] font-semibold">Budget</Text> : {project.budget.toLocaleString()} Frw
                        </Text>
                      </View>
                      <View className={`w-14 h-14 rounded-full border-[6px] ${projectStatusTab === 'completed' ? 'border-slate-300' : 'border-amber-600'} items-center justify-center`}>
                        <Text className={`${colors.text} text-sm font-bold`}>
                          {project.progress}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity onPress={() => setProjectView('list')}>
                    <Text className="text-[#007E6E] text-xl font-bold">‹</Text>
                  </TouchableOpacity>
                  <Text className="text-[#007E6E] text-lg font-bold">
                    PROJECT OVERVIEW
                  </Text>
                  <View className="w-5" />
                </View>

                {selectedProject ? (
                  <View className={`p-4 rounded-2xl border ${colors.card}`}>
                    <Text className={`${colors.text} text-sm mb-4`}>
                      {selectedProject.description}
                    </Text>

                    <View className="flex-row justify-between items-center mb-3">
                      <Text className={`${colors.text} text-xl font-bold`}>
                        {selectedProject.name}
                      </Text>
                      <TouchableOpacity className="bg-[#007E6E] px-3 py-2 rounded-lg">
                        <Text className="text-white text-xs font-bold">Fund project</Text>
                      </TouchableOpacity>
                    </View>

                    <Text className={`${colors.textSecondary} text-xs mb-1`}>
                      📍 <Text className="text-[#007E6E] font-semibold">Location</Text> : {selectedProject.location}
                    </Text>
                    <Text className={`${colors.textSecondary} text-xs mb-1`}>
                      📅 <Text className="text-[#007E6E] font-semibold">Start Date</Text> : {selectedProject.startDate}
                    </Text>
                    <Text className={`${colors.textSecondary} text-xs mb-1`}>
                      📅 <Text className="text-[#007E6E] font-semibold">Due Date</Text> : {selectedProject.dueDate}
                    </Text>
                    <Text className={`${colors.textSecondary} text-xs mb-1`}>
                      💰 <Text className="text-[#007E6E] font-semibold">Budget</Text> : {selectedProject.budget.toLocaleString()} Frw
                    </Text>
                    <Text className={`${colors.textSecondary} text-xs mb-3`}>
                      📄 <Text className="text-[#007E6E] font-semibold">Documents</Text> : {selectedProject.documents.join(', ')}
                    </Text>

                    <View className="mb-2">
                      <Text className={`${colors.text} text-sm font-bold mb-2`}>
                        Overall Progress
                      </Text>
                      <View className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-amber-600"
                          style={{ width: `${selectedProject.progress}%` }}
                        />
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row flex-wrap gap-2 mt-4">
                      <TouchableOpacity
                        onPress={openDailyProgress}
                        className="bg-[#007E6E] px-3 py-2 rounded-lg"
                      >
                        <Text className="text-white text-xs font-bold">
                          Upload Daily Progress
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={openMilestoneBuilder}
                        className="bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-lg"
                      >
                        <Text className="text-emerald-600 text-xs font-bold">
                          Create Milestone Structure
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={openBoqForProject}
                        className="bg-sldate-100 dark:bg-sldate-800 border border-emerald-200 dark:border-slate-700 px-3 py-2 rounded-lg"
                      >
                        <Text className={`${colors.textSecondary} text-xs font-bold text-emerald-200`}>
                          Add BoQ Item
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* BoQ Viewer */}
                    {selectedProject ? (
                      <View className="mt-5">
                        <Text className="text-[#007E6E] text-sm font-bold mb-2">
                          BoQ (by milestone)
                        </Text>
                        {(milestonesByProject[selectedProject.id] || []).length === 0 ? (
                          <View className={`p-4 rounded-2xl border ${colors.card}`}>
                            <Text className={`${colors.textMuted} text-xs`}>
                              No milestones available. Create milestones to organize BoQ.
                            </Text>
                          </View>
                        ) : (
                          <>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                              <View className="flex-row gap-2">
                                {(milestonesByProject[selectedProject.id] || []).map((m) => (
                                  <TouchableOpacity
                                    key={`boq-view-${m.id}`}
                                    onPress={() => setBoqMilestoneId(m.id)}
                                    className={`px-3 py-2 rounded-full border ${
                                      boqMilestoneId === m.id
                                        ? 'bg-[#007E6E] border-[#007E6E]'
                                        : isDark
                                          ? 'bg-slate-900 border-slate-700'
                                          : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <Text className={`text-[10px] font-bold ${
                                      boqMilestoneId === m.id ? 'text-white' : colors.textMuted
                                    }`}>
                                      {m.name || 'Milestone'}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </ScrollView>

                            {(() => {
                              const items =
                                (boqByProject[selectedProject.id] || {})[boqMilestoneId] || [];
                              if (!items.length) {
                                return (
                                  <View className={`p-4 rounded-2xl border ${colors.card}`}>
                                    <Text className={`${colors.textMuted} text-xs`}>
                                      No BoQ items for this milestone yet.
                                    </Text>
                                  </View>
                                );
                              }
                              return (
                                <View className="space-y-2">
                                  {items.map((it) => (
                                    <View key={it.id} className={`p-4 rounded-2xl border ${colors.card}`}>
                                      <View className="flex-row justify-between items-start">
                                        <View className="flex-1 pr-2">
                                          <Text className={`${colors.text} text-xs font-bold`}>
                                            {it.materialName}
                                          </Text>
                                          <Text className={`${colors.textMuted} text-[10px] mt-1`}>
                                            {it.category} • {it.quantity} {it.unit.replace('_', ' ')} × {it.unitPrice.toLocaleString()} RWF
                                          </Text>
                                        </View>
                                        <Text className="text-[#007E6E] text-xs font-extrabold">
                                          {(it.quantity * it.unitPrice).toLocaleString()} RWF
                                        </Text>
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              );
                            })()}
                          </>
                        )}
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <Text className="text-[#007E6E] text-lg font-bold mt-2">
                  Project milestone
                </Text>
                {selectedProject && currentEngineerMilestones.length === 0 ? (
                  <View className={`p-4 rounded-2xl border ${colors.card}`}>
                    <Text className={`${colors.textMuted} text-xs font-bold`}>
                      No Milestones Created
                    </Text>
                    <Text className={`${colors.textMuted} text-[11px] mt-1`}>
                      Tap "Create Milestone Structure" to build the project milestones.
                    </Text>
                  </View>
                ) : null}
                {milestones.map((m, idx) => (
                  <View key={idx} className={`p-4 rounded-2xl border ${colors.card}`}>
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className={`${colors.text} text-base font-bold`}>
                        {m.name}
                      </Text>
                      <View className={`px-2 py-0.5 rounded-full ${m.status === 'PAID' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        <Text className={`text-xs font-bold ${m.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {m.status === 'PAID' ? 'Completed' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                    <Text className={`${colors.textSecondary} text-xs mb-1`}>
                      Complete foundation and ground works
                    </Text>
                    <Text className={`${colors.textSecondary} text-xs mb-1`}>
                      <Text className="text-[#007E6E] font-semibold">Timeline</Text> : {selectedProject?.startDate} to {selectedProject?.dueDate}
                    </Text>
                    <Text className={`${colors.textSecondary} text-xs`}>
                      <Text className="text-[#007E6E] font-semibold">Budget</Text> : {((selectedProject?.budget || 0) * m.pct / 100).toLocaleString()} Frw
                    </Text>
                    {m.status === 'PENDING' ? (
                      <TouchableOpacity
                        onPress={() => handleRequestMilestoneInspection(idx, m.name)}
                        className="mt-3 bg-emerald-500/10 border border-emerald-500/25 py-2 rounded-lg items-center"
                      >
                        <Text className="text-emerald-500 text-xs font-bold">Request Inspection Cert</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* ================= TAB: RFQs ================= */}
        {currentTab === 'rfqs' && (
          <View className="space-y-4">
            <Text className={`${colors.text} text-lg font-bold mb-1`}>Bill of Quantities / RFQs</Text>
            <View className={`p-4 rounded-2xl border ${colors.card} space-y-3`}>
              {boqItems.map(item => (
                <View
                  key={item.id}
                  className="pb-3 border-b border-slate-150 dark:border-slate-700/60 last:border-b-0 space-y-1.5"
                >
                  <View className="flex-row justify-between items-start">
                    <Text className={`${colors.text} font-bold text-xs flex-1 pr-2`}>{item.item}</Text>
                    <View className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                      <Text className={`${colors.textMuted} text-[9px] font-bold`}>{item.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between text-[11px]">
                    <Text className={colors.textMuted}>Qty: {item.qty} | Rate: {item.rate}</Text>
                    <Text className={`${colors.text} font-semibold`}>Total: {item.total}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB: EARNINGS ================= */}
        {currentTab === 'earnings' && (
          <View className="space-y-4">
            <Text className={`${colors.text} text-lg font-bold mb-2`}>Earnings & Payments</Text>
            <View className="flex-row gap-3">
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Total Earned</Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>14,825,000</Text>
                <Text className={`${colors.textMuted} text-[9px] mt-0.5`}>RWF</Text>
              </View>
              <View className={`flex-1 p-4 rounded-2xl border ${colors.card}`}>
                <Text className={`${colors.textMuted} text-[9px] font-bold uppercase`}>Pending</Text>
                <Text className={`${colors.text} text-xl font-black mt-1`}>6,150,000</Text>
                <Text className={`${colors.textMuted} text-[9px] mt-0.5`}>RWF</Text>
              </View>
            </View>
            {[
              { label: 'Foundation & Excavation', project: 'Kicukiro Family Home', amount: '8,200,000 RWF', status: 'PAID', date: '2026-05-10' },
              { label: 'Framing & Masonry', project: 'Kicukiro Family Home', amount: '6,625,000 RWF', status: 'PAID', date: '2026-05-18' },
              { label: 'Roofing & Ceiling', project: 'Musanze Rental Units', amount: '6,150,000 RWF', status: 'PENDING', date: 'Awaiting approval' },
            ].map((e, i) => (
              <View key={i} className={`p-4 rounded-2xl border ${colors.card}`}>
                <View className="flex-row justify-between items-start mb-1">
                  <View className="flex-1 pr-2">
                    <Text className={`${colors.text} font-bold text-xs`}>{e.label}</Text>
                    <Text className={`${colors.textMuted} text-[10px] mt-0.5`}>{e.project}</Text>
                  </View>
                  <View style={{ backgroundColor: e.status === 'PAID' ? '#10b98120' : '#f59e0b20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: e.status === 'PAID' ? '#10b981' : '#f59e0b', fontSize: 9, fontWeight: '700' }}>{e.status}</Text>
                  </View>
                </View>
                <Text className={`${colors.text} font-bold text-sm mt-1`}>{e.amount}</Text>
                <Text className={`${colors.textMuted} text-[10px] mt-0.5`}>{e.date}</Text>
              </View>
            ))}
          </View>
        )}
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
                  placeholder="Type message to client / supervisor..."
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
                IER License: #IER-RW-8821
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

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl items-center"
            >
              <Text className="text-red-500 font-bold text-sm">Logout</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* </ScrollView> */}

      <Modal
        visible={!!selectedInvitation}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvitation(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[#007E6E] text-base font-bold">
                Invitation Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedInvitation(null)}>
                <Text className={`${colors.text} text-lg font-bold`}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedInvitation ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                <Text className={`${colors.text} text-lg font-bold`}>
                  {selectedInvitation.name}
                </Text>
                <Text className={`${colors.textSecondary} text-xs mt-1`}>
                  Client: {selectedInvitation.clientName}
                </Text>
                <Text className={`${colors.textSecondary} text-xs`}>
                  Contact: {selectedInvitation.clientContact}
                </Text>
                <Text className={`${colors.textSecondary} text-xs`}>
                  Budget: {selectedInvitation.budget.toLocaleString()} RWF
                </Text>
                <Text className={`${colors.textSecondary} text-xs mb-3`}>
                  Location: {selectedInvitation.location}
                </Text>

                <Image
                  source={{ uri: selectedInvitation.locationMapPreview }}
                  className="w-full h-36 rounded-xl mb-3"
                />
                <Text className={`${colors.textMuted} text-[11px] mb-2`}>
                  Map preview
                </Text>

                <Text className={`${colors.text} text-sm font-bold mb-2`}>
                  Site photos
                </Text>
                <View className="flex-row gap-2 mb-3">
                  {selectedInvitation.sitePhotos.map((photo, idx) => (
                    <Image
                      key={`${selectedInvitation.id}-photo-${idx}`}
                      source={{ uri: photo }}
                      className="w-[48%] h-24 rounded-lg"
                    />
                  ))}
                </View>

                <Text className={`${colors.textSecondary} text-xs mb-4`}>
                  {selectedInvitation.description}
                </Text>

                <TouchableOpacity
                  onPress={handleAcceptInvitation}
                  className="bg-[#007E6E] py-3 rounded-xl items-center"
                >
                  <Text className="text-white text-sm font-bold">
                    Accept Invitation
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Milestone Builder Modal */}
      <Modal
        visible={showMilestoneBuilder}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMilestoneBuilder(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#007E6E] text-base font-bold">
                Milestone Builder
              </Text>
              <TouchableOpacity onPress={() => setShowMilestoneBuilder(false)}>
                <Text className={`${colors.text} text-lg font-bold`}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text className={`${colors.textMuted} text-[11px] mb-3`}>
              Total percentage must equal 100%. Current: {totalBuilderPct}%
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
              {builderMilestones.map((m, index) => (
                <View key={m.id} className={`p-4 rounded-2xl border mb-3 ${colors.card}`}>
                  <Text className={`${colors.text} text-sm font-bold mb-2`}>
                    Milestone {index + 1}
                  </Text>

                  <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Name</Text>
                  <TextInput
                    value={m.name}
                    onChangeText={(v) => updateBuilderMilestone(m.id, { name: v })}
                    placeholder="e.g. Foundation"
                    placeholderTextColor="#94a3b8"
                    className={`rounded-xl px-4 py-3 text-xs ${colors.inputBg} ${colors.text}`}
                  />

                  <View className="flex-row gap-2 mt-3">
                    <View className="flex-1">
                      <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Budget %</Text>
                      <TextInput
                        value={String(m.pct || '')}
                        onChangeText={(v) =>
                          updateBuilderMilestone(m.id, { pct: Number(v.replace(/[^0-9]/g, '')) || 0 })
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#94a3b8"
                        className={`rounded-xl px-4 py-3 text-xs ${colors.inputBg} ${colors.text}`}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Duration (days)</Text>
                      <TextInput
                        value={String(m.durationDays || '')}
                        onChangeText={(v) =>
                          updateBuilderMilestone(m.id, {
                            durationDays: Number(v.replace(/[^0-9]/g, '')) || 0,
                          })
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#94a3b8"
                        className={`rounded-xl px-4 py-3 text-xs ${colors.inputBg} ${colors.text}`}
                      />
                    </View>
                  </View>

                  <Text className={`${colors.textMuted} text-[10px] font-bold mb-1 mt-3`}>Acceptance criteria</Text>
                  <TextInput
                    value={m.acceptanceCriteria}
                    onChangeText={(v) => updateBuilderMilestone(m.id, { acceptanceCriteria: v })}
                    placeholder="Describe acceptance criteria"
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                    className={`rounded-xl px-4 py-3 text-xs min-h-20 ${colors.inputBg} ${colors.text}`}
                  />
                </View>
              ))}

              <TouchableOpacity
                onPress={addBuilderMilestoneRow}
                className="border border-[#007E6E] py-3 rounded-xl items-center"
              >
                <Text className="text-[#007E6E] text-xs font-bold">+ Add Milestone</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              onPress={saveMilestones}
              className={`mt-3 py-3 rounded-xl items-center ${totalBuilderPct === 100 ? 'bg-[#007E6E]' : 'bg-slate-300'}`}
              disabled={totalBuilderPct !== 100}
            >
              <Text className={`${totalBuilderPct === 100 ? 'text-white' : 'text-slate-600'} text-sm font-bold`}>
                Save Milestones
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BoQ Item Modal */}
      <Modal
        visible={showBoqModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBoqModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#007E6E] text-base font-bold">Add BoQ Item</Text>
              <TouchableOpacity onPress={() => setShowBoqModal(false)}>
                <Text className={`${colors.text} text-lg font-bold`}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedProject ? (
              <>
                <Text className={`${colors.textMuted} text-[11px] mb-3`}>
                  Select milestone and add BoQ items. Total auto-calculates.
                </Text>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                  {/* Milestone selector (simple tabs) */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <View className="flex-row gap-2">
                      {(milestonesByProject[selectedProject.id] || []).map((m) => (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => setBoqMilestoneId(m.id)}
                          className={`px-3 py-2 rounded-full border ${
                            boqMilestoneId === m.id
                              ? 'bg-[#007E6E] border-[#007E6E]'
                              : isDark
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-white border-slate-200'
                          }`}
                        >
                          <Text className={`text-[10px] font-bold ${boqMilestoneId === m.id ? 'text-white' : colors.textMuted}`}>
                            {m.name || 'Milestone'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <View className="flex-row gap-2">
                      {(['Concrete','Steel','Timber','Finishes','Labor','Equipment'] as BoqCategory[]).map((c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setBoqCategory(c)}
                          className={`px-3 py-2 rounded-full border ${
                            boqCategory === c ? 'bg-[#007E6E] border-[#007E6E]' : (isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')
                          }`}
                        >
                          <Text className={`text-[10px] font-bold ${boqCategory === c ? 'text-white' : colors.textMuted}`}>
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Material name</Text>
                  <TextInput
                    value={boqMaterial}
                    onChangeText={setBoqMaterial}
                    placeholder="e.g. Cement 42.5N"
                    placeholderTextColor="#94a3b8"
                    className={`rounded-xl px-4 py-3 text-xs mb-3 ${colors.inputBg} ${colors.text}`}
                  />

                  <View className="flex-row gap-2 mb-3">
                    <View className="flex-1">
                      <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Quantity</Text>
                      <TextInput
                        value={boqQty}
                        onChangeText={setBoqQty}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#94a3b8"
                        className={`rounded-xl px-4 py-3 text-xs ${colors.inputBg} ${colors.text}`}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Unit</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                          {(['bags','cubic_meters','pieces','lumpsum','meters','tons'] as BoqUnit[]).map((u) => (
                            <TouchableOpacity
                              key={u}
                              onPress={() => setBoqUnit(u)}
                              className={`px-3 py-2 rounded-full border ${
                                boqUnit === u ? 'bg-[#007E6E] border-[#007E6E]' : (isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')
                              }`}
                            >
                              <Text className={`text-[10px] font-bold ${boqUnit === u ? 'text-white' : colors.textMuted}`}>
                                {u.replace('_', ' ')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </View>

                  <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Unit price (RWF)</Text>
                  <View className="flex-row gap-2 items-center mb-2">
                    <TextInput
                      value={boqUnitPrice}
                      onChangeText={setBoqUnitPrice}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      className={`flex-1 rounded-xl px-4 py-3 text-xs ${colors.inputBg} ${colors.text}`}
                    />
                    <TouchableOpacity
                      onPress={() => setBoqUnitPrice(String(getSuggestedAvgPrice(boqCategory)))}
                      className="bg-emerald-500/10 border border-emerald-500/25 px-3 py-3 rounded-xl"
                    >
                      <Text className="text-emerald-600 text-[10px] font-bold">
                        Use avg
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className={`p-3 rounded-xl border ${colors.card}`}>
                    <Text className={`${colors.textMuted} text-[10px] font-bold`}>
                      Total
                    </Text>
                    <Text className={`${colors.text} text-base font-extrabold`}>
                      {(() => {
                        const q = Number(boqQty);
                        const p = Number(boqUnitPrice);
                        return Number.isFinite(q) && Number.isFinite(p) ? (q * p).toLocaleString() : '0';
                      })()} RWF
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={saveBoqItem}
                  className="mt-3 bg-[#007E6E] py-3 rounded-xl items-center"
                >
                  <Text className="text-white text-sm font-bold">Save Item</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Daily Progress Modal */}
      <Modal
        visible={showDailyProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDailyProgressModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl p-5 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#007E6E] text-base font-bold">Daily Progress Upload</Text>
              <TouchableOpacity onPress={() => setShowDailyProgressModal(false)}>
                <Text className={`${colors.text} text-lg font-bold`}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedProject ? (
              <>
                <View className="flex-row gap-2 mb-3">
                  <TouchableOpacity
                    onPress={() => setDailyProgressTab('draft')}
                    className={`flex-1 py-2.5 rounded-xl border ${
                      dailyProgressTab === 'draft'
                        ? 'bg-[#007E6E] border-[#007E6E]'
                        : isDark
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`text-center text-xs font-bold ${
                      dailyProgressTab === 'draft' ? 'text-white' : colors.textMuted
                    }`}>
                      Draft
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDailyProgressTab('history')}
                    className={`flex-1 py-2.5 rounded-xl border ${
                      dailyProgressTab === 'history'
                        ? 'bg-[#007E6E] border-[#007E6E]'
                        : isDark
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`text-center text-xs font-bold ${
                      dailyProgressTab === 'history' ? 'text-white' : colors.textMuted
                    }`}>
                      History
                    </Text>
                  </TouchableOpacity>
                </View>

                {dailyProgressTab === 'draft' ? (
                  <>
                    <Text className={`${colors.textMuted} text-[11px] mb-3`}>
                      Capture 5–10 photos and optionally a 2-minute video. Add a short description, then save.
                    </Text>

                    <Text className={`${colors.textMuted} text-[10px] font-bold mb-1`}>Description</Text>
                    <TextInput
                      value={draftDailyDescription}
                      onChangeText={setDraftDailyDescription}
                      placeholder="Describe what was done today..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      textAlignVertical="top"
                      className={`rounded-xl px-4 py-3 text-xs min-h-20 mb-3 ${colors.inputBg} ${colors.text}`}
                    />

                    <View className="flex-row gap-2 mb-3">
                      <TouchableOpacity
                        onPress={() => uploadDailyProgressMedia('photo')}
                        className="flex-1 bg-[#007E6E] py-3 rounded-xl items-center"
                      >
                        <Text className="text-white text-xs font-bold">Add Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => uploadDailyProgressMedia('video')}
                        className="flex-1 bg-emerald-500/10 border border-emerald-500/25 py-3 rounded-xl items-center"
                      >
                        <Text className="text-emerald-600 text-xs font-bold">Add Video</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                      {draftDailyMedia.length === 0 ? (
                        <View className={`p-4 rounded-2xl border ${colors.card}`}>
                          <Text className={`${colors.textMuted} text-xs font-bold`}>
                            No media added yet
                          </Text>
                          <Text className={`${colors.textMuted} text-[11px] mt-1`}>
                            Add at least 5 photos before saving.
                          </Text>
                        </View>
                      ) : (
                        <>
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className={`${colors.textMuted} text-[11px] font-bold`}>
                              Photos: {draftDailyMedia.filter(m => m.type === 'image').length}/10
                            </Text>
                            <Text className={`${colors.textMuted} text-[11px] font-bold`}>
                              Video: {draftDailyMedia.some(m => m.type === 'video') ? '1/1' : '0/1'}
                            </Text>
                          </View>
                          <View className="flex-row flex-wrap gap-2">
                            {draftDailyMedia.map((m) => (
                              <View key={m.id} className="w-[48%]">
                                <Image source={{ uri: m.uri }} className="w-full h-24 rounded-xl" />
                                <Text className={`${colors.textMuted} text-[10px] mt-1`}>
                                  {m.type.toUpperCase()}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </>
                      )}
                    </ScrollView>

                    <TouchableOpacity
                      onPress={saveDailyUpdate}
                      className="mt-3 bg-[#007E6E] py-3 rounded-xl items-center"
                    >
                      <Text className="text-white text-sm font-bold">Save Update</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                    {(dailyUpdatesByProject[selectedProject.id] || []).length === 0 ? (
                      <View className={`p-4 rounded-2xl border ${colors.card}`}>
                        <Text className={`${colors.textMuted} text-xs font-bold`}>
                          No daily updates yet
                        </Text>
                        <Text className={`${colors.textMuted} text-[11px] mt-1`}>
                          Create your first daily update from the Draft tab.
                        </Text>
                      </View>
                    ) : (
                      <View className="space-y-3">
                        {(dailyUpdatesByProject[selectedProject.id] || []).map((u) => (
                          <View key={u.id} className={`p-4 rounded-2xl border ${colors.card}`}>
                            <Text className="text-[#007E6E] text-[11px] font-bold mb-2">
                              {formatDateTime(u.createdAt)}
                            </Text>
                            <Text className={`${colors.text} text-xs mb-3`}>
                              {u.description}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                              {u.media.slice(0, 4).map((m) => (
                                <Image
                                  key={m.id}
                                  source={{ uri: m.uri }}
                                  className="w-[48%] h-20 rounded-xl"
                                />
                              ))}
                            </View>
                            {u.media.length > 4 ? (
                              <Text className={`${colors.textMuted} text-[10px] mt-2`}>
                                +{u.media.length - 4} more
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                )}
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* iOS style custom bottom navigation */}
      {/* <View className="absolute bottom-4 left-0 right-0">
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
          label="BoQ"
          iconName="document-text-outline"
          activeIconName="document-text"
          isActive={currentTab === 'boq'}
          onPress={() => setCurrentTab('boq')}
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
      </View> */}
      </ScrollView>
    </DashboardShell>
  );
}
