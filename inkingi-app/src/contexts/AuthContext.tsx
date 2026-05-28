/**
 * ============================================================================
 * 📄 AuthContext.tsx (CLEAN VERSION)
 * ============================================================================
 */

import React, { createContext, useState, useContext, ReactNode } from 'react';
import {
  MockUser,
  INITIAL_MOCK_USERS,
  MockProject,
  MOCK_PROJECTS,
  MockRFQ,
  MOCK_RFQS,
} from '../data/mockAdminService';

/** ===================== TYPES ===================== */

export type UserRole =
  | 'CLIENT'
  | 'ENGINEER'
  | 'SUPERVISOR'
  | 'SUPPLIER';

export type AuthStep =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-email'
  | 'verify-phone'
  | 'kyc-upload'
  | 'kyc-pending'
  | 'dashboard';

interface AuthContextType {
  isLoggedIn: boolean;
  user: MockUser | null;
  email: string;
  phone: string;
  step: AuthStep;
  role: UserRole | null;

  mockUsers: MockUser[];
  projects: MockProject[];
  rfqs: MockRFQ[];

  otpCode: string;
  otpVerified: boolean;

  theme: 'light' | 'dark';

  setStep: (step: AuthStep) => void;
  setRole: (role: UserRole | null) => void;

  handleRegister: (
    name: string,
    email: string,
    phone: string,
    pass: string
  ) => Promise<void>;

  handleLogin: (email: string, pass: string) => Promise<boolean>;
  handleResendOTP: () => void;
  handleVerifyEmail: (otp: string) => Promise<boolean>;
  handleVerifyPhone: (otp: string) => Promise<boolean>;

  handleUploadKYC: (docs: {
    idCard: string;
    license?: string;
    insurance?: string;
    bizReg?: string;
    taxCert?: string;
  }) => Promise<void>;

  handleAdminSimulateDecision: (
    decision: 'APPROVE' | 'REJECT',
    reason?: string
  ) => void;

  handleLogout: () => void;
  toggleTheme: () => void;
  updateUserProfile: (updates: Partial<MockUser>) => void;
}

/** ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** ===================== PROVIDER ===================== */

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [step, setStepState] = useState<AuthStep>('landing');
  const setStep = (s: AuthStep) => setStepState(s);

  const [role, setRole] = useState<UserRole | null>(null);

  const [mockUsers, setMockUsers] = useState<MockUser[]>(
    INITIAL_MOCK_USERS
  );
  const [projects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [rfqs] = useState<MockRFQ[]>(MOCK_RFQS);

  const [otpCode, setOtpCode] = useState('123456');
  const [otpVerified] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  /** ===================== HELPERS ===================== */

  const toggleTheme = () => {
    setTheme((p) => (p === 'light' ? 'dark' : 'light'));
  };

  const updateUserProfile = (updates: Partial<MockUser>) => {
    if (!user) return;

    const updated = { ...user, ...updates };
    setUser(updated);

    setMockUsers((prev) =>
      prev.map((u) => (u.id === user.id ? updated : u))
    );
  };

  /** ===================== AUTH LOGIC ===================== */

  const handleRegister = async (
    name: string,
    regEmail: string,
    regPhone: string,
    pass: string
  ) => {
    await new Promise((r) => setTimeout(r, 800));

    const safeRole: UserRole = role ?? 'CLIENT';

    const newUser: MockUser = {
      id: `usr-${safeRole.toLowerCase()}-${Date.now()
        .toString()
        .slice(-4)}`,
      name,
      email: regEmail,
      username: regEmail.split('@')[0],
      phone: regPhone,
      role: safeRole,
      status: 'UNDER_REVIEW',
      kycStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: pass,
      profilePic:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      jwtToken: 'mock-token',
      sessionSample: {
        sessionId: `sess-${Date.now()}`,
        deviceName: 'Android Device',
        ipAddress: '127.0.0.1',
        location: 'Kigali, Rwanda',
        loginTime: new Date().toISOString(),
      },
    };

    setMockUsers((p) => [...p, newUser]);
    setUser(newUser);
    setEmail(regEmail);
    setPhone(regPhone);
    setOtpCode('123456');
    // Registration flow: upload docs first, then OTP verification.
    setStep('kyc-upload');
  };

  const handleLogin = async (
    loginEmail: string,
    pass: string
  ): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));

    const found = mockUsers.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.toLowerCase() &&
        u.password === pass
    );
    // Login bypass: allow access even when credentials are invalid
    // and always route to the Client dashboard.
    const fallbackClient = mockUsers.find((u) => u.role === 'CLIENT');
    const bypassUser: MockUser = found
      ? {
          ...found,
          role: 'CLIENT',
          kycStatus: 'APPROVED',
          status: 'APPROVED',
        }
      : fallbackClient
        ? {
            ...fallbackClient,
            kycStatus: 'APPROVED',
            status: 'APPROVED',
          }
        : {
            id: `usr-client-bypass-${Date.now().toString().slice(-4)}`,
            name: 'Client User',
            email: loginEmail || 'client@inkingi.app',
            username: (loginEmail || 'client').split('@')[0],
            phone: '0780000000',
            role: 'CLIENT',
            status: 'APPROVED',
            kycStatus: 'APPROVED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            password: pass || 'password123',
            profilePic:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
            jwtToken: 'mock-token',
            sessionSample: {
              sessionId: `sess-${Date.now()}`,
              deviceName: 'Android Device',
              ipAddress: '127.0.0.1',
              location: 'Kigali, Rwanda',
              loginTime: new Date().toISOString(),
            },
          };

    setUser(bypassUser);
    setEmail(bypassUser.email);
    setPhone(bypassUser.phone);
    setRole('CLIENT');
    setOtpCode('123456');
    setIsLoggedIn(true);
    setStep('dashboard');

    return true;
  };

  const handleResendOTP = () => setOtpCode('123456');

  const handleVerifyEmail = async (otp: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (otp === otpCode) {
      setStep('verify-phone');
      return true;
    }
    return false;
  };

  const handleVerifyPhone = async (otp: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (otp === otpCode) {
      // After phone verification, send user to login.
      setStep('login');
      return true;
    }
    return false;
  };

  const handleUploadKYC = async (docs: {
    idCard: string;
    license?: string;
    insurance?: string;
    bizReg?: string;
    taxCert?: string;
  }) => {
    await new Promise((r) => setTimeout(r, 1000));

    if (!user) return;

    const updated: MockUser = {
      ...user,
      kycStatus: 'SUBMITTED',
      licenseNumber: docs.license ?? user.licenseNumber,
      insuranceAmount: docs.insurance
        ? '10,000,000 RWF'
        : user.insuranceAmount,
      businessRegNumber: docs.bizReg ?? user.businessRegNumber,
      taxCertNumber: docs.taxCert ?? user.taxCertNumber,
      updatedAt: new Date().toISOString(),
    };

    setUser(updated);
    setMockUsers((p) =>
      p.map((u) => (u.id === user.id ? updated : u))
    );

    setStep('kyc-pending');
  };

  const handleAdminSimulateDecision = (
    decision: 'APPROVE' | 'REJECT',
    reason?: string
  ) => {
    if (!user) return;

    const updated: MockUser = {
      ...user,
      kycStatus:
        decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      kycRejectionReason:
        decision === 'REJECT'
          ? reason || 'Invalid documents'
          : undefined,
      updatedAt: new Date().toISOString(),
    };

    setUser(updated);
    setMockUsers((p) =>
      p.map((u) => (u.id === user.id ? updated : u))
    );

    if (decision === 'APPROVE') {
      setIsLoggedIn(true);
      setStep('dashboard');
    } else {
      setStep('kyc-upload');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setEmail('');
    setPhone('');
    setRole(null);
    setStep('landing');
  };

  /** ===================== PROVIDER ===================== */

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        email,
        phone,
        step,
        role,

        mockUsers,
        projects,
        rfqs,

        otpCode,
        otpVerified,

        theme,

        setStep,
        setRole,

        handleRegister,
        handleLogin,
        handleResendOTP,
        handleVerifyEmail,
        handleVerifyPhone,
        handleUploadKYC,
        handleAdminSimulateDecision,
        handleLogout,
        toggleTheme,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** ===================== HOOK ===================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }

  return context;
}