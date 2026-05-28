/**
 * ============================================================================
 * FILE NAME        : ClientDashboard.tsx
 * WHAT THIS FILE DOES : Main container shell coordinating the sub-modules of the
 *                       Client Workspace. Manages local interactive project creation,
 *                       escrow deductions, file attachments, and KYC uploads.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useClientDashboard } from '../../hooks/useClientDashboard';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';

// Subcomponents & Tabs
import { getColors } from './client/utils/colors';
import ClientHeader from './client/components/ClientHeader';
import HomeTab from './client/tabs/HomeTab';
import ProjectsTab from './client/tabs/ProjectsTab';
import EngineersTab from './client/tabs/EngineersTab';
import WalletTab from './client/tabs/WalletTab';
import ChatTab from './client/tabs/ChatTab';

// Modals
import AddFundsModal from './client/modals/AddFundsModal';
import WalletGateModal from './client/modals/WalletGateModal';
import CreateProjectModal from './client/modals/CreateProjectModal';
import ProfileSettingsModal from './client/modals/ProfileSettingsModal';

import TabButton from '../../components/ui/TabButton';
import LottieAnimation from '../../components/ui/LottieAnimation';

export default function ClientDashboard() {
  const dashboard = useClientDashboard();
  const { notifications, unreadCount, markAllRead, addNotification } = useNotifications();
  const { messages, sendMessage } = useMessages();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'engineers' | 'wallet' | 'chat'>('dashboard');
  const [showProfileDrop, setShowProfileDrop] = useState(false);
  const [showNotifDrop, setShowNotifDrop] = useState(false);

  // --- Local Interactive States ---
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [selectedProjId, setSelectedProjId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(40_500_000);
  const [kycFiles, setKycFiles] = useState<string[]>([
    'National_ID_UWASE.pdf',
    'Business_Registration.pdf'
  ]);

  // Modals Visibility
  const [showFundModal, setShowFundModal] = useState(false);
  const [showCreateProjModal, setShowCreateProjModal] = useState(false);
  const [showProjectWarning, setShowProjectWarning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [fundAmount, setFundAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Temp holder for budget checking during project creation
  const [pendingProjectData, setPendingProjectData] = useState<{name: string, location: string, budget: number, engineerId: string} | null>(null);

  const isDark = dashboard.theme === 'dark';
  const colors = getColors(isDark);

  // Sync projects with initial mock data
  useEffect(() => {
    if (dashboard.clientProjects && dashboard.clientProjects.length > 0 && localProjects.length === 0) {
      const initial = dashboard.clientProjects.map((p: any) => ({
        ...p,
        documents: [
          { name: 'Architectural_Blueprint.pdf', uploadedAt: '2026-05-24', size: '4.2 MB' },
          { name: 'Building_Permit_Kigali.pdf', uploadedAt: '2026-05-25', size: '1.8 MB' }
        ]
      }));
      setLocalProjects(initial);
      setSelectedProjId(initial[0].id);
    }
  }, [dashboard.clientProjects]);

  // Derived: Current Selected Project
  const selectedProject = localProjects.find((p: any) => p.id === selectedProjId) || localProjects[0] || null;
  const projectMilestones = selectedProject ? selectedProject.milestones : [];

  // Compute live stats from local projects
  const stats = React.useMemo(() => {
    const allMilestones = localProjects.flatMap((p: any) => p.milestones || []);
    const paidCount = allMilestones.filter((m: any) => m.status === 'PAID').length;
    const pendingMilestones = allMilestones.filter((m: any) => m.status === 'PENDING').length;
    return {
      totalBudget: localProjects.reduce((s: number, p: any) => s + p.budget, 0),
      totalProjects: localProjects.length,
      pendingMilestones,
      completionRate: allMilestones.length > 0 ? Math.round((paidCount / allMilestones.length) * 100) : 0
    };
  }, [localProjects]);

  // --- ESCROW TRANSACTION FLOWS ---

  // Release Milestone Funds
  const handleReleaseMilestone = (index: number) => {
    if (!selectedProject) return;
    const milestone = selectedProject.milestones[index];
    const amount = selectedProject.budget * (milestone.pct / 100);

    setLocalProjects((prev: any[]) => prev.map((p: any) => {
      if (p.id !== selectedProject.id) return p;
      const nextMilestones = [...p.milestones];
      nextMilestones[index] = { ...nextMilestones[index], status: 'PAID' };
      const paidPct = nextMilestones.filter((m: any) => m.status === 'PAID').reduce((s: number, m: any) => s + m.pct, 0);
      return {
        ...p,
        progress: paidPct,
        milestones: nextMilestones
      };
    }));

    addNotification({
      type: 'payment',
      title: 'Milestone Disbursed ✓',
      body: `${amount.toLocaleString()} RWF released from project escrow.`,
      time: 'Just now',
      read: false,
    });

    Alert.alert('Success', 'Funds released securely from locked project budget.');
  };

  // Dispute Milestone
  const handleDisputeMilestone = (index: number) => {
    if (!selectedProject) return;
    setLocalProjects((prev: any[]) => prev.map((p: any) => {
      if (p.id !== selectedProject.id) return p;
      const nextMilestones = [...p.milestones];
      nextMilestones[index] = { ...nextMilestones[index], status: 'REVISION' };
      return {
        ...p,
        milestones: nextMilestones
      };
    }));

    addNotification({
      type: 'milestone',
      title: 'Dispute Logged ⚠️',
      body: `Revision requested for milestone: "${selectedProject.milestones[index].title}".`,
      time: 'Just now',
      read: false,
    });

    Alert.alert('Dispute Logged', 'Our supervisors will review this milestone shortly.');
  };

  // Create Project Flow with Budget Warning Check
  const handleCreateProject = (name: string, location: string, budget: number, engineerId: string) => {
    const engineer = dashboard.allEngineers.find((e: any) => e.id === engineerId);

    if (walletBalance < budget) {
      // Store details and launch deposit gate modal
      setPendingProjectData({ name, location, budget, engineerId });
      setShowCreateProjModal(false);
      setShowProjectWarning(true);
      return;
    }

    // Deduct and create project
    setWalletBalance((prev: number) => prev - budget);
    const newProj = {
      id: `proj-${Date.now().toString().slice(-4)}`,
      name,
      location,
      budget,
      client: dashboard.user?.name || 'Grace Uwase',
      supervisor: 'Aline Mukamana',
      progress: 0,
      status: 'ACTIVE',
      milestones: [
        { title: 'Foundation & Excavation', pct: 30, status: 'PENDING' },
        { title: 'Frame & Structural Slab', pct: 40, status: 'PENDING' },
        { title: 'Finishes, Plumbing & Handover', pct: 30, status: 'PENDING' }
      ],
      documents: [
        { name: 'Contract_Deed.pdf', uploadedAt: new Date().toISOString().split('T')[0], size: '1.4 MB' }
      ]
    };

    setLocalProjects((prev: any[]) => [newProj, ...prev]);
    setSelectedProjId(newProj.id);
    setShowCreateProjModal(false);

    addNotification({
      type: 'milestone',
      title: 'Contract Active 🏗️',
      body: `Locked ${budget.toLocaleString()} RWF into escrow with ${engineer?.name}.`,
      time: 'Just now',
      read: false,
    });

    Alert.alert('Success', 'Project created and full budget locked securely in escrow.');
  };

  // Add Funds via Flutterwave
  const handleFlutterwaveFund = () => {
    if (!fundAmount || parseInt(fundAmount) < 10000) {
      return Alert.alert('Error', 'Minimum 10,000 RWF required');
    }
    setIsProcessing(true);
    setTimeout(() => {
      const added = parseInt(fundAmount);
      setWalletBalance((prev: number) => prev + added);
      setIsProcessing(false);
      setShowFundModal(false);
      setFundAmount('');

      addNotification({
        type: 'payment',
        title: 'Escrow Funded',
        body: `${added.toLocaleString()} RWF credited via Flutterwave.`,
        time: 'Just now',
        read: false,
      });

      // If we had a pending project, resume creation check
      if (pendingProjectData) {
        const nextBalance = walletBalance + added;
        if (nextBalance >= pendingProjectData.budget) {
          Alert.alert('Escrow Funded', 'Funds loaded successfully. Proceeding with project deployment.', [
            {
              text: 'OK',
              onPress: () => {
                handleCreateProject(
                  pendingProjectData.name,
                  pendingProjectData.location,
                  pendingProjectData.budget,
                  pendingProjectData.engineerId
                );
                setPendingProjectData(null);
              }
            }
          ]);
        }
      } else {
        Alert.alert('Success', 'Funds added securely via Flutterwave gateway.');
      }
    }, 1500);
  };

  // Upload Project Document
  const handleUploadDocument = (projectId: string, docName: string) => {
    setLocalProjects((prev: any[]) => prev.map((p: any) => {
      if (p.id !== projectId) return p;
      const docs = p.documents || [];
      return {
        ...p,
        documents: [
          ...docs,
          { name: docName, uploadedAt: new Date().toISOString().split('T')[0], size: '2.4 MB' }
        ]
      };
    }));

    addNotification({
      type: 'milestone',
      title: 'File Uploaded 📄',
      body: `Document "${docName}" uploaded to project workspace.`,
      time: 'Just now',
      read: false,
    });
  };

  // Upload KYC document
  const handleUploadKYC = () => {
    Alert.prompt(
      'Upload KYC Document',
      'Enter document type / filename to attach (e.g. Business_License.pdf):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload',
          onPress: (val?: string) => {
            if (val && val.trim()) {
              setKycFiles((prev: string[]) => [...prev, val.trim()]);
              addNotification({
                type: 'payment',
                title: 'KYC Document Received',
                body: `File "${val.trim()}" uploaded to your dossier.`,
                time: 'Just now',
                read: false,
              });
              Alert.alert('KYC Uploaded', 'Document attached to your profile and sent to admin for verification.');
            }
          }
        }
      ],
      'plain-text',
      'Tax_Clearance_Certificate.pdf'
    );
  };

  if (dashboard.isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${colors.bg}`}>
        <LottieAnimation type="loading" size={150} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${colors.bg}`}>
      {/* Dynamic Client Header */}
      <ClientHeader
        user={dashboard.user}
        isDark={isDark}
        colors={colors}
        unreadCount={unreadCount}
        notifications={notifications}
        kycFiles={kycFiles}
        showProfileDrop={showProfileDrop}
        showNotifDrop={showNotifDrop}
        onToggleProfile={() => {
          setShowProfileDrop(!showProfileDrop);
          setShowNotifDrop(false);
        }}
        onToggleNotif={() => {
          setShowNotifDrop(!showNotifDrop);
          setShowProfileDrop(false);
        }}
        onToggleTheme={dashboard.toggleTheme}
        onLogout={dashboard.handleLogout}
        onMarkAllRead={markAllRead}
        onUploadKYC={handleUploadKYC}
        onCloseDropdowns={() => {
          setShowProfileDrop(false);
          setShowNotifDrop(false);
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Workspace Pages */}
      {currentTab === 'chat' ? (
        <View className="flex-1 px-5 pt-4" style={{ paddingBottom: 96 }}>
          <ChatTab
            messages={messages}
            colors={colors}
            onSendMessage={sendMessage}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {currentTab === 'dashboard' && (
            <HomeTab
              stats={stats}
              clientProjects={localProjects}
              colors={colors}
              onAddProject={() => setShowCreateProjModal(true)}
              onSelectProject={(proj) => {
                setSelectedProjId(proj.id);
              }}
              onChangeTab={setCurrentTab}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsTab
              clientProjects={localProjects}
              selectedProject={selectedProject}
              projectMilestones={projectMilestones}
              colors={colors}
              onSelectProject={(p) => setSelectedProjId(p.id)}
              onReleaseMilestone={handleReleaseMilestone}
              onDisputeMilestone={handleDisputeMilestone}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {currentTab === 'engineers' && (
            <EngineersTab
              allEngineers={dashboard.allEngineers}
              favoriteEngineers={dashboard.favoriteEngineers}
              colors={colors}
              onToggleFavorite={dashboard.toggleFavorite}
            />
          )}

          {currentTab === 'wallet' && (
            <WalletTab
              walletBalance={walletBalance}
              colors={colors}
            />
          )}
        </ScrollView>
      )}

      {/* Footer Navigation Bar */}
      <View className={`border-t flex-row justify-around items-center h-20 pb-4 shadow-lg absolute bottom-0 left-0 right-0 ${colors.tabBar}`}>
        <TabButton label="Dash" iconName="home-outline" activeIconName="home" isActive={currentTab === 'dashboard'} onPress={() => setCurrentTab('dashboard')} isDark={isDark} />
        <TabButton label="Builds" iconName="construct-outline" activeIconName="construct" isActive={currentTab === 'projects'} onPress={() => setCurrentTab('projects')} isDark={isDark} />
        <TabButton label="Engineers" iconName="people-outline" activeIconName="people" isActive={currentTab === 'engineers'} onPress={() => setCurrentTab('engineers')} isDark={isDark} />
        <TabButton label="Wallet" iconName="wallet-outline" activeIconName="wallet" isActive={currentTab === 'wallet'} onPress={() => setCurrentTab('wallet')} isDark={isDark} />
        <TabButton label="Chat" iconName="chatbubbles-outline" activeIconName="chatbubbles" isActive={currentTab === 'chat'} onPress={() => setCurrentTab('chat')} isDark={isDark} />
      </View>

      {/* Create Custom Project Modal */}
      <CreateProjectModal
        visible={showCreateProjModal}
        engineers={dashboard.allEngineers}
        colors={colors}
        onClose={() => setShowCreateProjModal(false)}
        onSubmit={handleCreateProject}
      />

      {/* Escrow Insufficient Balance Warn Modal */}
      <WalletGateModal
        visible={showProjectWarning}
        colors={colors}
        onClose={() => setShowProjectWarning(false)}
        onAddFunds={() => {
          setShowProjectWarning(false);
          setShowFundModal(true);
        }}
      />

      {/* Flutterwave Deposit Gateway Modal */}
      <AddFundsModal
        visible={showFundModal}
        fundAmount={fundAmount}
        isProcessing={isProcessing}
        colors={colors}
        onClose={() => setShowFundModal(false)}
        onChangeAmount={setFundAmount}
        onSubmit={handleFlutterwaveFund}
      />

      {/* Profile & Settings Modal */}
      <ProfileSettingsModal
        visible={showSettingsModal}
        colors={colors}
        isDark={isDark}
        kycFiles={kycFiles}
        onClose={() => setShowSettingsModal(false)}
        onUploadKYC={handleUploadKYC}
        onToggleTheme={dashboard.toggleTheme}
      />
    </View>
  );
}
