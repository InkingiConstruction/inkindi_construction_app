/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : index.tsx
 * WHAT THIS FILE DOES : Main Operations Hub Tab rendering role-tailored workspaces
 * HOW IT DOES IT      : Reads logged-in user profile from AuthContext and loads respective components
 * DATA SOURCE         : AuthContext profile parameters
 * DATA DESTINATION    : ClientDashboard, EngineerDashboard, SupervisorDashboard, SupplierDashboard
 * PRINCIPLE APPLIED   : SOLID (Workspace routing isolation)
 * ============================================================================
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ClientDashboard from '@/features/dashboard/ClientDashboard';
import EngineerDashboard from '@/features/dashboard/EngineerDashboard';
import SupervisorDashboard from '@/features/dashboard/SupervisorDashboard';
import SupplierDashboard from '@/features/dashboard/SupplierDashboard';

/**
 * ============================================================================
 * 🔧 FUNCTION: HomeScreen
 * ============================================================================
 * WHAT IT DOES: Checks session details and routes rendering to specified developer workspace
 * PARAMETERS: None
 * RETURNS: JSX.Element - Active role dashboard page
 * WHO CALLS IT: App layout tab trigger
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export default function HomeScreen() {
  const { user } = useAuth();

  /**
   * 🧱 CODE BLOCK: Role-Based Dashboard Workspace Routing
   * WHAT IT IS DOING: Dynamically matches active logged in user profile with specific operations desk
   * WHY IT IS HERE  : Separation of concerns (SOLID) for diverse platform users
   * PRINCIPLE       : SOLID
   */
  if (user?.role === 'CLIENT') {
    return <ClientDashboard />;
  }

  if (user?.role === 'ENGINEER') {
    return <EngineerDashboard />;
  }

  if (user?.role === 'SUPERVISOR') {
    return <SupervisorDashboard />;
  }

  if (user?.role === 'SUPPLIER') {
    return <SupplierDashboard />;
  }

  return <ClientDashboard />;
}
