/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AuthContext.tsx
 * WHAT THIS FILE DOES : Context provider managing application authentication and KYC status
 * HOW IT DOES IT      : Tracks logged-in user, credentials, and state machines for auth screens
 * DATA SOURCE         : Local state initialized by INITIAL_MOCK_USERS
 * DATA DESTINATION    : Consumer screens and views across the application
 * PRINCIPLE APPLIED   : SOLID (State encapsulation for auth business logic)
 * ============================================================================
 */

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MockUser, INITIAL_MOCK_USERS, MockProject, MOCK_PROJECTS, MockRFQ, MOCK_RFQS } from '../data/mockAdminService';

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
  role: 'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER';
  mockUsers: MockUser[];
  projects: MockProject[];
  rfqs: MockRFQ[];
  otpCode: string;
  otpVerified: boolean;
  setStep: (step: AuthStep) => void;
  setRole: (role: 'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER') => void;
  handleRegister: (name: string, email: string, phone: string, pass: string) => Promise<void>;
  handleLogin: (email: string, pass: string) => Promise<boolean>;
  handleResendOTP: () => void;
  handleVerifyEmail: (otp: string) => Promise<boolean>;
  handleVerifyPhone: (otp: string) => Promise<boolean>;
  handleUploadKYC: (docs: { idCard: string; license?: string; insurance?: string; bizReg?: string; taxCert?: string }) => Promise<void>;
  handleAdminSimulateDecision: (decision: 'APPROVE' | 'REJECT', reason?: string) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * ============================================================================
 * 🔧 FUNCTION: AuthContextProvider
 * ============================================================================
 * WHAT IT DOES: Wrapper component providing auth states to components
 * PARAMETERS:
 *   - children (ReactNode) : Decoupled child nodes
 * RETURNS: JSX.Element - context provider node
 * WHO CALLS IT: Root _layout.tsx
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [step, setStepState] = useState<AuthStep>('landing');
  const [role, setRole] = useState<'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER'>('CLIENT');
  const [mockUsers, setMockUsers] = useState<MockUser[]>(INITIAL_MOCK_USERS);
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [rfqs, setRFQs] = useState<MockRFQ[]>(MOCK_RFQS);
  const [otpCode, setOtpCode] = useState<string>('123456');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  const setStep = (newStep: AuthStep) => {
    setStepState(newStep);
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleRegister
   * ============================================================================
   * WHAT IT DOES: Creates a new user in the mock list and triggers OTP validation step
   * PARAMETERS:
   *   - name (string) : Full user name
   *   - email (string) : Registration email
   *   - phone (string) : Verification phone number
   *   - pass (string) : Selected account password
   * RETURNS: Promise<void>
   * WHO CALLS IT: RegisterScreen
   * PRINCIPLE: SOLID
   * ============================================================================
   */
  const handleRegister = async (name: string, regEmail: string, regPhone: string, pass: string) => {
    /**
     * 🧱 CODE BLOCK: User registration simulation
     * WHAT IT IS DOING: Simulates database write by pushing new user with pending statuses
     * WHY IT IS HERE  : Standardized registry to allow clean creation of profiles
     * PRINCIPLE       : KISS
     */
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: MockUser = {
      id: `usr-${role.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name,
      email: regEmail,
      username: regEmail.split('@')[0],
      phone: regPhone,
      role,
      status: 'UNDER_REVIEW',
      kycStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMockUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setEmail(regEmail);
    setPhone(regPhone);
    setOtpCode('123456'); // Static OTP for ease of simulation
    setStep('verify-email');
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleLogin
   * ============================================================================
   * WHAT IT DOES: Logs in existing mock user or redirects based on KYC state
   * PARAMETERS:
   *   - loginEmail (string) : User email
   *   - pass (string) : Plain password
   * RETURNS: Promise<boolean> - true if login match found
   * WHO CALLS IT: LoginScreen
   * PRINCIPLE: KISS
   * ============================================================================
   */
  const handleLogin = async (loginEmail: string, pass: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    
    if (foundUser) {
      setUser(foundUser);
      setEmail(foundUser.email);
      setPhone(foundUser.phone);
      setRole(foundUser.role as any);
      setOtpCode('123456');

      if (foundUser.kycStatus === 'PENDING') {
        setStep('verify-email');
      } else if (foundUser.kycStatus === 'SUBMITTED') {
        setStep('kyc-pending');
      } else if (foundUser.kycStatus === 'APPROVED') {
        setIsLoggedIn(true);
        setStep('dashboard');
      } else if (foundUser.kycStatus === 'REJECTED') {
        setStep('kyc-upload');
      }
      return true;
    }
    return false;
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleResendOTP
   * ============================================================================
   * WHAT IT DOES: Simulates resending OTP code to verified address
   * PARAMETERS: None
   * RETURNS: void
   * WHO CALLS IT: EmailVerificationScreen, PhoneVerificationScreen
   * PRINCIPLE: DRY
   * ============================================================================
   */
  const handleResendOTP = () => {
    setOtpCode('123456');
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleVerifyEmail
   * ============================================================================
   * WHAT IT DOES: Simulates verification of 6-digit email OTP
   * PARAMETERS:
   *   - otp (string) : User inputted code
   * RETURNS: Promise<boolean> - true if matched
   * WHO CALLS IT: EmailVerificationScreen
   * PRINCIPLE: KISS
   * ============================================================================
   */
  const handleVerifyEmail = async (otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (otp === otpCode) {
      setStep('verify-phone');
      return true;
    }
    return false;
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleVerifyPhone
   * ============================================================================
   * WHAT IT DOES: Simulates phone OTP confirmation and proceeds to KYC upload
   * PARAMETERS:
   *   - otp (string) : 6 digit SMS OTP code
   * RETURNS: Promise<boolean> - true if match found
   * WHO CALLS IT: PhoneVerificationScreen
   * PRINCIPLE: KISS
   * ============================================================================
   */
  const handleVerifyPhone = async (otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (otp === otpCode) {
      setStep('kyc-upload');
      return true;
    }
    return false;
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleUploadKYC
   * ============================================================================
   * WHAT IT DOES: Receives user documents and changes status to pending review
   * PARAMETERS:
   *   - docs (object) : Form values of uploaded items
   * RETURNS: Promise<void>
   * WHO CALLS IT: KYCUploadScreen
   * PRINCIPLE: SOLID
   * ============================================================================
   */
  const handleUploadKYC = async (docs: { idCard: string; license?: string; insurance?: string; bizReg?: string; taxCert?: string }) => {
    /**
     * 🧱 CODE BLOCK: KYC upload transaction simulator
     * WHAT IT IS DOING: Updates the user details with simulated fields matching their documents
     * WHY IT IS HERE  : Moves the registration lifecycle to verification review stage
     * PRINCIPLE       : SOLID
     */
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (user) {
      const updatedUser: MockUser = {
        ...user,
        kycStatus: 'SUBMITTED',
        licenseNumber: docs.license || user.licenseNumber,
        insuranceAmount: docs.insurance ? '10,000,000 RWF' : user.insuranceAmount,
        businessRegNumber: docs.bizReg || user.businessRegNumber,
        taxCertNumber: docs.taxCert || user.taxCertNumber,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      setMockUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setStep('kyc-pending');
    }
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleAdminSimulateDecision
   * ============================================================================
   * WHAT IT DOES: Simulates an Administrator approving or rejecting the user's KYC submission
   * PARAMETERS:
   *   - decision (string) : APPROVE or REJECT
   *   - reason (string) : explanation for rejection
   * RETURNS: void
   * WHO CALLS IT: KYCReviewOverlay / Mock Admin Buttons
   * PRINCIPLE: KISS
   * ============================================================================
   */
  const handleAdminSimulateDecision = (decision: 'APPROVE' | 'REJECT', reason?: string) => {
    if (user) {
      const updatedStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const updatedUser: MockUser = {
        ...user,
        kycStatus: updatedStatus,
        kycRejectionReason: decision === 'REJECT' ? (reason || 'Certificates blurry or unreadable.') : undefined,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      setMockUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      
      if (decision === 'APPROVE') {
        setIsLoggedIn(true);
        setStep('dashboard');
      } else {
        setStep('kyc-upload');
      }
    }
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: handleLogout
   * ============================================================================
   * WHAT IT DOES: Resets the state machine back to the landing screen
   * PARAMETERS: None
   * RETURNS: void
   * WHO CALLS IT: Dashboards
   * PRINCIPLE: SOLID
   * ============================================================================
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setEmail('');
    setPhone('');
    setStep('landing');
  };

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
        setStep,
        setRole,
        handleRegister,
        handleLogin,
        handleResendOTP,
        handleVerifyEmail,
        handleVerifyPhone,
        handleUploadKYC,
        handleAdminSimulateDecision,
        handleLogout
      }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ============================================================================
 * 🔧 FUNCTION: useAuth
 * ============================================================================
 * WHAT IT DOES: Custom React hook to simplify reading auth states
 * PARAMETERS: None
 * RETURNS: AuthContextType - complete authentication payload
 * WHO CALLS IT: Screens requiring user contexts
 * PRINCIPLE: DRY
 * ============================================================================
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
