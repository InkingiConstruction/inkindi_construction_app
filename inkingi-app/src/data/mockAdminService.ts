/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : mockAdminService.ts
 * WHAT THIS FILE DOES : Provides local mock data and simulation functions for Auth & KYC
 * HOW IT DOES IT      : Embedded static copies of users, KYC documents, and projects for role-based flows
 * DATA SOURCE         : Local memory objects mimicking the database
 * DATA DESTINATION    : Context layers and screen components
 * PRINCIPLE APPLIED   : DRY (Centralized source of truth for mock data)
 * ============================================================================
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER';
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED';
  kycStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  licenseNumber?: string;
  insuranceAmount?: string;
  businessRegNumber?: string;
  taxCertNumber?: string;
  kycRejectionReason?: string;
  password?: string;
  profilePic?: string;
  jwtToken?: string;
  sessionSample?: {
    sessionId: string;
    deviceName: string;
    ipAddress: string;
    location: string;
    loginTime: string;
  };
}

/**
 * 🧱 CODE BLOCK: Static Mock Users Database
 * WHAT IT IS DOING: Holds initial state of verified/unverified users for role simulation
 * WHY IT IS HERE  : Allows developers to test and switch between distinct roles and KYC statuses
 * PRINCIPLE       : KISS (Simple inline array of objects)
 */
export const INITIAL_MOCK_USERS: MockUser[] = [
  {
    id: "usr-client-001",
    name: "Grace Uwase",
    email: "grace.uwase@example.com",
    username: "grace_diaspora",
    phone: "+33612004001",
    role: "CLIENT",
    status: "ACTIVE",
    kycStatus: "PENDING",
    createdAt: "2026-05-10T09:15:00.000Z",
    updatedAt: "2026-05-23T12:30:00.000Z",
    password: "password123",
    profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzci1jbGllbnQtMDAxIiwicm9sZSI6IkNMSUVOVCIsIm5hbWUiOiJHcmFjZSBVd2FzZSJ9.mock_sig_grace_123",
    sessionSample: {
      sessionId: "sess-grace-9941",
      deviceName: "iPhone 15 Pro",
      ipAddress: "193.251.22.45",
      location: "Paris, France",
      loginTime: "2026-05-25T14:20:00.000Z"
    }
  },
  {
    id: "usr-engineer-001",
    name: "Eric Ndayisaba",
    email: "eric.ndayisaba@example.com",
    username: "eric_engineer",
    phone: "+250788430010",
    role: "ENGINEER",
    status: "ACTIVE",
    kycStatus: "APPROVED",
    createdAt: "2026-05-08T10:45:00.000Z",
    updatedAt: "2026-05-24T13:00:00.000Z",
    licenseNumber: "IER-2026-8942",
    insuranceAmount: "15,000,000 RWF",
    password: "password123",
    profilePic: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80",
    jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzci1lbmdpbmVlci0wMDEiLCJyb2xlIjoiRU5HSU5FRVIiLCJuYW1lIjoiRXJpYyBOZGF5aXNhYmEifQ.mock_sig_eric_456",
    sessionSample: {
      sessionId: "sess-eric-8832",
      deviceName: "MacBook Pro",
      ipAddress: "197.243.12.85",
      location: "Kigali, Rwanda",
      loginTime: "2026-05-25T15:10:00.000Z"
    }
  },
  {
    id: "usr-supervisor-001",
    name: "Aline Mukamana",
    email: "aline.mukamana@example.com",
    username: "aline_supervisor",
    phone: "+250788430011",
    role: "SUPERVISOR",
    status: "ACTIVE",
    kycStatus: "APPROVED",
    createdAt: "2026-05-09T11:30:00.000Z",
    updatedAt: "2026-05-24T13:00:00.000Z",
    licenseNumber: "SUP-QC-4019",
    insuranceAmount: "10,000,000 RWF",
    password: "password123",
    profilePic: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzci1zdXBlcnZpc29yLTAwMSIsInJvbGUiOiJTVVBFUlZJU09SIiwibmFtZSI6IkFsaW5lIE11a2FtYW5hIn9.mock_sig_aline_789",
    sessionSample: {
      sessionId: "sess-aline-7712",
      deviceName: "Samsung Galaxy S24 Ultra",
      ipAddress: "197.243.2.14",
      location: "Musanze, Rwanda",
      loginTime: "2026-05-25T13:45:00.000Z"
    }
  },
  {
    id: "usr-supplier-001",
    name: "Kigali Steel Depot",
    email: "sales@kigalisteel.rw",
    username: "kigali_steel",
    phone: "+250788430012",
    role: "SUPPLIER",
    status: "UNDER_REVIEW",
    kycStatus: "PENDING",
    createdAt: "2026-05-12T15:15:00.000Z",
    updatedAt: "2026-05-24T13:00:00.000Z",
    businessRegNumber: "GST-RDB-88124",
    taxCertNumber: "RRA-TAX-99421",
    password: "password123",
    profilePic: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&h=200&q=80",
    jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzci1zdXBwbGllci0wMDEiLCJyb2xlIjoiU1VQUExJRVIiLCJuYW1lIjoiS2lnYWxpIFN0ZWVsIERlcG90In9.mock_sig_supplier_987",
    sessionSample: {
      sessionId: "sess-supplier-4421",
      deviceName: "Lenovo ThinkPad",
      ipAddress: "197.243.4.99",
      location: "Kigali, Rwanda",
      loginTime: "2026-05-25T11:00:00.000Z"
    }
  },
  {
    id: "usr-client-002",
    name: "Patrick Habimana",
    email: "patrick.habimana@example.com",
    username: "patrick_london",
    phone: "+447700900120",
    role: "CLIENT",
    status: "ACTIVE",
    kycStatus: "APPROVED",
    createdAt: "2026-05-14T15:15:00.000Z",
    updatedAt: "2026-05-24T13:00:00.000Z",
    password: "password123",
    profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzci1jbGllbnQtMDAyIiwicm9sZSI6IkNMSUVOVCIsIm5hbWUiOiJQYXRyaWNrIEhhYmltYW5hIn9.mock_sig_patrick_321",
    sessionSample: {
      sessionId: "sess-patrick-1102",
      deviceName: "iPad Pro",
      ipAddress: "82.165.234.12",
      location: "London, United Kingdom",
      loginTime: "2026-05-25T09:30:00.000Z"
    }
  }
];

export interface MockProject {
  id: string;
  name: string;
  client: string;
  engineer: string;
  supervisor: string;
  location: string;
  budget: number;
  escrowBalance: number;
  progress: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'MILESTONE_REVIEW' | 'COMPLETED';
  milestones: { name: string; pct: number; status: 'PAID' | 'PENDING' | 'REVISION' }[];
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: "prj-001",
    name: "Kicukiro Family Home",
    client: "Grace Uwase",
    engineer: "Eric Ndayisaba",
    supervisor: "Aline Mukamana",
    location: "Kicukiro, Kigali",
    budget: 82000000,
    escrowBalance: 40500000,
    progress: 42,
    status: "IN_PROGRESS",
    milestones: [
      { name: "Site Preparation", pct: 10, status: "PAID" },
      { name: "Foundation and Pillars", pct: 25, status: "PAID" },
      { name: "Framing & Masonry", pct: 30, status: "PENDING" },
      { name: "Roofing & Ceiling", pct: 20, status: "PENDING" },
      { name: "Plastering & Finishes", pct: 15, status: "PENDING" }
    ]
  },
  {
    id: "prj-002",
    name: "Musanze Rental Units",
    client: "Patrick Habimana",
    engineer: "Eric Ndayisaba",
    supervisor: "Aline Mukamana",
    location: "Musanze, Northern Province",
    budget: 125000000,
    escrowBalance: 25000000,
    progress: 18,
    status: "MILESTONE_REVIEW",
    milestones: [
      { name: "Excavation and Backfill", pct: 15, status: "PAID" },
      { name: "Substructure Concrete", pct: 20, status: "PENDING" },
      { name: "Wall Construction", pct: 25, status: "PENDING" }
    ]
  }
];

export interface MockRFQ {
  id: string;
  project: string;
  material: string;
  quantity: string;
  status: 'OPEN' | 'AWARDED';
  quotes: number;
}

export const MOCK_RFQS: MockRFQ[] = [
  {
    id: "rfq-001",
    project: "Kicukiro Family Home",
    material: "Reinforced Steel Bars (12mm)",
    quantity: "250 Bars",
    status: "OPEN",
    quotes: 3
  },
  {
    id: "rfq-002",
    project: "Musanze Rental Units",
    material: "Pre-painted Roofing Sheets",
    quantity: "120 Sheets",
    status: "AWARDED",
    quotes: 2
  }
];

/**
 * ============================================================================
 * 🔧 FUNCTION: simulateExternalRegistryCheck
 * ============================================================================
 * WHAT IT DOES: Simulates checking professional bodies (e.g. IER registry for engineers)
 * PARAMETERS:
 *   - licenseNumber (string) : License ID to check
 * RETURNS: Promise<boolean> - True if valid, false otherwise
 * WHO CALLS IT: KYCUploadScreen
 * PRINCIPLE: SOLID (Decoupled check logic)
 * ============================================================================
 */
export async function simulateExternalRegistryCheck(licenseNumber: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return licenseNumber.toUpperCase().startsWith("IER-2026-");
}
