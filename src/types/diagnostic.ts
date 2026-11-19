export type StrugglePath = 'billing' | 'clinical' | 'other';

export interface DiagnosticAnswers {
  strugglePath: StrugglePath;
  // Path 1: Billing & RCM (5 questions)
  billingSetup?: string;
  monthlyClaimVolume?: string;
  currentDenialRate?: string;
  arDays?: string;
  clearinghouseRework?: string;
  // Path 2: Clinical & Admin (5 questions)
  providerCount?: string;
  priorAuthWeeklyHours?: string;
  priorAuthTurnaround?: string;
  dailyChartingHours?: string;
  icdCodingBottleneck?: string;
  // Path 3: Other / General Workflow (4 questions)
  practiceSize?: string;
  workflowSetup?: string;
  primaryFrictionArea?: string;
  weeklyAdminOverhead?: string;
}

export type AnswerFieldKey = Exclude<keyof DiagnosticAnswers, 'strugglePath'>;

export interface DiagnosticQuestion {
  id: AnswerFieldKey;
  question: string;
  helperText: string;
  inputType: 'options' | 'select';
  placeholder?: string;
  options: readonly string[];
}

export interface StrugglePathOption {
  id: StrugglePath;
  title: string;
  shortLabel: string;
  subtitle: string;
  questionCountLabel: string;
}

export interface VendorCategoryRecommendation {
  category: string;
  examples: string;
  whatToLookFor: string;
}

export interface OperationalRisk {
  title: string;
  mechanism: string;
  detail: string;
}

export interface VendorMatch {
  name: string;
  oneLineReason: string;
}

export interface DiagnosticReport {
  executiveSummary: string;
  rcmRiskAlert?: string | null;
  topRisks: OperationalRisk[];
  impactRange: string;
  impactDisclaimer: string;
  recommendedCategory: string;
  categoryRationale: string;
  vendorMatches: VendorMatch[];
  generatedAt: string;
}

export interface VendorCatalogEntry {
  name: string;
  profile: string;
  bestFor: string;
}

export interface LeadSubmissionPayload {
  email: string;
  role: string;
  answers: DiagnosticAnswers;
  recommendedCategory: string;
  topRiskTitles: string[];
  turnstileToken: string;
}
