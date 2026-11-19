import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileSearch,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { CALENDLY_URL } from '../data/questions';
import { trackEvent } from '../lib/analytics';

interface DenialCheckPageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

export type PayerType =
  | 'Medicare'
  | 'Medicare Advantage'
  | 'Commercial'
  | 'Medicaid';

export type DenialReason =
  | 'Prior Authorization'
  | 'Medical Necessity'
  | 'Coding Error'
  | 'Eligibility';

interface BenchmarkData {
  rate: number;
  benchmarkLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  industryAverage: number;
  claimLagDays: number;
  recommendation: string;
  codeExample: string;
}

const DENIAL_BENCHMARKS: Record<PayerType, Record<DenialReason, BenchmarkData>> = {
  Medicare: {
    'Prior Authorization': {
      rate: 4.8,
      benchmarkLevel: 'Low',
      industryAverage: 5.2,
      claimLagDays: 14,
      recommendation:
        'Standard Medicare Fee-for-Service has fewer prior auth hurdles than MA. Verify whether targeted specialty codes (e.g., specific repetitive surgeries, vein treatments) require pre-claim review before encounter.',
      codeExample: 'CO-197: Precertification/authorization/notification absent.',
    },
    'Medical Necessity': {
      rate: 8.4,
      benchmarkLevel: 'Moderate',
      industryAverage: 7.9,
      claimLagDays: 28,
      recommendation:
        'Integrate Local Coverage Determinations (LCDs) and National Coverage Determinations (NCDs) into your PM claim scrubber to prevent secondary diagnosis mismatch before clearinghouse submission.',
      codeExample: 'CO-50: These are non-covered services because this is not deemed a medical necessity.',
    },
    'Coding Error': {
      rate: 9.2,
      benchmarkLevel: 'Moderate',
      industryAverage: 8.8,
      claimLagDays: 22,
      recommendation:
        'Audit usage of Modifier 25 with E/M services and Modifier 59/XS/XU for distinct procedural services. Ensure CCI edit scrubbers run in real-time in your clearinghouse.',
      codeExample: 'CO-4 / CO-16: Procedure code is inconsistent with modifier or missing documentation.',
    },
    'Eligibility': {
      rate: 3.2,
      benchmarkLevel: 'Low',
      industryAverage: 3.6,
      claimLagDays: 12,
      recommendation:
        'Run 270/271 real-time automated eligibility checks 24 hours prior to appointment and at check-in to confirm active Medicare Part B enrollment.',
      codeExample: 'CO-27: Expenses incurred after coverage terminated.',
    },
  },
  'Medicare Advantage': {
    'Prior Authorization': {
      rate: 14.2,
      benchmarkLevel: 'Critical',
      industryAverage: 11.5,
      claimLagDays: 45,
      recommendation:
        'Medicare Advantage plans enforce stringent prior auth hurdles. Implement real-time payer clearinghouse pre-auth verification overlays and automated denial tracking to capture missing authorizations 48 hours prior to service.',
      codeExample: 'CO-197: Precertification/authorization/notification absent.',
    },
    'Medical Necessity': {
      rate: 12.1,
      benchmarkLevel: 'High',
      industryAverage: 10.4,
      claimLagDays: 38,
      recommendation:
        'MA plans frequently apply proprietary clinical criteria that are more restrictive than CMS. Include detailed provider chart notes and relevant conservative therapy documentation with initial submission.',
      codeExample: 'CO-50: Medical necessity criteria not established per commercial plan policy.',
    },
    'Coding Error': {
      rate: 10.8,
      benchmarkLevel: 'High',
      industryAverage: 9.5,
      claimLagDays: 26,
      recommendation:
        'Medicare Advantage payers aggressively downcode and deny unbundled codes. Configure front-end billing scrubbers for payer-specific bundling logic and telehealth modifier parity.',
      codeExample: 'CO-16: Claim/service lacks information or has billing/coding error.',
    },
    'Eligibility': {
      rate: 7.5,
      benchmarkLevel: 'Moderate',
      industryAverage: 6.2,
      claimLagDays: 21,
      recommendation:
        'Patients frequently switch MA plans at open enrollment. Require front-desk insurance card scanning and real-time electronic eligibility verification on every date of service.',
      codeExample: 'CO-27: Beneficiary enrolled in different managed care plan.',
    },
  },
  Commercial: {
    'Prior Authorization': {
      rate: 11.6,
      benchmarkLevel: 'High',
      industryAverage: 9.8,
      claimLagDays: 35,
      recommendation:
        'Deploy automated eligibility and authorization checks during pre-visit scheduling. Obtain gold-carding status or electronic prior auth (ePA) integration directly into your EHR.',
      codeExample: 'CO-197: Pre-service authorization required by commercial payer.',
    },
    'Medical Necessity': {
      rate: 9.5,
      benchmarkLevel: 'Moderate',
      industryAverage: 8.5,
      claimLagDays: 32,
      recommendation:
        'Ensure clinical charting explicitly documents failed conservative therapies, symptom severity, and chronological progression. Pair secondary ICD-10 supporting codes on procedural claims.',
      codeExample: 'CO-50: Service does not meet clinical guidelines for coverage.',
    },
    'Coding Error': {
      rate: 10.4,
      benchmarkLevel: 'High',
      industryAverage: 9.1,
      claimLagDays: 24,
      recommendation:
        'Review commercial payer payment policies on modifier reduction (e.g. 25% or 50% modifier cuts). Ensure exact diagnostic linkage for each procedure line item.',
      codeExample: 'CO-4: Procedure code is inconsistent with the modifier used.',
    },
    'Eligibility': {
      rate: 6.8,
      benchmarkLevel: 'Moderate',
      industryAverage: 5.9,
      claimLagDays: 18,
      recommendation:
        'Verify active group policy, copay, deductible status, and secondary payer coordination of benefits (COB) prior to patient arrival.',
      codeExample: 'CO-26 / CO-27: Patient eligibility expired or secondary coverage primary.',
    },
  },
  Medicaid: {
    'Prior Authorization': {
      rate: 8.9,
      benchmarkLevel: 'Moderate',
      industryAverage: 8.2,
      claimLagDays: 30,
      recommendation:
        'Medicaid managed plans change formulary and service authorization criteria frequently. Configure clearinghouse scrub rules to flag state-specific authorization requirements.',
      codeExample: 'CO-197: State Medicaid managed care pre-authorization absent.',
    },
    'Medical Necessity': {
      rate: 6.8,
      benchmarkLevel: 'Moderate',
      industryAverage: 6.5,
      claimLagDays: 28,
      recommendation:
        'Check state Medicaid EPSDT and specialized clinical policy bulletins for required diagnostic pairings and age-specific service restrictions.',
      codeExample: 'CO-50: Not deemed medically necessary under state Medicaid rules.',
    },
    'Coding Error': {
      rate: 8.1,
      benchmarkLevel: 'Moderate',
      industryAverage: 7.8,
      claimLagDays: 20,
      recommendation:
        'Confirm state Medicaid billing guidelines regarding procedure-to-diagnosis crosswalks and NDC codes on drug administrations.',
      codeExample: 'CO-16: Procedure code lacks valid state Medicaid modifier.',
    },
    'Eligibility': {
      rate: 13.5,
      benchmarkLevel: 'Critical',
      industryAverage: 10.8,
      claimLagDays: 40,
      recommendation:
        'Medicaid disenrollment and coverage churn rates are high. Verify active coverage monthly on the 1st of the month and on date of service via state portal 270 electronic batch.',
      codeExample: 'CO-27: Expenses incurred after state coverage terminated or lapsed.',
    },
  },
};

const PAYER_TYPES: PayerType[] = [
  'Medicare',
  'Medicare Advantage',
  'Commercial',
  'Medicaid',
];

const DENIAL_REASONS: DenialReason[] = [
  'Prior Authorization',
  'Medical Necessity',
  'Coding Error',
  'Eligibility',
];

function getBadgeStyle(level: BenchmarkData['benchmarkLevel']) {
  switch (level) {
    case 'Critical':
      return 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300';
    case 'High':
      return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
    case 'Moderate':
      return 'border-teal-700/30 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]';
    case 'Low':
      return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
  }
}

export function DenialCheckPage({
  onStartDiagnostic,
}: DenialCheckPageProps) {
  const [selectedPayer, setSelectedPayer] = useState<PayerType>('Medicare Advantage');
  const [selectedReason, setSelectedReason] = useState<DenialReason>('Prior Authorization');

  const currentBenchmark = DENIAL_BENCHMARKS[selectedPayer][selectedReason];

  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      {/* HERO SECTION */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/25 bg-white/90 px-3.5 py-1 text-xs font-semibold text-[#0F766E] shadow-sm backdrop-blur-md dark:border-[#39FF14]/30 dark:bg-white/[0.04] dark:text-[#39FF14]">
            <FileSearch className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>EMR Pulse Free Tool · 2026 Clearinghouse Denial Intelligence</span>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.1rem,4vw,3.4rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-3xl">
            Denial Reason Quick-Check
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Identify 2026 clearinghouse benchmark denial rates, claim resolution lag, and actionable operational fixes for your specific payer mix. Zero PHI required.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#denial-analyzer"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-sm dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap cursor-pointer"
            >
              <span>Explore Denial Benchmark</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>

            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent('calendly_click', { location: 'denial_hero' })}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:border-[#39FF14]/60 dark:hover:text-[#39FF14] whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Book a Demo</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* INTERACTIVE TOOL (Light theme matching Free Tools) */}
      <section id="denial-analyzer" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          <div className="border-b border-slate-200 pb-6 dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
              Interactive Payer Matrix
            </span>
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Calculate Denial Frequency &amp; Remediation Plan
            </h2>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              Select your primary payer network and leading rejection category below.
            </p>
          </div>

          {/* DROPDOWNS */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="payer-type-select"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                1. Select Payer Type
              </label>
              <div className="relative">
                <select
                  id="payer-type-select"
                  value={selectedPayer}
                  onChange={(e) => setSelectedPayer(e.target.value as PayerType)}
                  className="min-h-[50px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 py-3 text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                >
                  {PAYER_TYPES.map((payer) => (
                    <option key={payer} value={payer}>
                      {payer}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="denial-reason-select"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                2. Select Top Denial Reason
              </label>
              <div className="relative">
                <select
                  id="denial-reason-select"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value as DenialReason)}
                  className="min-h-[50px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 py-3 text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                >
                  {DENIAL_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC BENCHMARK RESULT CARD */}
          <div className="mt-8 rounded-2xl border border-teal-700/25 bg-teal-50/50 p-6 dark:border-[#39FF14]/30 dark:bg-[#39FF14]/[0.03] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  {selectedPayer} · {selectedReason}
                </span>
                <p className="mt-0.5 font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  Estimated 2026 Denial Rate: <span className="text-[#0F766E] dark:text-[#39FF14] tabular-nums">{currentBenchmark.rate}%</span>
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold ${getBadgeStyle(currentBenchmark.benchmarkLevel)}`}
              >
                {currentBenchmark.benchmarkLevel} Exposure
              </span>
            </div>

            {/* Visual Bar Comparison */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Selected Mix Rate vs. National Average ({currentBenchmark.industryAverage}%)</span>
                <span className="font-mono tabular-nums">{currentBenchmark.rate}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#0F766E] dark:bg-[#39FF14] transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentBenchmark.rate / 20) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Typical Lag to Claim Resolution: <strong>{currentBenchmark.claimLagDays} days</strong></span>
                <span>Remittance Code: {currentBenchmark.codeExample}</span>
              </div>
            </div>

            {/* ACTIONABLE RECOMMENDATION */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#070A0E]">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#0F766E] dark:bg-[#39FF14]/15 dark:text-[#39FF14]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Operational Recommendation
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {currentBenchmark.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CTA: FULL DIAGNOSTIC ROUTING */}
          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-white/10">
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex w-full min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-sm dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
            >
              <span>Run the full diagnostic to see your specific revenue leaks →</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
            <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
              Free 2-minute branching diagnostic · Instant PDF report with conservative financial impact modeling
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
