import { useMemo, useState } from 'react';
import { ArrowRight, CalendarClock, ChevronDown, Clock } from 'lucide-react';

interface TimelyFilingPageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

type PayerFilingType = 'Medicare' | 'Medicaid' | 'Commercial';

interface FilingRule {
  label: string;
  initialRuleSummary: string;
  appealRuleSummary: string;
  appealDaysFromInitialFiling: number;
  note: string;
}

const FILING_RULES: Record<PayerFilingType, FilingRule> = {
  Medicare: {
    label: 'Medicare (Traditional FFS)',
    initialRuleSummary: '1 calendar year (12 months) from Date of Service',
    appealRuleSummary: '120 days (Level 1 Redetermination from initial remittance/determination)',
    appealDaysFromInitialFiling: 120,
    note: 'CMS mandates claim submission within 1 calendar year from the Date of Service (42 CFR 424.44). Claims filed past this window trigger non-appealable CO-29 denials.',
  },
  Medicaid: {
    label: 'Medicaid (State Plan Standard)',
    initialRuleSummary: '365 days from Date of Service (state-dependent: 90–365 days)',
    appealRuleSummary: '60 days from initial remittance notice (standard state window)',
    appealDaysFromInitialFiling: 60,
    note: 'Most state Medicaid programs allow 180 to 365 days from Date of Service; managed Medicaid plans frequently enforce shorter 90–180 day windows.',
  },
  Commercial: {
    label: 'Commercial PPO / HMO',
    initialRuleSummary: '90 days from Date of Service (contract benchmark: 90–180 days)',
    appealRuleSummary: '180 days from initial denial / EOB date',
    appealDaysFromInitialFiling: 180,
    note: 'Commercial contracts vary (commonly 90 days for UHC/Cigna/Aetna out-of-network or 90–180 days in-network). Using a 90-day internal cutoff prevents CO-29 write-offs.',
  },
};

function getDefaultDos(): string {
  const d = new Date();
  d.setDate(d.getDate() - 45);
  return d.toISOString().split('T')[0];
}

function parseLocalDate(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function addCalendarYears(date: Date, years: number): Date {
  const result = new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
  // Handle Feb 29 leap-day edge case per CMS rule (falls on Feb 28 of non-leap year)
  if (date.getMonth() === 1 && date.getDate() === 29 && result.getMonth() !== 1) {
    return new Date(date.getFullYear() + years, 1, 28);
  }
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return result;
}

function formatReadableDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TimelyFilingPage({ onStartDiagnostic }: TimelyFilingPageProps) {
  const [payerType, setPayerType] = useState<PayerFilingType>('Medicare');
  const [dosString, setDosString] = useState<string>(getDefaultDos);

  const calculation = useMemo(() => {
    const dos = parseLocalDate(dosString);
    if (!dos) return null;

    const rule = FILING_RULES[payerType];
    let submissionDeadline: Date;

    if (payerType === 'Medicare') {
      submissionDeadline = addCalendarYears(dos, 1);
    } else if (payerType === 'Medicaid') {
      submissionDeadline = addDays(dos, 365);
    } else {
      submissionDeadline = addDays(dos, 90);
    }

    // Appeal deadline shown as exact target date assuming submission by initial filing limit (or DOS + filing + appeal window)
    const appealDeadline = addDays(submissionDeadline, rule.appealDaysFromInitialFiling);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = submissionDeadline.getTime() - todayMidnight.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      dos,
      rule,
      submissionDeadline,
      appealDeadline,
      daysRemaining,
    };
  }, [payerType, dosString]);

  const getStatusClasses = (days: number) => {
    if (days < 0) {
      return 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300';
    }
    if (days <= 30) {
      return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
    }
    return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
  };

  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-12">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            EMR Pulse Free Tool · CO-29 Timely Filing Prevention
          </p>

          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-3xl">
            Timely Filing Limit Calculator
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Calculate exact initial claim submission and appeal deadlines from your Date of Service across Medicare, Medicaid, and Commercial payer rules.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          <div className="border-b border-slate-200 pb-6 dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
              Deadline Calculator
            </span>
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Select Payer Type &amp; Date of Service
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="timely-payer-select"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                1. Payer Type
              </label>
              <div className="relative">
                <select
                  id="timely-payer-select"
                  value={payerType}
                  onChange={(e) => setPayerType(e.target.value as PayerFilingType)}
                  className="min-h-[50px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 py-3 text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                >
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="Commercial">Commercial</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="timely-dos-input"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                2. Date of Service (DOS)
              </label>
              <input
                id="timely-dos-input"
                type="date"
                value={dosString}
                onChange={(e) => setDosString(e.target.value)}
                className="min-h-[50px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 tabular-nums"
              />
            </div>
          </div>

          {calculation ? (
            <div className="mt-8 rounded-2xl border border-teal-700/25 bg-teal-50/40 p-6 dark:border-[#39FF14]/30 dark:bg-[#39FF14]/[0.03] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    {calculation.rule.label}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    For Date of Service: <strong className="font-mono tabular-nums">{formatReadableDate(calculation.dos)}</strong>
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-bold tabular-nums ${getStatusClasses(calculation.daysRemaining)}`}
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {calculation.daysRemaining < 0
                    ? `${Math.abs(calculation.daysRemaining)} days past limit`
                    : `${calculation.daysRemaining} days remaining`}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#070A0E]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    Initial Claim Submission Deadline
                  </span>
                  <p className="mt-2 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {formatReadableDate(calculation.submissionDeadline)}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    Rule: {calculation.rule.initialRuleSummary}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#070A0E]">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Max Appeal Cutoff (From Final Filing Date)
                  </span>
                  <p className="mt-2 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {formatReadableDate(calculation.appealDeadline)}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    Window: {calculation.rule.appealRuleSummary}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {calculation.rule.note}
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
              <CalendarClock className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                Select a Date of Service
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Choose a valid Date of Service above to compute submission and appeal deadlines.
              </p>
            </div>
          )}

          {/* BOTTOM CTA */}
          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-white/10">
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex w-full min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-sm dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
            >
              <span>Run the full diagnostic to see your specific revenue leaks →</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
