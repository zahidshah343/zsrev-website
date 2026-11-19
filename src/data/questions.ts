import type {
  DiagnosticQuestion,
  StrugglePath,
  StrugglePathOption,
  VendorCatalogEntry,
  VendorCategoryRecommendation,
} from '../types/diagnostic';

export const CALENDLY_URL = 'https://calendly.com/zahidshah343/30min';

export const LEAD_ROLES = [
  'Physician/Owner',
  'Practice Manager',
  'Billing/RCM Manager',
  'Other',
] as const;

export const STRUGGLE_PATHS: StrugglePathOption[] = [
  {
    id: 'billing',
    title: 'Billing & RCM (Denials, AR, Clearinghouse)',
    shortLabel: 'Billing & RCM',
    subtitle:
      'Diagnose claim denial rates, AR aging lag, clearinghouse scrubbing bottlenecks, and vendor handoffs.',
    questionCountLabel: '5 targeted questions',
  },
  {
    id: 'clinical',
    title: 'Clinical & Admin (Prior Auth, Charting, ICD Codes)',
    shortLabel: 'Clinical & Admin',
    subtitle:
      'Measure prior authorization staff load, payer wait times, daily provider charting, and coding gaps.',
    questionCountLabel: '5 targeted questions',
  },
  {
    id: 'other',
    title: 'Other / General Workflow Issues',
    shortLabel: 'General Workflow',
    subtitle:
      'Assess disconnected intake, portal workarounds, staff capacity drag, and system integration gaps.',
    questionCountLabel: '4 targeted questions',
  },
];

export const PATH_QUESTIONS: Record<StrugglePath, DiagnosticQuestion[]> = {
  billing: [
    {
      id: 'billingSetup',
      question: 'How is your billing handled today?',
      helperText:
        'Identifies whether revenue friction stems from vendor separation, internal capacity, or service handoffs.',
      inputType: 'options',
      options: [
        'Same vendor for Clinical & Billing',
        'Separate PM / Billing vendor',
        'Outsourced RCM service',
        'In-house / Manual billing',
      ],
    },
    {
      id: 'monthlyClaimVolume',
      question: 'What is your estimated monthly claim volume?',
      helperText:
        'Select a conservative volume range so revenue impact reflects realistic clinic scale.',
      inputType: 'select',
      placeholder: 'Select monthly claim volume...',
      options: [
        'Under 500 claims/mo',
        '500–1,500 claims/mo',
        '1,500–3,500 claims/mo',
        '3,500+ claims/mo',
        'Not sure',
      ],
    },
    {
      id: 'currentDenialRate',
      question: 'What is your current first-pass claim denial rate?',
      helperText:
        'Select the approximate share of claims denied or rejected on initial payer submission.',
      inputType: 'select',
      placeholder: 'Select denial rate range...',
      options: [
        'Under 3%',
        '3%–6%',
        '6%–10%',
        '10%–15%',
        'Over 15%',
        'Not sure',
      ],
    },
    {
      id: 'arDays',
      question: 'What is your average Days in Accounts Receivable (AR)?',
      helperText:
        'Measures how long earned claims remain unpaid before collection or write-off.',
      inputType: 'select',
      placeholder: 'Select average Days in AR...',
      options: [
        'Under 30 days',
        '30–45 days',
        '45–60 days',
        '60+ days',
        'Not sure',
      ],
    },
    {
      id: 'clearinghouseRework',
      question: 'How often do staff manually rework clearinghouse or payer rejections?',
      helperText:
        'Checks whether front-end scrubbing resolves rejections automatically or requires manual intervention.',
      inputType: 'options',
      options: [
        'Daily manual rework',
        'Weekly manual batching',
        'A few times per month',
        'Automated scrubbing handles most',
        'Not sure',
      ],
    },
  ],
  clinical: [
    {
      id: 'providerCount',
      question: 'How many prescribing providers (MD/DO/NP/PA) are in your practice?',
      helperText:
        'Calibrates documentation hours and staffing load conservatively for your clinic size.',
      inputType: 'select',
      placeholder: 'Select provider count...',
      options: [
        '1–2 providers',
        '3–5 providers',
        '6–10 providers',
        '11+ providers',
      ],
    },
    {
      id: 'priorAuthWeeklyHours',
      question: 'How many total staff hours per week go to prior authorizations?',
      helperText:
        'Include time spent across payer portals, status checks, peer-to-peers, and phone follow-ups.',
      inputType: 'select',
      placeholder: 'Select weekly prior auth hours...',
      options: [
        'Under 5 hrs/wk',
        '5–15 hrs/wk',
        '15–30 hrs/wk',
        '30+ hrs/wk',
        'Not sure',
      ],
    },
    {
      id: 'priorAuthTurnaround',
      question: 'What is your typical prior authorization wait time?',
      helperText:
        'Longer turnaround times often drive rescheduled visits, patient drop-offs, and staff follow-up loops.',
      inputType: 'select',
      placeholder: 'Select typical wait time...',
      options: [
        'Same day – 48 hours',
        '3–5 business days',
        '1–2 weeks',
        '2+ weeks or frequent delays',
        'Not sure',
      ],
    },
    {
      id: 'dailyChartingHours',
      question: 'How many hours daily do providers spend charting & coding?',
      helperText:
        'Include in-clinic documentation, ICD-10/CPT selection, and after-hours pajama time.',
      inputType: 'select',
      placeholder: 'Select daily charting hours...',
      options: [
        'Under 1 hr/day',
        '1–2 hrs/day',
        '2–3 hrs/day',
        '3+ hrs/day',
      ],
    },
    {
      id: 'icdCodingBottleneck',
      question: 'Where does clinical documentation or coding stall most often?',
      helperText:
        'Pinpoints the single highest-leverage workflow fix for clinicians and support staff.',
      inputType: 'options',
      options: [
        'After-hours charting & note backlog',
        'Under-coded visits or missed E/M complexity',
        'Modifier & ICD-10 specificity errors',
        'Manual referrals, labs & portal tracking',
      ],
    },
  ],
  other: [
    {
      id: 'practiceSize',
      question: 'How many total providers and staff operate in your practice?',
      helperText:
        'Helps calibrate administrative overhead against benchmarks for clinics your size.',
      inputType: 'select',
      placeholder: 'Select total practice team size...',
      options: [
        '1–3 total team',
        '4–10 total team',
        '11–25 total team',
        '26+ total team',
      ],
    },
    {
      id: 'workflowSetup',
      question: 'How connected are your EHR, billing, and patient intake tools today?',
      helperText:
        'Identifies whether inefficiency comes from system silos or missing automation inside one suite.',
      inputType: 'options',
      options: [
        'Single all-in-one platform',
        'Connected via bridges or clearinghouse',
        'Disconnected spreadsheets & portals',
        'Evaluating a new EHR/PM setup',
      ],
    },
    {
      id: 'primaryFrictionArea',
      question: 'Which daily workflow causes the most wasted staff time?',
      helperText:
        'Select the area that creates the highest daily friction across front desk and back office.',
      inputType: 'options',
      options: [
        'Manual patient intake & eligibility checks',
        'Referral, lab & external portal tracking',
        'Reporting visibility & vendor support gaps',
        'Mixed billing and charting bottlenecks',
      ],
    },
    {
      id: 'weeklyAdminOverhead',
      question: 'Roughly how many staff hours per week are lost to manual workarounds?',
      helperText:
        'Estimate combined hours spent copying data between tools, checking portals, or maintaining shadow lists.',
      inputType: 'select',
      placeholder: 'Select weekly workaround hours...',
      options: [
        'Under 5 hrs/wk',
        '5–15 hrs/wk',
        '15–30 hrs/wk',
        '30+ hrs/wk',
        'Not sure',
      ],
    },
  ],
};

export const VENDOR_CATEGORY_SOLUTIONS: Record<
  StrugglePath,
  VendorCategoryRecommendation[]
> = {
  billing: [
    {
      category: 'Integrated RCM Platforms',
      examples: 'athenahealth, AdvancedMD, Tebra',
      whatToLookFor:
        'Look for real-time payer rule updates, automated denial routing queues, and transparent net collection guarantees before signing multi-year contracts.',
    },
    {
      category: 'Clearinghouse & Claim-Scrubbing Automation',
      examples: 'Waystar, EHR-overlay scrubbers',
      whatToLookFor:
        'Prioritize pre-submission NCCI/LCD edit checks and instant rejection alerts that layer over your existing EHR without forcing a migration.',
    },
    {
      category: 'Managed Denial & AR Recovery Services',
      examples: 'Veradigm RCS, Specialized RCM Partners',
      whatToLookFor:
        'Verify contractual SLAs on 30/60/90+ day AR aging follow-up, clean payer credentialing support, and exit flexibility with zero data lock-in.',
    },
  ],
  clinical: [
    {
      category: 'Ambient AI Scribes & Coding Assistants',
      examples: 'eClinicalWorks native AI, EHR-integrated scribes',
      whatToLookFor:
        'Ensure structured note push directly into EHR fields, accurate E/M and ICD-10 specificity prompts, and an executed HIPAA BAA.',
    },
    {
      category: 'Automated Prior Authorization Tools',
      examples: 'Waystar Prior Auth, ePA workflow overlays',
      whatToLookFor:
        'Look for electronic payer-portal connectivity, automated status polling, and staff exception queues that reduce manual phone follow-ups.',
    },
    {
      category: 'Unified Clinical & Practice Management Suites',
      examples: 'Cerbo, Tebra, Azalea Health',
      whatToLookFor:
        'Prioritize fast encounter-to-claim templates, built-in order/referral tracking, and responsive implementation support for lean clinical teams.',
    },
  ],
  other: [
    {
      category: 'Digital Patient Intake & Eligibility Automation',
      examples: 'EHR-native intake + 270/271 eligibility scrubbers',
      whatToLookFor:
        'Choose tools that verify coverage automatically 48 hours pre-visit and write demographics straight into your PM without manual re-keying.',
    },
    {
      category: 'Workflow Overlay & Referral Tracking Platforms',
      examples: 'Waystar overlays, closed-loop referral tools',
      whatToLookFor:
        'Confirm bidirectional HL7/FHIR sync with your current EHR so shadow spreadsheets and sticky notes are replaced in one queue.',
    },
    {
      category: 'Vendor-Neutral EHR / PM Contract Advisory',
      examples: 'EMR Pulse Optimization & Vendor Selection',
      whatToLookFor:
        'Benchmark implementation fees, per-provider minimums, and termination clauses across shortlisted vendors before committing.',
    },
  ],
};

export const VENDOR_CATALOG: VendorCatalogEntry[] = [
  {
    name: 'Cerbo',
    profile: 'Lightweight, relationship-first EHR built for independent primary care, DPC, and boutique clinics.',
    bestFor: 'Solo or lean practices with 0–2 admin staff prioritizing low overhead and clinical autonomy.',
  },
  {
    name: 'athenahealth',
    profile: 'Cloud EHR and integrated revenue cycle network with automated claim scrubbing and denial tracking.',
    bestFor: 'Practices struggling with claim denial lag, billing visibility, or high prior-auth volume.',
  },
  {
    name: 'Veradigm',
    profile: 'Flexible ambulatory EHR and practice management platform with an open partner ecosystem.',
    bestFor: 'Established multi-staff practices wanting structured workflows without losing independence.',
  },
  {
    name: 'eClinicalWorks',
    profile: 'All-in-one ambulatory EHR/PM suite offering native AI ambient scribe capabilities and scalable RCM.',
    bestFor: 'Cost-conscious independent practices seeking built-in AI charting and unified billing.',
  },
  {
    name: 'Tebra',
    profile: 'Modern practice growth, EHR, and billing platform tailored for independent outpatient practices.',
    bestFor: 'Small-to-midsize practices wanting faster staff onboarding and clear patient-to-claim workflows.',
  },
  {
    name: 'Azalea Health',
    profile: 'Cloud-based EHR and RCM designed for rural, community, and independent specialty practices.',
    bestFor: 'Practices concerned about transition support, guided data migration, and responsive RCM.',
  },
  {
    name: 'Veradigm RCS',
    profile: 'Dedicated revenue cycle services and denial recovery team built to eliminate claim lag and unworked AR.',
    bestFor: 'Practices experiencing 1+ week denial discovery delays or limited internal billing bandwidth.',
  },
  {
    name: 'AdvancedMD',
    profile: 'Integrated practice management and automated denial-management suite with real-time claim scrubbing.',
    bestFor: 'Independent groups prioritizing faster denial detection, payer follow-up, and clean-claim workflows.',
  },
  {
    name: 'Waystar',
    profile: 'Dedicated revenue cycle and automated denial-management platform that layers onto existing EMRs.',
    bestFor: 'Practices wanting immediate denial visibility and prior-auth automation without switching their core EMR.',
  },
];

export interface VendorPricingRow {
  vendorName: string;
  solutionType: string;
  estStartingPrice: string;
  bestFor: string;
}

export const VENDOR_PRICING_TABLE: VendorPricingRow[] = [
  {
    vendorName: 'Waystar',
    solutionType: 'RCM Overlay',
    estStartingPrice: '~$500/mo + % of collections',
    bestFor: 'Practices keeping their current EMR but needing denial management.',
  },
  {
    vendorName: 'Veradigm RCS',
    solutionType: 'Managed RCM',
    estStartingPrice: '4% - 7% of monthly collections',
    bestFor: 'Practices wanting to fully outsource billing and AR follow-up.',
  },
  {
    vendorName: 'AdvancedMD',
    solutionType: 'Full PM/EMR',
    estStartingPrice: '~$729/mo per provider',
    bestFor: 'Practices ready to replace their record-only EMR entirely.',
  },
];
