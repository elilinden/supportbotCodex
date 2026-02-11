export type RelationshipCategory =
  | "Spouse"
  | "Former spouse"
  | "Parent of child in common"
  | "Family member (blood/marriage/adoption)"
  | "Intimate partner (dating)"
  | "Household member";

export type CohabitationStatus =
  | "Lives together now"
  | "Previously lived together"
  | "Never lived together";

export type ChildrenInvolvedStatus =
  | "Children involved"
  | "Children witnessed incidents"
  | "Children not involved"
  | "Unsure";

export type FirearmsAccess = "Yes" | "No" | "Unknown";

export type SafetyStatus = "Safe now" | "Unsafe" | "Immediate danger" | "Unsure";

export interface IntakeData {
  petitionerName: string;
  respondentName: string;
  relationshipCategory: RelationshipCategory | "";
  cohabitation: CohabitationStatus | "";
  mostRecentIncidentAt: string;
  patternOfIncidents: string;
  childrenInvolved: ChildrenInvolvedStatus | "";
  existingCasesOrders: string;
  firearmsAccess: FirearmsAccess | "";
  safetyStatus: SafetyStatus | "";
  incidentLocation: string;
  evidenceInventory: string;
  requestedRelief: string;
}

export interface Incident {
  date: string;
  time: string;
  location: string;
  whatHappened: string;
  injuries: string;
  threats: string;
  witnesses: string;
  evidence: string;
}

export interface Facts {
  parties: {
    petitioner: string;
    respondent: string;
  };
  relationship: string;
  incidents: Incident[];
  safetyConcerns: string[];
  requestedRelief: string[];
  evidenceList: string[];
  timeline: string[];
}

export interface CaseOutputs {
  script2Min: string;
  outline5Min: string[];
  evidenceChecklist: string[];
  timelineSummary: string[];
  whatToBring: string[];
  whatToExpect: string[];
}

export interface AssumptionsAndUncertainties {
  assumptions: string[];
  uncertainties: string[];
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface CaseFile {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "intake" | "interview" | "active";
  turnCount: number;
  intake: IntakeData;
  facts: Facts;
  outputs: CaseOutputs;
  assumptions: string[];
  uncertainties: string[];
  messages: CoachMessage[];
  safety: {
    immediateDanger: boolean;
    notes: string;
    flags: string[];
  };
}
