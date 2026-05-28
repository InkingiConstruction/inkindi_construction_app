/**
 * ============================================================================
 * FILE NAME        : useClientDashboard.ts
 * WHAT THIS FILE DOES : Single source of truth for all Client Dashboard logic.
 *                       Keeps the UI component pure — no business logic there.
 * DATA SOURCE         : AuthContext + AsyncStorage (favorites) + local mock state
 * PRINCIPLE APPLIED   : SOLID — SRP (hook owns data, component owns render)
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { MockProject, MockUser } from '@/data/mockAdminService';
import { useNotifications } from './useNotifications';

export const FAV_ENGINEERS_KEY = 'inkingi_fav_engineers_v1';

export interface EngineerRating {
  engineerId: string;
  rating: number;
  completedProjects: number;
  experience: number;
  specializations: string[];
}

export const EXTRA_ENGINEERS: MockUser[] = [
  {
    id: 'eng-002', name: 'Jean-Pierre Nkurunziza', username: 'jp_engineer',
    role: 'ENGINEER', status: 'ACTIVE', kycStatus: 'APPROVED',
    licenseNumber: 'IER-2026-3321', insuranceAmount: '12,000,000 RWF',
    phone: '+250788430020', email: 'jp.nkurunziza@inkingi.rw',
    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'eng-003', name: 'Marie-Claire Kayitesi', username: 'marie_engineer',
    role: 'ENGINEER', status: 'ACTIVE', kycStatus: 'APPROVED',
    licenseNumber: 'IER-2026-5512', insuranceAmount: '18,000,000 RWF',
    phone: '+250788430030', email: 'marie.kayitesi@inkingi.rw',
    profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2026-03-15T08:00:00Z', updatedAt: '2026-05-18T10:00:00Z',
  },
  {
    id: 'eng-004', name: 'David Mugisha', username: 'david_engineer',
    role: 'ENGINEER', status: 'ACTIVE', kycStatus: 'APPROVED',
    licenseNumber: 'IER-2026-7734', insuranceAmount: '20,000,000 RWF',
    phone: '+250788430040', email: 'david.mugisha@inkingi.rw',
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2026-02-10T08:00:00Z', updatedAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'eng-005', name: 'Celestin Habimana', username: 'celestin_eng',
    role: 'ENGINEER', status: 'ACTIVE', kycStatus: 'APPROVED',
    licenseNumber: 'IER-2026-9901', insuranceAmount: '15,000,000 RWF',
    phone: '+250788430050', email: 'celestin.h@inkingi.rw',
    profilePic: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-05-10T10:00:00Z',
  },
];

export const ENGINEER_META: Record<string, EngineerRating> = {
  'usr-engineer-001': { engineerId: 'usr-engineer-001', rating: 4.8, completedProjects: 14, experience: 8, specializations: ['Residential', 'Reinforced Concrete'] },
  'eng-002':          { engineerId: 'eng-002',          rating: 4.5, completedProjects: 9,  experience: 6, specializations: ['Commercial', 'Masonry'] },
  'eng-003':          { engineerId: 'eng-003',          rating: 4.9, completedProjects: 17, experience: 10, specializations: ['Residential', 'Green Building'] },
  'eng-004':          { engineerId: 'eng-004',          rating: 4.2, completedProjects: 6,  experience: 4, specializations: ['Infrastructure', 'Road Works'] },
  'eng-005':          { engineerId: 'eng-005',          rating: 4.6, completedProjects: 11, experience: 7, specializations: ['Commercial', 'Industrial'] },
};

export function useClientDashboard() {
  const { user, projects, mockUsers, theme, toggleTheme, handleLogout, updateUserProfile } = useAuth();
  const { addNotification } = useNotifications();

  // ── Derived: all engineers on the platform ─────────────────────────────────
  const allEngineers: MockUser[] = useMemo(() => {
    const fromContext = mockUsers.filter(u => u.role === 'ENGINEER');
    const ids = new Set(fromContext.map(e => e.id));
    const extras = EXTRA_ENGINEERS.filter(e => !ids.has(e.id));
    return [...fromContext, ...extras];
  }, [mockUsers]);

  // ── Derived: client's own projects ────────────────────────────────────────
  const clientProjects: MockProject[] = useMemo(
    () => projects.filter(p => p.client === user?.name || p.client === 'Grace Uwase'),
    [projects, user]
  );

  // ── Stats (formula source: clientProjects + milestones) ────────────────────
  const stats = useMemo(() => {
    const allMilestones = clientProjects.flatMap(p => p.milestones);
    const paidCount     = allMilestones.filter(m => m.status === 'PAID').length;

    return {
      totalBudget:       clientProjects.reduce((s, p) => s + p.budget, 0),
      totalProjects:     clientProjects.length,
      pendingMilestones: allMilestones.filter(m => m.status === 'PENDING').length,
      completionRate:    allMilestones.length > 0
                           ? Math.round((paidCount / allMilestones.length) * 100)
                           : 0,
    };
  }, [clientProjects]);

  // ── Wallet balance (independent of any single project's escrow) ───────────
  const [walletBalance, setWalletBalance] = useState(40_500_000);

  const addFunds = useCallback((amount: number) => {
    setWalletBalance(prev => prev + amount);
    addNotification({
      type: 'payment',
      title: 'Funds Added ✓',
      body: `${amount.toLocaleString()} RWF credited to your escrow wallet.`,
      time: 'Just now',
      read: false,
    });
  }, [addNotification]);

  // ── Favorite engineers (persisted to AsyncStorage) ─────────────────────────
  const [favoriteEngineers, setFavoriteEngineers] = useState<string[]>([]);
  const [favLoaded, setFavLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(FAV_ENGINEERS_KEY)
      .then(raw => { if (raw) setFavoriteEngineers(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setFavLoaded(true));
  }, []);

  const toggleFavorite = useCallback(async (engineerId: string) => {
    setFavoriteEngineers(prev => {
      const next = prev.includes(engineerId)
        ? prev.filter(id => id !== engineerId)
        : [...prev, engineerId];
      AsyncStorage.setItem(FAV_ENGINEERS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // ── Active project + milestone management ──────────────────────────────────
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(
    clientProjects[0] ?? null
  );
  const [projectMilestones, setProjectMilestones] = useState(
    clientProjects[0]?.milestones ?? []
  );

  const selectProject = useCallback((project: MockProject) => {
    setSelectedProject(project);
    setProjectMilestones(project.milestones);
  }, []);

  const releaseMilestone = useCallback((index: number) => {
    if (!selectedProject) return;
    const amount = selectedProject.budget * (projectMilestones[index].pct / 100);
    setWalletBalance(prev => prev - amount);
    setProjectMilestones(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'PAID' };
      return next;
    });
    addNotification({
      type: 'payment',
      title: 'Milestone Paid ✓',
      body: `${amount.toLocaleString()} RWF released to engineer.`,
      time: 'Just now',
      read: false,
    });
  }, [selectedProject, projectMilestones, addNotification]);

  const disputeMilestone = useCallback((index: number) => {
    setProjectMilestones(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'REVISION' };
      return next;
    });
  }, []);

  // ── Skeleton loading state ─────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 1400); return () => clearTimeout(t); }, []);

  return {
    // Auth
    user, theme, toggleTheme, handleLogout, updateUserProfile,
    // Data
    allEngineers, clientProjects, stats,
    // Wallet
    walletBalance, addFunds,
    // Engineers
    favoriteEngineers, favLoaded, toggleFavorite,
    // Projects
    selectedProject, projectMilestones,
    selectProject, releaseMilestone, disputeMilestone,
    // UX
    isLoading,
  };
}
