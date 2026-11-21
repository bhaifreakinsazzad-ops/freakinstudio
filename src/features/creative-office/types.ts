export type CreativeOfficeRoute =
  | "home"
  | "tools"
  | "services"
  | "kits"
  | "works"
  | "start"
  | "office"
  | "studio";

export type LangCode = "en" | "bn";

export interface BriefPrefill {
  topic?: string;
  serviceId?: string;
  variantLabel?: string;
  addons?: string[];
  scopedHours?: number;
}

export interface ParsedIntent {
  detectedDiscipline: string;
  expressCandidate: boolean;
  freeToolRec: string;
  aiKitRec: string;
  humanServiceRec: string;
}

export interface DemoAnnotation {
  id: string;
  x: number;
  y: number;
  author: string;
  text: string;
}

export interface DemoSiProposal {
  id: string;
  task: string;
  summary: string;
  status: "suggested" | "approved" | "rejected";
  createdAt: string;
}

export interface DemoProjectEvent {
  id: string;
  actorKind: "human" | "si" | "system";
  actorName: string;
  timestamp: string;
  stateBefore: string;
  stateAfter: string;
  summary: string;
}

export interface DemoProject {
  id: string;
  title: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  variantLabel: string;
  scopedHours: number;
  addons: string[];
  expressRequested: boolean;
  expressEligible: boolean;
  status: string;
  assignedExpert: string;
  revisionsIncluded: number;
  revisionsUsed: number;
  proofVersion: string;
  proofNotes: string;
  annotations: DemoAnnotation[];
  siProposals: DemoSiProposal[];
  events: DemoProjectEvent[];
}

export interface CreateBriefPayload {
  title: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  variantLabel: string;
  scopedHours: number;
  addons: string[];
  expressRequested: boolean;
  expressEligible: boolean;
  notes: string;
}

export interface CreativeOfficeContextValue {
  projects: DemoProject[];
  aiEnabled: boolean;
  setAiEnabled: (val: boolean) => void;
  guestQuotaRemaining: number;
  consumeGuestQuota: () => void;
  dailyBudgetBdt: number;
  setDailyBudgetBdt: (val: number) => void;
  adminLogs: string[];
  addAdminLog: (msg: string) => void;
  resetDemoState: () => void;
  createProjectFromBrief: (payload: CreateBriefPayload) => string;
  adminIssueQuote: (projectId: string) => void;
  adminAssignExpert: (projectId: string, expertName: string) => void;
  adminAdvanceStage: (
    projectId: string,
    nextStatus: string,
    summaryText: string
  ) => void;
  adminGenerateSiProposal: (projectId: string) => void;
  adminDecideSiProposal: (
    projectId: string,
    proposalId: string,
    decision: "approved" | "rejected"
  ) => void;
  clientAcceptQuote: (projectId: string) => void;
  clientAddAnnotation: (
    projectId: string,
    x: number,
    y: number,
    text: string
  ) => void;
  clientRequestRevision: (projectId: string, summary: string) => void;
  clientApproveFinalVersion: (projectId: string) => void;
}
