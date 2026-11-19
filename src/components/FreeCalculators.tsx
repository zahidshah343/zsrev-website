import { useState } from 'react';
import {
  BookOpen,
  Building2,
  Calculator,
  CalendarClock,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileSearch,
  Network,
} from 'lucide-react';

interface FreeCalculatorsProps {
  onStartDiagnostic: () => void;
  onNavigateBenchmark?: () => void;
  onNavigateDenialCheck?: () => void;
  onNavigateNpiLookup?: () => void;
  onNavigatePayerDirectory?: () => void;
  onNavigateCredentialingChecklist?: () => void;
  onNavigateModifierGuide?: () => void;
  onNavigateTimelyFiling?: () => void;
}

const AVG_CLAIM_VALUE_USD = 145;
const UNRECOVERED_DENIAL_RATIO = 0.35;
const REWORK_COST_PER_DENIAL_USD = 25;

const CLINIC_DAYS_PER_YEAR = 250;
const AI_SCRIBE_TIME_REDUCTION = 0.5;
const CLINICIAN_HOURLY_RATE_USD = 150;

export function FreeCalculators({
  onStartDiagnostic,
  onNavigateBenchmark,
  onNavigateDenialCheck,
  onNavigateNpiLookup,
  onNavigatePayerDirectory,
  onNavigateCredentialingChecklist,
  onNavigateModifierGuide,
  onNavigateTimelyFiling,
}: FreeCalculatorsProps) {
  // Calculator 1: RCM Denial Rate Impact
  const [monthlyClaims, setMonthlyClaims] = useState<number>(1200);
  const [denialRate, setDenialRate] = useState<number>(9);

  // Calculator 2: AI Scribe Time Savings
  const [providerCount, setProviderCount] = useState<number>(4);
  const [dailyDocHours, setDailyDocHours] = useState<number>(2.5);

  const safeMonthlyClaims = Math.max(0, Number.isFinite(monthlyClaims) ? monthlyClaims : 0);
  const safeDenialRate = Math.min(100, Math.max(0, Number.isFinite(denialRate) ? denialRate : 0));

  const annualDeniedClaims = Math.round(safeMonthlyClaims * 12 * (safeDenialRate / 100));
  const annualUnrecoveredRevenue = Math.round(
    annualDeniedClaims * AVG_CLAIM_VALUE_USD * UNRECOVERED_DENIAL_RATIO
  );
  const annualReworkCost = Math.round(annualDeniedClaims * REWORK_COST_PER_DENIAL_USD);
  const estimatedAnnualRevenueLoss = annualUnrecoveredRevenue + annualReworkCost;

  const safeProviders = Math.max(0, Number.isFinite(providerCount) ? providerCount : 0);
  const safeDailyHours = Math.min(16, Math.max(0, Number.isFinite(dailyDocHours) ? dailyDocHours : 0));

  const annualDocHours = safeProviders * safeDailyHours * CLINIC_DAYS_PER_YEAR;
  const annualHoursSaved = Math.round(annualDocHours * AI_SCRIBE_TIME_REDUCTION);
  const estimatedLaborSavings = Math.round(annualHoursSaved * CLINICIAN_HOURLY_RATE_USD);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <section
      id="free-tools"
      className="border-t border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-[#070A0E] sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="mb-2">
            <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-[#0F766E] border border-teal-700/20 dark:bg-[#39FF14]/10 dark:text-[#39FF14] dark:border-[#39FF14]/30">
              ZSREV Analytics Suite
            </span>
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            Free Practice Calculators · No Login or Email Required
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
            Quantify your revenue leakage and charting overhead in seconds.
          </h2>
          <p className="mt-2.5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Test your practice&apos;s operational numbers instantly with zero PHI and no email gate.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Tool 1: Cost Benchmarking Calculator */}
          <article className="flex flex-col justify-between rounded-2xl border border-teal-700/25 bg-white p-6 shadow-sm dark:border-[#39FF14]/30 dark:bg-white/[0.04] sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <Calculator className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Cost Benchmarking Tool
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Compare CPT codes &amp; reimbursement across payer schedules
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Instantly check Medicare, commercial PPO, and Medicaid rates for common CPT codes with our interactive fee schedule and AI search assistant.
              </p>

              <div className="mt-6 rounded-xl border border-teal-700/20 bg-teal-50/70 p-4 dark:border-[#39FF14]/30 dark:bg-[#39FF14]/[0.05]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  Featured Tool
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  CPT 99214 &amp; Multi-Payer Analysis
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/benchmark"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateBenchmark) {
                    onNavigateBenchmark();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/benchmark');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Cost Benchmarking →</span>
              </a>
            </div>
          </article>
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <DollarSign className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      RCM Denial Rate Impact Calculator
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Estimate annual lost revenue and rework from claim denials
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="calc-monthly-claims"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Monthly Claims Submitted
                  </label>
                  <input
                    id="calc-monthly-claims"
                    type="number"
                    min={0}
                    max={100000}
                    step={50}
                    value={monthlyClaims}
                    onChange={(e) => setMonthlyClaims(Number(e.target.value))}
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#0B1017] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-denial-rate"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Claim Denial Rate (%)
                  </label>
                  <input
                    id="calc-denial-rate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={denialRate}
                    onChange={(e) => setDenialRate(Number(e.target.value))}
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#0B1017] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Estimated Annual Revenue Loss
                  </span>
                  <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                    {formatNumber(annualDeniedClaims)} denied claims / yr
                  </span>
                </div>
                <p className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-[#B91C1C] dark:text-[#FCA5A5] tabular-nums">
                  {formatCurrency(estimatedAnnualRevenueLoss)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-xs dark:border-white/10">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Unrecovered AR:</span>{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(annualUnrecoveredRevenue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Rework Cost:</span>{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(annualReworkCost)}
                    </span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Industry benchmark: ${AVG_CLAIM_VALUE_USD} avg claim value,{' '}
                  {Math.round(UNRECOVERED_DENIAL_RATIO * 100)}% unrecovered denial write-off rate,
                  and ${REWORK_COST_PER_DENIAL_USD} staff rework per denied claim.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex w-full min-h-[44px] items-center justify-center rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14] cursor-pointer"
              >
                Run the full dynamic diagnostic to see your practice&apos;s specific revenue
                leaks →
              </button>
            </div>
          </article>

          {/* Tool 2: AI Scribe Time Savings Calculator */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      AI Scribe Time Savings Calculator
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Project annual charting hours and labor cost recovered
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="calc-provider-count"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Provider Count (MD/DO/NP/PA)
                  </label>
                  <input
                    id="calc-provider-count"
                    type="number"
                    min={1}
                    max={500}
                    step={1}
                    value={providerCount}
                    onChange={(e) => setProviderCount(Number(e.target.value))}
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#0B1017] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-doc-hours"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Daily Charting Hours / Provider
                  </label>
                  <input
                    id="calc-doc-hours"
                    type="number"
                    min={0}
                    max={16}
                    step={0.5}
                    value={dailyDocHours}
                    onChange={(e) => setDailyDocHours(Number(e.target.value))}
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#0B1017] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Annual Hours Saved
                    </span>
                    <p className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                      {formatNumber(annualHoursSaved)}{' '}
                      <span className="text-base font-bold">hrs</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Est. Labor Cost Savings
                    </span>
                    <p className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(estimatedLaborSavings)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
                  <Calculator className="h-3.5 w-3.5 shrink-0 text-[#0F766E] dark:text-[#39FF14]" aria-hidden="true" />
                  <span>
                    Out of {formatNumber(Math.round(annualDocHours))} total charting hours/yr across{' '}
                    {safeProviders} {safeProviders === 1 ? 'provider' : 'providers'}.
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Conservative benchmark: {CLINIC_DAYS_PER_YEAR} clinic days/yr,{' '}
                  {Math.round(AI_SCRIBE_TIME_REDUCTION * 100)}% charting reduction via ambient AI
                  scribe, and ${CLINICIAN_HOURLY_RATE_USD}/hr blended clinician labor value.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex w-full min-h-[44px] items-center justify-center rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14] cursor-pointer"
              >
                Run the full dynamic diagnostic to see your practice&apos;s specific revenue
                leaks →
              </button>
            </div>
          </article>

          {/* Tool 4: Denial Reason Quick-Check */}
          <article className="flex flex-col justify-between rounded-2xl border border-teal-700/25 bg-white p-6 shadow-sm dark:border-[#39FF14]/30 dark:bg-white/[0.04] sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <FileSearch className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Denial Reason Quick-Check
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Top 2026 clearinghouse denial patterns
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Identify the top 2026 benchmark denial rates for your specific payer mix.
              </p>

              <div className="mt-6 rounded-xl border border-teal-700/20 bg-teal-50/70 p-4 dark:border-[#39FF14]/30 dark:bg-[#39FF14]/[0.05]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  Payer Intelligence
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  CO-4, CO-16 &amp; Timely Filing Benchmarks
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/denial-check"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateDenialCheck) {
                    onNavigateDenialCheck();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/denial-check');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Denial Check →</span>
              </a>
            </div>
          </article>

          {/* Tool 5: NPI Registry & Taxonomy Lookup */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      NPI Registry &amp; Taxonomy Lookup
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Live CMS NPPES provider &amp; taxonomy lookup
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Query the official CMS NPPES NPI Registry by 10-digit NPI number to verify provider name, primary taxonomy code, and billing address.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  CMS NPPES API v2.1
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  Instant Provider &amp; Billing Address Verification
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/npi-lookup"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateNpiLookup) {
                    onNavigateNpiLookup();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/npi-lookup');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Tool →</span>
              </a>
            </div>
          </article>

          {/* Tool 6: Payer Portal & EDI Directory */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <Network className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Payer Portal &amp; EDI Directory
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      ERA/EFT Payer IDs &amp; portal quick-links
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Search Availity, Optum, Medicare MACs, and major commercial payers for portal links and electronic ERA/EFT Payer IDs.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  EDI &amp; Remittance Reference
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  Clearinghouse, MAC &amp; Commercial Payer IDs
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/payer-directory"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigatePayerDirectory) {
                    onNavigatePayerDirectory();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/payer-directory');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Tool →</span>
              </a>
            </div>
          </article>

          {/* Tool 7: Credentialing & CAQH Readiness Checklist */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Credentialing &amp; CAQH Readiness Checklist
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Track license, DEA, COI &amp; CAQH status
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Interactive readiness tracker with a live completion bar covering state license expiration, DEA renewal, malpractice COI, and CAQH attestation.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  Enrollment Readiness
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  4-Point Credentialing Pre-Flight Check
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/credentialing-checklist"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateCredentialingChecklist) {
                    onNavigateCredentialingChecklist();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/credentialing-checklist');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Tool →</span>
              </a>
            </div>
          </article>

          {/* Tool 8: CPT / ICD-10 Modifier & Bundling Guide */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      CPT / ICD-10 Modifier &amp; Bundling Guide
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Modifiers 25, 59, XE, XP, XS &amp; XU
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Searchable quick-reference guide explaining when to apply Modifier 25, 59, XE, XP, XS, and XU to stop CO-4 and NCCI bundling denials.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  Clean-Claim Scrubbing
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  NCCI Edit &amp; Modifier Rules
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/modifier-guide"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateModifierGuide) {
                    onNavigateModifierGuide();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/modifier-guide');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Tool →</span>
              </a>
            </div>
          </article>

          {/* Tool 9: Timely Filing Limit Calculator */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none sm:p-7 md:col-span-2">
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                    <CalendarClock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Timely Filing Limit Calculator
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Exact claim submission &amp; appeal deadlines by Date of Service
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Select Medicare, Medicaid, or Commercial payer type and Date of Service to compute exact initial claim filing and appeal deadlines to avoid CO-29 timely filing write-offs.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0B1017]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  AR &amp; Appeal Deadlines
                </p>
                <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  Medicare 1-Year, Medicaid &amp; Commercial Filing Cutoffs
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
              <a
                href="/timely-filing"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateTimelyFiling) {
                    onNavigateTimelyFiling();
                  } else if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/timely-filing');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <span>Launch Tool →</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
