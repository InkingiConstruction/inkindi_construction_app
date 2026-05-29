/**
 * ============================================================================
 * FILE NAME        : ClientDashboard.tsx
 * WHAT THIS FILE DOES : Main container shell coordinating the sub-modules of the
 *                       Client Workspace. Manages local interactive project creation,
 *                       escrow deductions, file attachments, and KYC uploads.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClientDashboard } from "../../hooks/useClientDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { useMessages } from "../../hooks/useMessages";

// Subcomponents & Tabs
import { getColors } from "./client/utils/colors";
import ClientHeader from "./client/components/ClientHeader";
import HomeTab from "./client/tabs/HomeTab";
import ProjectsTab from "./client/tabs/ProjectsTab";
import EngineersTab from "./client/tabs/EngineersTab";
import WalletTab from "./client/tabs/WalletTab";
import ChatTab from "./client/tabs/ChatTab";

// Modals
import AddFundsModal from "./client/modals/AddFundsModal";
import WalletGateModal from "./client/modals/WalletGateModal";
import CreateProjectModal from "./client/modals/CreateProjectModal";
import ProfileSettingsModal from "./client/modals/ProfileSettingsModal";

import TabButton from "../../components/ui/TabButton";
import LottieAnimation from "../../components/ui/LottieAnimation";

export default function ClientDashboard() {
  const dashboard = useClientDashboard();
  const { notifications, unreadCount, markAllRead, addNotification } =
    useNotifications();
  const { messages, sendMessage } = useMessages();

  const [currentTab, setCurrentTab] = useState<
    "dashboard" | "projects" | "engineers" | "wallet" | "chat"
  >("dashboard");
  const [showProfileDrop, setShowProfileDrop] = useState(false);
  const [showNotifDrop, setShowNotifDrop] = useState(false);

  // --- Local Interactive States ---
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [selectedProjId, setSelectedProjId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(40_500_000);
  const [kycFiles, setKycFiles] = useState<string[]>([
    "National_ID_UWASE.pdf",
    "Business_Registration.pdf",
  ]);

  // Modals Visibility
  const [showFundModal, setShowFundModal] = useState(false);
  const [showCreateProjModal, setShowCreateProjModal] = useState(false);
  const [showProjectWarning, setShowProjectWarning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [fundAmount, setFundAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Temp holder for budget checking during project creation
  const [pendingProjectData, setPendingProjectData] = useState<any | null>(
    null,
  );

  const isDark = dashboard.theme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 56 + insets.bottom;

  // Sync projects with initial mock data
  useEffect(() => {
    if (
      dashboard.clientProjects &&
      dashboard.clientProjects.length > 0 &&
      localProjects.length === 0
    ) {
      const initial = dashboard.clientProjects.map((p: any) => ({
        ...p,
        status: p.status === "IN_PROGRESS" ? "active" : p.status === "MILESTONE_REVIEW" ? "review" : "pending",
        startDate: p.startDate || "2026-05-15",
        endDate: p.endDate || "2026-09-30",
        milestones: (p.milestones || []).map((m: any) => ({
          title: m.name || m.title || "Milestone Task",
          pct: m.pct,
          status: m.status === "REVISION" ? "REVISION_REQUESTED" : m.status,
        })),
        documents: [
          {
            name: "Architectural_Blueprint.pdf",
            uploadedAt: "2026-05-24",
            size: "4.2 MB",
            type: "document"
          },
          {
            name: "Building_Permit_Kigali.pdf",
            uploadedAt: "2026-05-25",
            size: "1.8 MB",
            type: "document"
          },
        ],
      }));
      setLocalProjects(initial);
      setSelectedProjId(initial[0].id);
    }
  }, [dashboard.clientProjects]);

  // Derived: Current Selected Project
  const selectedProject =
    localProjects.find((p: any) => p.id === selectedProjId) ||
    localProjects[0] ||
    null;
  const projectMilestones = selectedProject ? selectedProject.milestones : [];

  // Compute live stats from local projects
  const stats = React.useMemo(() => {
    const allMilestones = localProjects.flatMap((p: any) => p.milestones || []);
    const paidCount = allMilestones.filter(
      (m: any) => m.status === "PAID",
    ).length;
    const pendingMilestones = allMilestones.filter(
      (m: any) => m.status === "PENDING",
    ).length;
    return {
      totalBudget: localProjects.reduce((s: number, p: any) => s + p.budget, 0),
      totalProjects: localProjects.length,
      pendingMilestones,
      completionRate:
        allMilestones.length > 0
          ? Math.round((paidCount / allMilestones.length) * 100)
          : 0,
    };
  }, [localProjects]);

  // --- ESCROW TRANSACTION FLOWS ---

  // --- ESCROW TRANSACTION FLOWS ---

  const handleReleaseMilestone = (index: number) => {
    if (!selectedProject) return;
    const milestone = selectedProject.milestones[index];
    const amount = selectedProject.budget * (milestone.pct / 100);

    setLocalProjects((prev: any[]) =>
      prev.map((p: any) => {
        if (p.id !== selectedProject.id) return p;
        const nextMilestones = [...p.milestones];
        nextMilestones[index] = { ...nextMilestones[index], status: "PAID" };
        const paidPct = nextMilestones
          .filter((m: any) => m.status === "PAID")
          .reduce((s: number, m: any) => s + m.pct, 0);
        return { ...p, progress: paidPct, milestones: nextMilestones };
      }),
    );

    addNotification({
      type: "payment",
      title: "Milestone Disbursed ✓",
      body: `${amount.toLocaleString()} RWF released from project escrow.`,
      time: "Just now",
      read: false,
    });
    Alert.alert(
      "Success",
      "Funds released securely from locked project budget.",
    );
  };

  const handleDisputeMilestone = (index: number, reason: string, description: string) => {
    if (!selectedProject) return;
    setLocalProjects((prev: any[]) =>
      prev.map((p: any) => {
        if (p.id !== selectedProject.id) return p;
        const nextMilestones = [...p.milestones];
        nextMilestones[index] = {
          ...nextMilestones[index],
          status: "REVISION_REQUESTED",
        };
        return { ...p, milestones: nextMilestones };
      }),
    );

    addNotification({
      type: "milestone",
      title: "Dispute Logged ⚠️",
      body: `Dispute logged on milestone: "${selectedProject.milestones[index].title}". Reason: ${reason}`,
      time: "Just now",
      read: false,
    });
  };

  const handleRequestRevision = (index: number, reason: string) => {
    if (!selectedProject) return;
    setLocalProjects((prev: any[]) =>
      prev.map((p: any) => {
        if (p.id !== selectedProject.id) return p;
        const nextMilestones = [...p.milestones];
        nextMilestones[index] = {
          ...nextMilestones[index],
          status: "REVISION_REQUESTED",
          revisionReason: reason,
        };
        return { ...p, milestones: nextMilestones };
      }),
    );

    addNotification({
      type: "milestone",
      title: "Revision Requested 🔄",
      body: `Revision requested for "${selectedProject.milestones[index].title}". Reason: ${reason}`,
      time: "Just now",
      read: false,
    });
    Alert.alert("Revision Requested", "Engineer will be notified of the requested changes.");
  };

  const handleUploadEvidence = (disputeId: string, evidenceUrl: string) => {
    addNotification({
      type: "milestone",
      title: "Evidence Uploaded 📁",
      body: `New evidence item added to dispute: "${evidenceUrl}".`,
      time: "Just now",
      read: false,
    });
  };

  const handleResolveDispute = (disputeId: string) => {
    addNotification({
      type: "milestone",
      title: "Dispute Resolved ✅",
      body: `Dispute has been resolved and closed.`,
      time: "Just now",
      read: false,
    });
  };

  const handleFundProject = (projectId: string, amount: number) => {
    if (walletBalance < amount) {
      Alert.alert("Insufficient Funds", "Please fund your escrow wallet first.");
      return;
    }
    setWalletBalance((prev) => prev - amount);
    setLocalProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, budget: p.budget + amount } : p
      )
    );
    addNotification({
      type: "payment",
      title: "Project Funded 💰",
      body: `Added ${amount.toLocaleString()} RWF to project escrow.`,
      time: "Just now",
      read: false,
    });
    Alert.alert("Success", `${amount.toLocaleString()} RWF added to project escrow.`);
  };

  const handleAssignEngineer = (projectId: string, engineerId: string) => {
    const engineer = dashboard.allEngineers.find((e: any) => e.id === engineerId);
    if (!engineer) return;
    setLocalProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, engineerId, supervisor: engineer.name } : p
      )
    );
    addNotification({
      type: "milestone",
      title: "Engineer Assigned 👷",
      body: `${engineer.name} has been assigned as supervisor.`,
      time: "Just now",
      read: false,
    });
    Alert.alert("Success", `${engineer.name} assigned to project.`);
  };

  const handleEditProject = (projectId: string, name: string, description: string) => {
    setLocalProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, name, description } : p
      )
    );
    addNotification({
      type: "milestone",
      title: "Project Edited ✏️",
      body: `Project details updated.`,
      time: "Just now",
      read: false,
    });
    Alert.alert("Success", "Project details updated successfully.");
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = localProjects.find((p) => p.id === projectId);
    setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
    setSelectedProjId(null);
    addNotification({
      type: "milestone",
      title: "Project Deleted 🗑️",
      body: `Project "${proj?.name || "Untitled"}" deleted.`,
      time: "Just now",
      read: false,
    });
    Alert.alert("Project Deleted", `Project has been deleted successfully.`);
  };

  const handleInviteEngineer = (engineerId: string) => {
    const engineer = dashboard.allEngineers.find((e: any) => e.id === engineerId);
    if (!engineer) return;

    if (localProjects.length === 0) {
      Alert.alert(
        "No Projects Available",
        "You do not have any active build contracts. Create a project first to invite this engineer."
      );
      return;
    }

    const options = localProjects.map((p) => ({
      text: p.name,
      onPress: () => {
        handleAssignEngineer(p.id, engineer.id);
        addNotification({
          type: "milestone",
          title: "Engineer Invited ✉️",
          body: `You invited ${engineer.name} to join "${p.name}".`,
          time: "Just now",
          read: false,
        });
        Alert.alert(
          "Invitation Sent",
          `An official invitation has been sent to ${engineer.name} for "${p.name}".`
        );
      },
    }));

    Alert.alert(
      "Select Project",
      `Which project do you want to invite ${engineer.name} to?`,
      [...options, { text: "Cancel", style: "cancel" }]
    );
  };

  const handleCreateProject = async (projectData: any) => {
    const {
      projectName,
      description,
      category,
      startDate,
      endDate,
      budget,
      currency,
      sitePhotos,
      plans,
      engineerId,
    } = projectData;

    const engineer = dashboard.allEngineers.find(
      (e: any) => e.id === engineerId,
    );

    // CHECK WALLET
    if (walletBalance < budget) {
      setPendingProjectData(projectData);
      setShowCreateProjModal(false);
      setShowProjectWarning(true);
      return;
    }

    // DEDUCT WALLET
    setWalletBalance((prev: number) => prev - budget);

    // CREATE PROJECT
    const newProj = {
      id: `proj-${Date.now()}`,
      name: projectName || "Unnamed Project",
      description: description || "",
      category: category || "Residential",
      startDate: startDate ? new Date(startDate).toLocaleDateString() : new Date().toLocaleDateString(),
      endDate: endDate ? new Date(endDate).toLocaleDateString() : new Date().toLocaleDateString(),
      currency: currency || "RWF",
      budget: budget || 0,
      location: "Kigali, Rwanda",
      gpsBoundary: true,
      supervisor: engineer?.name || "Assigned Supervisor",
      engineerId: engineerId || "",
      client: dashboard.user?.name || "Grace Uwase",
      progress: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      milestones: [
        {
          title: "Foundation & Excavation",
          pct: 30,
          status: "PENDING",
        },
        {
          title: "Structural Works",
          pct: 40,
          status: "PENDING",
        },
        {
          title: "Finishing & Handover",
          pct: 30,
          status: "PENDING",
        },
      ],
      documents: [
        ...(sitePhotos || []).map((p: string, idx: number) => ({
          type: "photo",
          name: `site_photo_${idx + 1}.jpg`,
          uploadedAt: new Date().toLocaleDateString(),
          size: "1.4 MB",
        })),
        ...(plans || []).map((p: string) => ({
          type: "document",
          name: p || "architectural_plan.pdf",
          uploadedAt: new Date().toLocaleDateString(),
          size: "2.8 MB",
        })),
      ],
    };

    // SAVE LOCALLY
    setLocalProjects((prev: any[]) => [newProj, ...prev]);
    setSelectedProjId(newProj.id);
    setShowCreateProjModal(false);

    // NOTIFICATION
    addNotification({
      type: "milestone",
      title: "Project Created 🏗️",
      body: `Project "${newProj.name}" created successfully with locked escrow.`,
      time: "Just now",
      read: false,
    });

    Alert.alert(
      "Project Created",
      "Your project has been created successfully.",
    );
  };

  const handleFlutterwaveFund = () => {
    if (!fundAmount || parseInt(fundAmount) < 10000) {
      return Alert.alert("Error", "Minimum 10,000 RWF required");
    }
    setIsProcessing(true);
    setTimeout(() => {
      const added = parseInt(fundAmount);
      setWalletBalance((prev: number) => prev + added);
      setIsProcessing(false);
      setShowFundModal(false);
      setFundAmount("");

      addNotification({
        type: "payment",
        title: "Escrow Funded",
        body: `${added.toLocaleString()} RWF credited via Flutterwave.`,
        time: "Just now",
        read: false,
      });

      if (pendingProjectData) {
        const nextBalance = walletBalance + added;
        if (nextBalance >= pendingProjectData.budget) {
          Alert.alert(
            "Escrow Funded",
            "Funds loaded successfully. Proceeding with project deployment.",
            [
              {
                text: "OK",
                onPress: () => {
                  handleCreateProject(pendingProjectData);
                  setPendingProjectData(null);
                },
              },
            ],
          );
        }
      } else {
        Alert.alert("Success", "Funds added securely via Flutterwave gateway.");
      }
    }, 1500);
  };

  const handleUploadDocument = (projectId: string, docName: string) => {
    setLocalProjects((prev: any[]) =>
      prev.map((p: any) => {
        if (p.id !== projectId) return p;
        const docs = p.documents || [];
        return {
          ...p,
          documents: [
            ...docs,
            {
              name: docName,
              uploadedAt: new Date().toISOString().split("T")[0],
              size: "2.4 MB",
            },
          ],
        };
      }),
    );

    addNotification({
      type: "milestone",
      title: "File Uploaded 📄",
      body: `Document "${docName}" uploaded to project workspace.`,
      time: "Just now",
      read: false,
    });
  };

  const handleUploadKYC = () => {
    Alert.prompt(
      "Upload KYC Document",
      "Enter document type / filename to attach (e.g. Business_License.pdf):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: (val?: string) => {
            if (val && val.trim()) {
              setKycFiles((prev: string[]) => [...prev, val.trim()]);
              addNotification({
                type: "payment",
                title: "KYC Document Received",
                body: `File "${val.trim()}" uploaded to your dossier.`,
                time: "Just now",
                read: false,
              });
              Alert.alert(
                "KYC Uploaded",
                "Document attached to your profile and sent to admin for verification.",
              );
            }
          },
        },
      ],
      "plain-text",
      "Tax_Clearance_Certificate.pdf",
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
      {currentTab === "chat" ? (
        <View className="flex-1 px-5 pt-4" style={{ paddingBottom: 96 }}>
          <ChatTab
            colors={colors}
            currentUserId={dashboard.user?.id || "usr-client-001"}
            currentUserName={dashboard.user?.name || "Grace Uwase"}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 8 }}
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {currentTab === "dashboard" && (
            <HomeTab
              stats={stats}
              clientProjects={localProjects}
              colors={colors}
              onAddProject={() => setShowCreateProjModal(true)}
              onSelectProject={(proj) => {
                setSelectedProjId(proj.id);
                setCurrentTab("projects");
              }}
              onChangeTab={setCurrentTab}
            />
          )}
          {currentTab === "projects" && (
            <ProjectsTab
              clientProjects={localProjects}
              selectedProject={selectedProject}
              projectMilestones={projectMilestones}
              colors={colors}
              onSelectProject={(p) => setSelectedProjId(p.id)}
              onReleaseMilestone={handleReleaseMilestone}
              onDisputeMilestone={handleDisputeMilestone}
              onRequestRevision={handleRequestRevision}
              onUploadDocument={handleUploadDocument}
              onUploadEvidence={handleUploadEvidence}
              onResolveDispute={handleResolveDispute}
              engineers={dashboard.allEngineers}
              onFundProject={handleFundProject}
              onAssignEngineer={handleAssignEngineer}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {currentTab === "engineers" && (
            <EngineersTab
              allEngineers={dashboard.allEngineers}
              favoriteEngineers={dashboard.favoriteEngineers}
              colors={colors}
              onToggleFavorite={dashboard.toggleFavorite}
              onInviteEngineer={handleInviteEngineer}
            />
          )}
          {currentTab === "wallet" && (
            <WalletTab walletBalance={walletBalance} colors={colors} />
          )}
        </ScrollView>
      )}

      {/* Footer Navigation Bar — LinkedIn style: icon + label, safe area aware */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "flex-start",
          paddingTop: 8,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#1e293b" : "#e8e8e8",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <TabButton
          label="Home"
          iconName="home-outline"
          activeIconName="home"
          isActive={currentTab === "dashboard"}
          onPress={() => setCurrentTab("dashboard")}
          isDark={isDark}
        />
        <TabButton
          label="Projects"
          iconName="construct-outline"
          activeIconName="construct"
          isActive={currentTab === "projects"}
          onPress={() => setCurrentTab("projects")}
          isDark={isDark}
        />
        <TabButton
          label="Engineers"
          iconName="people-outline"
          activeIconName="people"
          isActive={currentTab === "engineers"}
          onPress={() => setCurrentTab("engineers")}
          isDark={isDark}
        />
        <TabButton
          label="Wallet"
          iconName="wallet-outline"
          activeIconName="wallet"
          isActive={currentTab === "wallet"}
          onPress={() => setCurrentTab("wallet")}
          isDark={isDark}
        />
        <TabButton
          label="Chat"
          iconName="chatbubbles-outline"
          activeIconName="chatbubbles"
          isActive={currentTab === "chat"}
          onPress={() => setCurrentTab("chat")}
          isDark={isDark}
        />
      </View>

      {/* Modals */}
      <CreateProjectModal
        visible={showCreateProjModal}
        engineers={dashboard.allEngineers}
        colors={colors}
        onClose={() => setShowCreateProjModal(false)}
        onSubmit={handleCreateProject}
      />
      <WalletGateModal
        visible={showProjectWarning}
        colors={colors}
        onClose={() => setShowProjectWarning(false)}
        onAddFunds={() => {
          setShowProjectWarning(false);
          setShowFundModal(true);
        }}
      />
      <AddFundsModal
        visible={showFundModal}
        fundAmount={fundAmount}
        isProcessing={isProcessing}
        colors={colors}
        onClose={() => setShowFundModal(false)}
        onChangeAmount={setFundAmount}
        onSubmit={handleFlutterwaveFund}
      />
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
