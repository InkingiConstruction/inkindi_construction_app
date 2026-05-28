import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { authClient } from "../lib/auth-client";
import { apiGet, apiPatch, apiPost } from "../lib/api";
import type { MockProject, MockRFQ, MockUser } from "../data/mockAdminService";

export type UserRole = "CLIENT" | "ENGINEER" | "SUPERVISOR" | "SUPPLIER";

export type AuthStep =
  | "landing"
  | "login"
  | "register"
  | "forgot-password"
  | "verify-email"
  | "verify-phone"
  | "kyc-upload"
  | "kyc-pending"
  | "dashboard";

interface BackendUser {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  displayUsername?: string | null;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
  emailVerified?: boolean;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  kycStatus?: string | null;
  kycRejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendProject {
  id: string;
  name?: string;
  title?: string;
  client?: { name?: string };
  engineer?: { name?: string } | null;
  projectMembers?: Array<{ role?: string; user?: { name?: string } }>;
  address?: string | null;
  budget?: string | number | null;
  escrowAccount?: { balance?: string | number | null } | null;
  status?: string | null;
  milestones?: Array<{ name?: string; title?: string; progress?: number; status?: string }>;
}

interface BackendRfq {
  id: string;
  project?: { name?: string } | null;
  title?: string;
  quantity?: string | number;
  unit?: string;
  status?: string;
  quotes?: unknown[];
}

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
  theme: "light" | "dark";
  setStep: (step: AuthStep) => void;
  setRole: (role: UserRole | null) => void;
  handleRegister: (name: string, email: string, phone: string, pass: string) => Promise<void>;
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
  handleAdminSimulateDecision: (decision: "APPROVE" | "REJECT", reason?: string) => void;
  handleLogout: () => Promise<void>;
  toggleTheme: () => void;
  updateUserProfile: (updates: Partial<MockUser>) => void;
  refreshAppData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleToBackend = (role: UserRole | null) => (role || "CLIENT").toLowerCase();

const roleFromBackend = (role?: string | null): UserRole => {
  const normalized = String(role || "client").toUpperCase();
  if (["CLIENT", "ENGINEER", "SUPERVISOR", "SUPPLIER"].includes(normalized)) {
    return normalized as UserRole;
  }
  return "CLIENT";
};

const kycFromBackend = (status?: string | null): MockUser["kycStatus"] => {
  const normalized = String(status || "not_submitted").toLowerCase();
  if (["approved"].includes(normalized)) return "APPROVED";
  if (["submitted", "under_review", "additional_info_requested"].includes(normalized)) return "SUBMITTED";
  if (["rejected"].includes(normalized)) return "REJECTED";
  return "PENDING";
};

const userFromBackend = (backendUser: BackendUser): MockUser => {
  const role = roleFromBackend(backendUser.role);
  return {
    id: backendUser.id,
    name: backendUser.name || backendUser.email,
    email: backendUser.email,
    username: backendUser.username || backendUser.displayUsername || backendUser.email.split("@")[0],
    phone: backendUser.phoneNumber || "",
    role,
    status: backendUser.banned ? "SUSPENDED" : backendUser.kycStatus === "approved" ? "ACTIVE" : "UNDER_REVIEW",
    kycStatus: kycFromBackend(backendUser.kycStatus),
    kycRejectionReason: backendUser.kycRejectionReason || undefined,
    createdAt: backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updatedAt || new Date().toISOString(),
    profilePic:
      backendUser.image ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    jwtToken: "better-auth-cookie-session",
  };
};

const numberValue = (value: unknown) => Number(value || 0);

const mapProject = (project: BackendProject): MockProject => ({
  id: project.id,
  name: project.name || project.title || "Untitled project",
  client: project.client?.name || "Unknown client",
  engineer: project.engineer?.name || "Unassigned",
  supervisor:
    project.projectMembers?.find((member) => member.role === "supervisor")?.user?.name ||
    "Unassigned",
  location: project.address || "Not set",
  budget: numberValue(project.budget),
  escrowBalance: numberValue(project.escrowAccount?.balance),
  progress: project.milestones?.length
    ? Math.round(
        project.milestones.reduce((total, milestone) => total + numberValue(milestone.progress), 0) /
          project.milestones.length,
      )
    : 0,
  status: String(project.status || "DRAFT").toUpperCase() as MockProject["status"],
  milestones:
    project.milestones?.map((milestone) => ({
      name: milestone.name || milestone.title || "Milestone",
      pct: numberValue(milestone.progress),
      status:
        String(milestone.status || "").toLowerCase() === "paid"
          ? "PAID"
          : String(milestone.status || "").toLowerCase().includes("revision")
            ? "REVISION"
            : "PENDING",
    })) || [],
});

const mapRfq = (rfq: BackendRfq): MockRFQ => ({
  id: rfq.id,
  project: rfq.project?.name || "Unknown project",
  material: rfq.title || "Materials",
  quantity: `${rfq.quantity || 0} ${rfq.unit || ""}`.trim(),
  status: String(rfq.status || "open").toUpperCase() === "AWARDED" ? "AWARDED" : "OPEN",
  quotes: rfq.quotes?.length || 0,
});

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<AuthStep>("landing");
  const [role, setRole] = useState<UserRole | null>(null);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [rfqs, setRfqs] = useState<MockRFQ[]>([]);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const mockUsers = useMemo(() => (user ? [user] : []), [user]);

  const loadBackendData = useCallback(async () => {
    const [projectData, rfqData] = await Promise.allSettled([
      apiGet<BackendProject[]>("/projects"),
      apiGet<BackendRfq[]>("/rfqs"),
    ]);

    if (projectData.status === "fulfilled") {
      setProjects(Array.isArray(projectData.value) ? projectData.value.map(mapProject) : []);
    }

    if (rfqData.status === "fulfilled") {
      setRfqs(Array.isArray(rfqData.value) ? rfqData.value.map(mapRfq) : []);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await authClient.getSession();
    const backendUser = session.data?.user as BackendUser | undefined;

    if (!backendUser) {
      setIsLoggedIn(false);
      setUser(null);
      setStep("landing");
      return null;
    }

    let fullUser = backendUser;

    try {
      fullUser = await apiGet<BackendUser>("/kyc/status");
    } catch {
      // Keep Better Auth session user if the KYC endpoint is unavailable.
    }

    const mappedUser = userFromBackend(fullUser);
    setUser(mappedUser);
    setEmail(mappedUser.email);
    setPhone(mappedUser.phone);
    setRole(mappedUser.role);

    if (mappedUser.kycStatus === "APPROVED") {
      setIsLoggedIn(true);
      setStep("dashboard");
      await loadBackendData();
    } else {
      setIsLoggedIn(false);
      setStep(mappedUser.kycStatus === "SUBMITTED" ? "kyc-pending" : "kyc-upload");
    }

    return mappedUser;
  }, [loadBackendData]);

  useEffect(() => {
    refreshSession().catch(() => {
      setIsLoggedIn(false);
      setStep("landing");
    });
  }, [refreshSession]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const updateUserProfile = (updates: Partial<MockUser>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  };

  const handleRegister = async (name: string, regEmail: string, regPhone: string, pass: string) => {
    const response = await authClient.signUp.email({
      name,
      email: regEmail.trim().toLowerCase(),
      password: pass,
    });

    if (response.error) {
      throw new Error(response.error.message || "Registration failed");
    }

    await apiPost("/auth/update-user", {
      phoneNumber: regPhone,
      username: regEmail.split("@")[0],
      displayUsername: regEmail.split("@")[0],
    });
    await apiPatch("/users/me/role", { role: roleToBackend(role) });
    await (authClient as any).emailOtp.sendVerificationOtp({
      email: regEmail.trim().toLowerCase(),
      type: "email-verification",
    });

    setEmail(regEmail);
    setPhone(regPhone);
    setOtpCode("");
    setStep("verify-email");
  };

  const handleLogin = async (loginEmail: string, pass: string) => {
    const response = await authClient.signIn.email({
      email: loginEmail.trim().toLowerCase(),
      password: pass,
    });

    if (response.error) return false;

    await refreshSession();
    return true;
  };

  const handleResendOTP = () => {
    if (step === "verify-phone" && phone) {
      (authClient as any).phoneNumber.sendOtp({ phoneNumber: phone }).catch(() => undefined);
      return;
    }

    if (email) {
      (authClient as any).emailOtp
        .sendVerificationOtp({ email, type: "email-verification" })
        .catch(() => undefined);
    }
  };

  const handleVerifyEmail = async (otp: string) => {
    const response = await (authClient as any).emailOtp.verifyEmail({
      email,
      otp,
    });

    if (response.error) return false;

    setOtpVerified(true);

    if (phone) {
      await (authClient as any).phoneNumber.sendOtp({ phoneNumber: phone });
      setStep("verify-phone");
    } else {
      setStep("kyc-upload");
    }

    return true;
  };

  const handleVerifyPhone = async (otp: string) => {
    const response = await (authClient as any).phoneNumber.verify({
      phoneNumber: phone,
      code: otp,
      updatePhoneNumber: true,
    });

    if (response.error) return false;

    setOtpVerified(true);
    await refreshSession();
    setStep("kyc-upload");
    return true;
  };

  const handleUploadKYC = async (docs: {
    idCard: string;
    license?: string;
    insurance?: string;
    bizReg?: string;
    taxCert?: string;
  }) => {
    const uploads = [
      { type: "national_id", uri: docs.idCard },
      { type: "ier_license", uri: docs.license },
      { type: "indemnity_insurance", uri: docs.insurance },
      { type: "business_registration", uri: docs.bizReg },
      { type: "tax_compliance", uri: docs.taxCert },
    ].filter((item) => item.uri);

    for (const upload of uploads) {
      await apiPost("/kyc/documents", {
        type: upload.type,
        cloudinaryUrl: upload.uri,
        publicId: `mobile-${upload.type}-${Date.now()}`,
      });
    }

    await refreshSession();
    setStep("kyc-pending");
  };

  const handleAdminSimulateDecision = (decision: "APPROVE" | "REJECT", reason?: string) => {
    setUser((current) => {
      if (!current) return current;
      const updated = {
        ...current,
        kycStatus: decision === "APPROVE" ? "APPROVED" : "REJECTED",
        kycRejectionReason: decision === "REJECT" ? reason || "Documents rejected" : undefined,
      } as MockUser;

      if (decision === "APPROVE") {
        setIsLoggedIn(true);
        setStep("dashboard");
      } else {
        setStep("kyc-upload");
      }

      return updated;
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setEmail("");
    setPhone("");
    setRole(null);
    setProjects([]);
    setRfqs([]);
    setStep("landing");
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
        refreshAppData: loadBackendData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }

  return context;
}
