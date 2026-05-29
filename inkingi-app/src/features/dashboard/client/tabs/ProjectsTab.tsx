/**
 * FILE NAME   : ProjectsTab.tsx
 * WHAT THIS FILE DOES : Complete project management with milestone review,
 *                       dispute management, and Lottie animations.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';
import LottieAnimation from '../../../../components/ui/LottieAnimation';

// ─── Types ────────────────────────────────────────────────────────────────────

type InnerTab = 'milestones' | 'timeline' | 'docs' | 'gallery' | 'disputes';

type MilestoneStatus = 'PAID' | 'PENDING' | 'UPCOMING' | 'REVISION_REQUESTED';

interface Milestone {
  title: string;
  pct: number;
  status: MilestoneStatus;
  progress?: number;
  submittedDate?: string;
  submittedPhotos?: string[];
  submittedReports?: string[];
  revisionReason?: string;
}

interface Dispute {
  id: string;
  milestoneIndex: number;
  milestoneTitle: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
  messages: DisputeMessage[];
}

interface DisputeMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  attachments?: string[];
  timestamp: string;
}

interface ProjectDocument {
  name: string;
  uploadedAt: string;
  size: string;
  type: 'document' | 'photo' | 'report';
}

interface Project {
  id: string;
  name: string;
  description?: string;
  location: string;
  supervisor?: string;
  budget: number;
  status: 'active' | 'pending' | 'review';
  progress: number;
  phase: string;
  startDate: string;
  endDate: string;
  documents?: ProjectDocument[];
  gpsCoords?: string;
  gpsSqm?: string;
  sitePhotos?: string[];
}

interface Props {
  clientProjects: Project[];
  selectedProject: Project | null;
  projectMilestones: Milestone[];
  colors: DashColors;
  onSelectProject: (proj: Project) => void;
  onReleaseMilestone: (index: number) => void;
  onDisputeMilestone: (index: number, reason: string, description: string) => void;
  onRequestRevision: (index: number, reason: string) => void;
  onUploadDocument: (projectId: string, docName: string, type: 'document' | 'photo' | 'report') => void;
  onUploadEvidence: (disputeId: string, evidenceUrl: string) => void;
  onResolveDispute: (disputeId: string) => void;
  onCreateProject?: () => void;
  engineers: any[];
  onFundProject: (projectId: string, amount: number) => void;
  onAssignEngineer: (projectId: string, engineerId: string) => void;
  onEditProject: (projectId: string, name: string, description: string) => void;
  onDeleteProject: (projectId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  active:  { bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', label: 'Active' },
  pending: { bg: '#FAEEDA', text: '#633806', border: '#FAC775', label: 'Pending' },
  review:  { bg: '#E6F1FB', text: '#0C447C', border: '#B5D4F4', label: 'In review' },
};

const MILESTONE_STYLE: Record<
  MilestoneStatus,
  { bg: string; text: string; border: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  PAID:     { bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', icon: 'checkmark-circle', iconColor: '#0F6E56' },
  PENDING:  { bg: '#FAEEDA', text: '#633806', border: '#FAC775', icon: 'time-outline',      iconColor: '#BA7517' },
  UPCOMING: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', icon: 'ellipse-outline',   iconColor: '#94a3b8' },
  REVISION_REQUESTED: { bg: '#FEF2F2', text: '#A32D2D', border: '#FECACA', icon: 'warning-outline', iconColor: '#A32D2D' },
};

const DISPUTE_STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: '#FEF2F2', text: '#A32D2D', label: 'Open' },
  under_review: { bg: '#FAEEDA', text: '#633806', label: 'Under Review' },
  resolved: { bg: '#E1F5EE', text: '#085041', label: 'Resolved' },
  escalated: { bg: '#FEE2E2', text: '#991B1B', label: 'Escalated' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderColor: s.border,
        borderWidth: 0.5,
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ color: s.text, fontSize: 10, fontWeight: '600' }}>{s.label}</Text>
    </View>
  );
}

function ProgressBar({ pct, color = '#007E6E' }: { pct: number; color?: string }) {
  return (
    <View
      style={{
        height: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 99,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, pct))}%`,
          backgroundColor: color,
          borderRadius: 99,
        }}
      />
    </View>
  );
}

function InnerTabBar({
  active,
  onChange,
  hasDisputes,
}: {
  active: InnerTab;
  onChange: (t: InnerTab) => void;
  hasDisputes: boolean;
}) {
  const tabs: { key: InnerTab; label: string; badge?: number }[] = [
    { key: 'milestones', label: 'Milestones' },
    { key: 'timeline',   label: 'Timeline' },
    { key: 'docs',       label: 'Documents' },
    { key: 'gallery',    label: 'Gallery' },
    { key: 'disputes',   label: 'Disputes', badge: hasDisputes ? 1 : 0 },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 3,
        gap: 2,
      }}
    >
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          onPress={() => onChange(t.key)}
          activeOpacity={0.7}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 7,
            borderRadius: 9,
            backgroundColor: active === t.key ? '#fff' : 'transparent',
            borderWidth: active === t.key ? 0.5 : 0,
            borderColor: '#E2E8F0',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: active === t.key ? '#007E6E' : '#64748b',
            }}
          >
            {t.label}
          </Text>
          {t.badge ? (
            <View style={{ backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1 }}>
              <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>{t.badge}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Milestone Review Panel (with approval and revision) ─────────────────────

function MilestoneReviewPanel({
  milestones,
  budget,
  onRelease,
  onDispute,
  onRequestRevision,
  colors,
}: {
  milestones: Milestone[];
  budget: number;
  onRelease: (i: number) => void;
  onDispute: (i: number, reason: string, description: string) => void;
  onRequestRevision: (i: number, reason: string) => void;
  colors: DashColors;
}) {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [revisionReason, setRevisionReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [modalType, setModalType] = useState<'revision' | 'dispute' | null>(null);

  const handleRequestRevision = (index: number) => {
    if (revisionReason.trim()) {
      onRequestRevision(index, revisionReason);
      setRevisionReason('');
      setModalType(null);
      setSelectedMilestone(null);
    } else {
      Alert.alert('Error', 'Please provide a reason for revision request');
    }
  };

  const handleRaiseDispute = (index: number) => {
    if (disputeReason.trim() && disputeDescription.trim()) {
      onDispute(index, disputeReason, disputeDescription);
      setDisputeReason('');
      setDisputeDescription('');
      setModalType(null);
      setSelectedMilestone(null);
    } else {
      Alert.alert('Error', 'Please provide both reason and description for dispute');
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
        Milestone Review & Approvals
      </Text>
      
      {milestones.map((m, i) => {
        const ms = MILESTONE_STYLE[m.status];
        const value = budget * (m.pct / 100);
        const isPending = m.status === 'PENDING';
        const isRevisionRequested = m.status === 'REVISION_REQUESTED';

        return (
          <View
            key={i}
            style={{
              backgroundColor: '#fff',
              borderWidth: 0.5,
              borderColor: '#E2E8F0',
              borderRadius: 16,
              padding: 14,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                  {m.title}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {m.pct}% · {value.toLocaleString()} RWF
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: ms.bg,
                  borderWidth: 0.5,
                  borderColor: ms.border,
                  borderRadius: 99,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Ionicons name={ms.icon} size={11} color={ms.iconColor} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: ms.text, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {m.status === 'REVISION_REQUESTED' ? 'Revision Needed' : m.status}
                </Text>
              </View>
            </View>

            <ProgressBar
              pct={m.status === 'PAID' ? 100 : m.status === 'PENDING' ? (m.progress ?? 65) : m.status === 'REVISION_REQUESTED' ? (m.progress ?? 30) : 0}
              color={m.status === 'PAID' ? '#007E6E' : m.status === 'PENDING' ? '#BA7517' : m.status === 'REVISION_REQUESTED' ? '#A32D2D' : '#E2E8F0'}
            />

            {/* Submitted content preview */}
            {(isPending || isRevisionRequested) && m.submittedPhotos && m.submittedPhotos.length > 0 && (
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b' }}>Submitted Evidence</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {m.submittedPhotos.map((photo, idx) => (
                    <View key={idx} style={{ width: 60, height: 60, backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 8, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="image-outline" size={24} color="#94A3B8" />
                    </View>
                  ))}
                </ScrollView>
                {m.submittedReports && m.submittedReports.map((report, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                    <Ionicons name="document-text-outline" size={16} color="#007E6E" />
                    <Text style={{ fontSize: 11, color: '#475569' }}>{report}</Text>
                  </View>
                ))}
              </View>
            )}

            {isRevisionRequested && m.revisionReason && (
              <View style={{ backgroundColor: '#FEF2F2', padding: 10, borderRadius: 10, borderWidth: 0.5, borderColor: '#FECACA' }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#A32D2D' }}>Revision Requested:</Text>
                <Text style={{ fontSize: 11, color: '#7F1D1D', marginTop: 2 }}>{m.revisionReason}</Text>
              </View>
            )}

            {isPending && (
              <>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>
                  {m.progress ?? 65}% verified · Submitted {m.submittedDate ?? 'recently'}
                </Text>
                
                {/* Action Buttons for Milestone Review */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMilestone(i);
                      setModalType('revision');
                    }}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      backgroundColor: '#FEF2F2',
                      borderWidth: 0.5,
                      borderColor: '#FECACA',
                      borderRadius: 10,
                      paddingVertical: 9,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                    }}
                  >
                    <Ionicons name="create-outline" size={13} color="#A32D2D" />
                    <Text style={{ fontSize: 12, color: '#A32D2D', fontWeight: '600' }}>
                      Request Revision
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => onRelease(i)}
                    activeOpacity={0.85}
                    style={{
                      flex: 1,
                      backgroundColor: '#007E6E',
                      borderRadius: 10,
                      paddingVertical: 9,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={13} color="#fff" />
                    <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                      Approve Payment
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Dispute Button */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMilestone(i);
                    setModalType('dispute');
                  }}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    paddingVertical: 8,
                    borderWidth: 0.5,
                    borderColor: '#E2E8F0',
                    borderRadius: 10,
                    marginTop: 4,
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={13} color="#64748b" />
                  <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500' }}>
                    Raise Dispute
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      })}

      {/* Revision Request Modal */}
      <Modal visible={modalType === 'revision'} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 }}>Request Revision</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Reason for revision:</Text>
            <TextInput
              value={revisionReason}
              onChangeText={setRevisionReason}
              placeholder="Explain what needs to be revised..."
              multiline
              numberOfLines={4}
              style={{ borderWidth: 0.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 20 }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setModalType(null)} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 0.5, borderColor: '#E2E8F0', alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectedMilestone !== null && handleRequestRevision(selectedMilestone)} style={{ flex: 1, backgroundColor: '#007E6E', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Submit Revision</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dispute Modal */}
      <Modal visible={modalType === 'dispute'} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 }}>Raise a Dispute</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Dispute title/reason:</Text>
            <TextInput
              value={disputeReason}
              onChangeText={setDisputeReason}
              placeholder="Brief reason for dispute..."
              style={{ borderWidth: 0.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16 }}
            />
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Description:</Text>
            <TextInput
              value={disputeDescription}
              onChangeText={setDisputeDescription}
              placeholder="Provide detailed explanation..."
              multiline
              numberOfLines={4}
              style={{ borderWidth: 0.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 20 }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setModalType(null)} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 0.5, borderColor: '#E2E8F0', alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectedMilestone !== null && handleRaiseDispute(selectedMilestone)} style={{ flex: 1, backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Raise Dispute</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Dispute Management Panel ───────────────────────────────────────────────

function DisputeManagementPanel({
  disputes,
  onUploadEvidence,
  onResolveDispute,
  colors,
}: {
  disputes: Dispute[];
  onUploadEvidence: (disputeId: string, evidenceUrl: string) => void;
  onResolveDispute: (disputeId: string) => void;
  colors: DashColors;
}) {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [evidenceText, setEvidenceText] = useState('');

  const handleAddEvidence = (disputeId: string) => {
    if (evidenceText.trim()) {
      onUploadEvidence(disputeId, evidenceText);
      setEvidenceText('');
    }
  };

  if (disputes.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
        <LottieAnimation type="secure" size={80} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>No Active Disputes</Text>
        <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
          All milestones are progressing smoothly.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Dispute Management</Text>
      
      {disputes.map((dispute) => {
        const ds = DISPUTE_STATUS_STYLE[dispute.status];
        return (
          <TouchableOpacity
            key={dispute.id}
            onPress={() => setSelectedDispute(dispute)}
            style={{
              backgroundColor: '#fff',
              borderWidth: 0.5,
              borderColor: '#E2E8F0',
              borderRadius: 16,
              padding: 14,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{dispute.reason}</Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Milestone: {dispute.milestoneTitle}</Text>
              </View>
              <View style={{ backgroundColor: ds.bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: ds.text }}>{ds.label}</Text>
              </View>
            </View>
            
            <Text style={{ fontSize: 12, color: '#475569' }} numberOfLines={2}>{dispute.description}</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 10, color: '#94A3B8' }}>Opened: {dispute.createdAt}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Ionicons name="document-text-outline" size={14} color="#64748b" />
                <Text style={{ fontSize: 10, color: '#64748b' }}>{dispute.evidenceUrls.length} evidence items</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Dispute Detail Modal */}
      <Modal visible={!!selectedDispute} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
            {selectedDispute && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B' }}>Dispute Details</Text>
                  <TouchableOpacity onPress={() => setSelectedDispute(null)}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 12 }}>
                  <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Milestone</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1E293B', marginTop: 2 }}>{selectedDispute.milestoneTitle}</Text>
                  </View>

                  <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Reason</Text>
                    <Text style={{ fontSize: 14, color: '#1E293B', marginTop: 2 }}>{selectedDispute.reason}</Text>
                  </View>

                  <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Description</Text>
                    <Text style={{ fontSize: 14, color: '#475569', marginTop: 2 }}>{selectedDispute.description}</Text>
                  </View>

                  {/* Evidence Section */}
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>Evidence & Attachments</Text>
                    {selectedDispute.evidenceUrls.map((url, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#F1F5F9', borderRadius: 10, marginBottom: 6 }}>
                        <Ionicons name="attach-outline" size={16} color="#007E6E" />
                        <Text style={{ fontSize: 12, color: '#1E293B' }}>{url}</Text>
                      </View>
                    ))}
                    
                    {/* Add Evidence */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <TextInput
                        value={evidenceText}
                        onChangeText={setEvidenceText}
                        placeholder="Add evidence URL or description..."
                        style={{ flex: 1, borderWidth: 0.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, fontSize: 13 }}
                      />
                      <TouchableOpacity onPress={() => handleAddEvidence(selectedDispute.id)} style={{ backgroundColor: '#007E6E', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}>
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Dispute Timeline */}
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 }}>Timeline</Text>
                    <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>Opened</Text>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: '#1E293B' }}>{selectedDispute.createdAt}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>Last Updated</Text>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: '#1E293B' }}>{selectedDispute.updatedAt}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>Status</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: DISPUTE_STATUS_STYLE[selectedDispute.status].text }}>
                          {DISPUTE_STATUS_STYLE[selectedDispute.status].label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Resolve Button */}
                  {selectedDispute.status !== 'resolved' && (
                    <TouchableOpacity
                      onPress={() => {
                        onResolveDispute(selectedDispute.id);
                        setSelectedDispute(null);
                      }}
                      style={{ backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Mark as Resolved</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TimelinePanel({
  milestones,
  colors,
}: {
  milestones: Milestone[];
  colors: DashColors;
}) {
  const dotColor = (s: MilestoneStatus) =>
    s === 'PAID' ? '#007E6E' : s === 'PENDING' ? '#BA7517' : s === 'REVISION_REQUESTED' ? '#A32D2D' : '#CBD5E1';
  const badgeBg = (s: MilestoneStatus) =>
    s === 'PAID' ? '#E1F5EE' : s === 'PENDING' ? '#FAEEDA' : s === 'REVISION_REQUESTED' ? '#FEF2F2' : '#F1F5F9';
  const badgeText = (s: MilestoneStatus) =>
    s === 'PAID' ? '#085041' : s === 'PENDING' ? '#633806' : s === 'REVISION_REQUESTED' ? '#A32D2D' : '#64748b';
  const badgeLabel = (s: MilestoneStatus) =>
    s === 'PAID' ? 'Completed' : s === 'PENDING' ? 'In progress' : s === 'REVISION_REQUESTED' ? 'Revision Needed' : 'Upcoming';

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 16,
        gap: 0,
      }}
    >
      {milestones.map((m, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ alignItems: 'center', width: 10 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: dotColor(m.status),
                marginTop: 3,
                flexShrink: 0,
              }}
            />
            {i < milestones.length - 1 && (
              <View
                style={{
                  width: 1,
                  flex: 1,
                  minHeight: 32,
                  backgroundColor: '#E2E8F0',
                  marginTop: 2,
                }}
              />
            )}
          </View>

          <View style={{ flex: 1, paddingBottom: i < milestones.length - 1 ? 16 : 0 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
              {m.title}
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              {m.pct}% of budget
            </Text>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: badgeBg(m.status),
                borderRadius: 99,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '500', color: badgeText(m.status) }}>
                {badgeLabel(m.status)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function DocumentsPanel({
  project,
  onUpload,
  colors,
}: {
  project: Project;
  onUpload: (type: 'document' | 'photo' | 'report') => void;
  colors: DashColors;
}) {
  const docs = project.documents ?? [];

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Workspace documents</Text>
        <TouchableOpacity
          onPress={() => onUpload('document')}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#E1F5EE',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Ionicons name="cloud-upload-outline" size={13} color="#0F6E56" />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#085041' }}>Attach file</Text>
        </TouchableOpacity>
      </View>

      {docs.length > 0 ? (
        <View style={{ gap: 8 }}>
          {docs.map((doc, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: '#fff',
                borderWidth: 0.5,
                borderColor: '#E2E8F0',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  backgroundColor: doc.type === 'report' ? '#FAEEDA' : '#E6F1FB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={doc.type === 'report' ? 'document-attach-outline' : 'document-text-outline'} size={17} color={doc.type === 'report' ? '#BA7517' : '#185FA5'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: '600', color: colors.text }}
                  numberOfLines={1}
                >
                  {doc.name}
                </Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                  Uploaded {doc.uploadedAt} · {doc.size}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Open file', `Opening ${doc.name}…`)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  borderWidth: 0.5,
                  borderColor: '#E2E8F0',
                  borderRadius: 7,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}
              >
                <Ionicons name="eye-outline" size={13} color="#64748b" />
                <Text style={{ fontSize: 11, color: '#64748b' }}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#fff',
            borderWidth: 0.5,
            borderColor: '#E2E8F0',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="folder-open-outline" size={28} color="#94a3b8" />
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            No documents yet. Tap "Attach file" to upload.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>GPS boundary</Text>
        <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="pencil-outline" size={13} color="#007E6E" />
          <Text style={{ fontSize: 11, color: '#007E6E' }}>Edit boundary</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: '#fff',
          borderWidth: 0.5,
          borderColor: '#E2E8F0',
          borderRadius: 14,
          height: 130,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Ionicons name="map-outline" size={30} color="#007E6E" />
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
          GPS boundary set
        </Text>
        <Text style={{ fontSize: 11, color: '#64748b' }}>
          {project.location} · {project.gpsSqm ?? '4,200 m²'}
        </Text>
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderWidth: 0.5,
            borderColor: '#E2E8F0',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 10, color: '#64748b' }}>
            {project.gpsCoords ?? '-1.9536° S, 30.0606° E'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function GalleryPanel({ onUpload }: { onUpload: () => void }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>Site photos & Reports</Text>
        <TouchableOpacity
          onPress={onUpload}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#E1F5EE',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Ionicons name="camera-outline" size={13} color="#0F6E56" />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#085041' }}>Upload</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: '47.5%',
              aspectRatio: 4 / 3,
              backgroundColor: '#E1F5EE',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 0.5,
              borderColor: '#E2E8F0',
            }}
          >
            <Ionicons name="image-outline" size={30} color="#0F6E56" />
          </View>
        ))}
        <View
          style={{
            width: '47.5%',
            aspectRatio: 4 / 3,
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.5,
            borderColor: '#E2E8F0',
            borderStyle: 'dashed',
          }}
        >
          <Ionicons name="add-outline" size={24} color="#94a3b8" />
          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Add photo</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectsTab({
  clientProjects,
  selectedProject,
  projectMilestones,
  colors,
  onSelectProject,
  onReleaseMilestone,
  onDisputeMilestone,
  onRequestRevision,
  onUploadDocument,
  onUploadEvidence,
  onResolveDispute,
  onCreateProject,
  engineers,
  onFundProject,
  onAssignEngineer,
  onEditProject,
  onDeleteProject,
}: Props) {
  const [search, setSearch] = useState('');
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [innerTab, setInnerTab] = useState<InnerTab>('milestones');
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  // Sync selectedProject prop (e.g. from HomeTab click) to detailProject view state
  React.useEffect(() => {
    if (selectedProject) {
      setDetailProject(selectedProject);
    }
  }, [selectedProject]);

  // Filter projects by search query
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientProjects;
    return clientProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.supervisor ?? '').toLowerCase().includes(q),
    );
  }, [clientProjects, search]);

  const handleOpenDetail = (proj: Project) => {
    onSelectProject(proj);
    setDetailProject(proj);
    setInnerTab('milestones');
  };

  const handleBack = () => {
    setDetailProject(null);
  };

  const handleDocUpload = (type: 'document' | 'photo' | 'report') => {
    if (!detailProject) return;
    if (Platform.OS === 'ios') {
      Alert.prompt(
        `Upload ${type}`,
        `Enter file name for ${type}:`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: (val?: string) => {
              if (val?.trim()) onUploadDocument(detailProject.id, val.trim(), type);
            },
          },
        ],
        'plain-text',
        type === 'report' ? 'Weekly_Report.pdf' : 'Site_Photo.jpg',
      );
    } else {
      onUploadDocument(detailProject.id, `${type}_file.pdf`, type);
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert('Upload photo', 'Open camera or photo library?', [
      { text: 'Camera', onPress: () => {} },
      { text: 'Library', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRaiseDispute = (milestoneIndex: number, reason: string, description: string) => {
    const milestone = projectMilestones[milestoneIndex];
    const newDispute: Dispute = {
      id: Date.now().toString(),
      milestoneIndex,
      milestoneTitle: milestone.title,
      reason,
      description,
      evidenceUrls: [],
      status: 'open',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      messages: [],
    };
    setDisputes(prev => [...prev, newDispute]);
    onDisputeMilestone(milestoneIndex, reason, description);
    Alert.alert('Dispute Raised', 'Your dispute has been submitted for review.');
  };

  const handleAddEvidence = (disputeId: string, evidenceUrl: string) => {
    setDisputes(prev => prev.map(d => 
      d.id === disputeId 
        ? { ...d, evidenceUrls: [...d.evidenceUrls, evidenceUrl], updatedAt: new Date().toLocaleDateString() }
        : d
    ));
    onUploadEvidence(disputeId, evidenceUrl);
  };

  const handleResolveDispute = (disputeId: string) => {
    setDisputes(prev => prev.map(d => 
      d.id === disputeId ? { ...d, status: 'resolved', updatedAt: new Date().toLocaleDateString() } : d
    ));
    onResolveDispute(disputeId);
    Alert.alert('Dispute Resolved', 'The dispute has been marked as resolved.');
  };

  const handleEllipsisMenu = () => {
    if (!detailProject) return;
    const proj = detailProject;

    Alert.alert(
      "Project Actions",
      `Manage "${proj.name}"`,
      [
        {
          text: "Fund Project (Escrow)",
          onPress: () => {
            Alert.prompt(
              "Fund Escrow",
              "Enter the amount in RWF to add to this project's locked escrow budget:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Fund",
                  onPress: (val:any) => {
                    const amt = Number(val);
                    if (isNaN(amt) || amt <= 0) {
                      Alert.alert("Invalid Amount", "Please enter a valid positive number.");
                      return;
                    }
                    onFundProject(proj.id, amt);
                    setDetailProject(prev => prev ? { ...prev, budget: prev.budget + amt } : null);
                  }
                }
              ],
              "plain-text",
              "5000000"
            );
          }
        },
        {
          text: "Assign Supervisor/Engineer",
          onPress: () => {
            if (!engineers || engineers.length === 0) {
              Alert.alert("No Engineers", "No engineers available to assign.");
              return;
            }
            const opts = engineers.map(eng => ({
              text: `${eng.name} (${eng.specialty || "Structural"})`,
              onPress: () => {
                onAssignEngineer(proj.id, eng.id);
                setDetailProject(prev => prev ? { ...prev, supervisor: eng.name } : null);
              }
            }));
            Alert.alert(
              "Assign Engineer",
              "Select an engineer to assign to this project:",
              [...opts, { text: "Cancel", style: "cancel" }]
            );
          }
        },
        {
          text: "Edit Project Details",
          onPress: () => {
            if (Platform.OS === 'ios') {
              Alert.prompt(
                "Edit Project Name",
                "Enter the new name for this project:",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Next",
                    onPress: (newName: any) => {
                      if (!newName || !newName.trim()) return;
                      Alert.prompt(
                        "Edit Description",
                        "Enter the new description:",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Save",
                            onPress: (newDesc: any) => {
                              onEditProject(proj.id, newName.trim(), newDesc || "");
                              setDetailProject(prev => prev ? { ...prev, name: newName.trim(), description: newDesc || "" } : null);
                            }
                          }
                        ],
                        "plain-text",
                        proj.description || ""
                      );
                    }
                  }
                ],
                "plain-text",
                proj.name
              );
            } else {
              // Android fallback: prompt via simple Alert inputs or direct naming
              Alert.alert(
                "Edit Project Details",
                "For Android, edit project via standard panel. Proceeding to update name to 'Updated Project Name'?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Rename",
                    onPress: () => {
                      onEditProject(proj.id, "Updated Project Name", proj.description || "");
                      setDetailProject(prev => prev ? { ...prev, name: "Updated Project Name" } : null);
                    }
                  }
                ]
              );
            }
          }
        },
        {
          text: "Delete Project",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Delete",
              "Are you sure you want to delete this project? This will unlock any unused escrow back to your wallet.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    onDeleteProject(proj.id);
                    handleBack();
                  }
                }
              ]
            );
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // Detail view with Lottie Animation on the green card
  if (detailProject) {
    const proj = detailProject;
    const ss = STATUS_STYLE[proj.status] ?? STATUS_STYLE.pending;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ gap: 16 }}>

          {/* Back + actions header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderWidth: 0.5,
                borderColor: '#E2E8F0',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Ionicons name="arrow-back-outline" size={15} color="#64748b" />
              <Text style={{ fontSize: 12, color: '#64748b' }}>Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEllipsisMenu}
              activeOpacity={0.7}
              style={{
                borderWidth: 0.5,
                borderColor: '#E2E8F0',
                borderRadius: 8,
                padding: 6,
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Hero card with Lottie Animation */}
          <View
            style={{
              backgroundColor: '#007E6E',
              borderRadius: 20,
              padding: 20,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Decorative circles */}
            <View
              style={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.06)',
                right: -30,
                top: -30,
              }}
            />
            
            {/* Lottie Animation inside the green card - top right */}
            <View
              style={{
                position: 'absolute',
                right: 10,
                bottom: 10,
                opacity: 0.15,
              }}
            >
              <LottieAnimation type="construction" size={100} autoPlay loop />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 }}>
                  {proj.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.55)" />
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{proj.location}</Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: ss.bg,
                  borderWidth: 0.5,
                  borderColor: ss.border,
                  borderRadius: 99,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: ss.text }}>{ss.label}</Text>
              </View>
            </View>

            {/* Stats grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 0,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.12)',
                paddingTop: 14,
              }}
            >
              {[
                { label: 'Budget',          val: `${proj.budget.toLocaleString()} RWF` },
                { label: 'Supervisor',      val: proj.supervisor ?? 'Aline Mukamana' },
                { label: 'Start date',      val: proj.startDate },
                { label: 'Est. completion', val: proj.endDate },
              ].map((s, i) => (
                <View key={i} style={{ width: '50%', paddingBottom: 10, paddingRight: i % 2 === 0 ? 12 : 0 }}>
                  <Text style={{ fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.9, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>
                    {s.label}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#fff' }}>{s.val}</Text>
                </View>
              ))}
            </View>

            {/* Overall progress */}
            <View style={{ marginTop: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Overall progress</Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{proj.progress}%</Text>
              </View>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${proj.progress}%`, backgroundColor: '#fff', borderRadius: 99 }} />
              </View>
            </View>
          </View>

          {/* Inner tabs */}
          <InnerTabBar 
            active={innerTab} 
            onChange={setInnerTab} 
            hasDisputes={disputes.length > 0}
          />

          {/* Panels */}
          {innerTab === 'milestones' && (
            <MilestoneReviewPanel
              milestones={projectMilestones}
              budget={proj.budget}
              onRelease={onReleaseMilestone}
              onDispute={handleRaiseDispute}
              onRequestRevision={onRequestRevision}
              colors={colors}
            />
          )}
          {innerTab === 'timeline' && (
            <TimelinePanel milestones={projectMilestones} colors={colors} />
          )}
          {innerTab === 'docs' && (
            <DocumentsPanel project={proj} onUpload={handleDocUpload} colors={colors} />
          )}
          {innerTab === 'gallery' && (
            <GalleryPanel onUpload={handlePhotoUpload} />
          )}
          {innerTab === 'disputes' && (
            <DisputeManagementPanel
              disputes={disputes}
              onUploadEvidence={handleAddEvidence}
              onResolveDispute={handleResolveDispute}
              colors={colors}
            />
          )}

        </View>
      </ScrollView>
    );
  }

  // List view
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ gap: 16 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text }}>
              Build contracts
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Your active construction projects
            </Text>
          </View>
          <TouchableOpacity
            onPress={onCreateProject}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: '#007E6E',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Ionicons name="add-outline" size={16} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>New project</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#fff',
            borderWidth: 0.5,
            borderColor: '#E2E8F0',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects, locations, supervisors…"
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, fontSize: 13, color: colors.text }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Project cards or empty state */}
        {clientProjects.length === 0 ? (
          <View
            style={{
              backgroundColor: '#fff',
              borderWidth: 0.5,
              borderColor: '#E2E8F0',
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              gap: 10,
              marginTop: 8,
            }}
          >
            <LottieAnimation type="construction" size={80} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' }}>
              No projects yet
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 }}>
              Create your first build contract to start managing milestones, escrow, and documents.
            </Text>
            <TouchableOpacity
              onPress={onCreateProject}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#007E6E',
                borderRadius: 12,
                paddingHorizontal: 20,
                paddingVertical: 12,
                marginTop: 4,
              }}
            >
              <Ionicons name="add-circle-outline" size={17} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Create first project</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
            <Ionicons name="search-outline" size={32} color="#94a3b8" />
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>No results</Text>
            <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
              No projects match "{search}". Try a different name or location.
            </Text>
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Text style={{ fontSize: 12, color: '#007E6E', fontWeight: '600' }}>Clear search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((proj) => {
              const ss = STATUS_STYLE[proj.status] ?? STATUS_STYLE.pending;
              return (
                <TouchableOpacity
                  key={proj.id}
                  onPress={() => handleOpenDetail(proj)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#fff',
                    borderWidth: 0.5,
                    borderColor: '#E2E8F0',
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                        {proj.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Ionicons name="location-outline" size={11} color="#94a3b8" />
                        <Text style={{ fontSize: 11, color: '#64748b' }}>{proj.location}</Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: ss.bg,
                        borderWidth: 0.5,
                        borderColor: ss.border,
                        borderRadius: 99,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '600', color: ss.text }}>{ss.label}</Text>
                    </View>
                  </View>

                  <ProgressBar pct={proj.progress} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>{proj.progress}% complete</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>{proj.phase}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                      paddingTop: 10,
                      borderTopWidth: 0.5,
                      borderTopColor: '#F1F5F9',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="wallet-outline" size={12} color="#94a3b8" />
                      <Text style={{ fontSize: 11, color: '#64748b' }}>
                        {proj.budget.toLocaleString()} RWF
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="person-outline" size={12} color="#94a3b8" />
                      <Text style={{ fontSize: 11, color: '#64748b' }}>
                        {proj.supervisor ?? 'Unassigned'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Text style={{ fontSize: 11, color: '#007E6E', fontWeight: '600' }}>View</Text>
                      <Ionicons name="chevron-forward" size={12} color="#007E6E" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </View>
    </ScrollView>
  );
}