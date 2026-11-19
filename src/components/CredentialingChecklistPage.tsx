import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, RotateCcw } from 'lucide-react';

interface CredentialingChecklistPageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  cadence: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'state-license',
    title: 'State license expiration',
    description:
      'Confirm active, unrestricted state medical/nursing license status and verify renewal dates at least 90 days ahead of payer re-credentialing.',
    cadence: 'Verify 90 days prior to expiration',
  },
  {
    id: 'dea-renewal',
    title: 'DEA renewal',
    description:
      'Verify active federal DEA certificate (and state controlled substance license if applicable) matches current practice street address and NPI.',
    cadence: 'Every 3 years · Address-specific',
  },
  {
    id: 'malpractice-cert',
    title: 'Malpractice certificate',
    description:
      'Upload current Certificate of Insurance (COI) / Declarations sheet verifying policy limits ($1M/$3M standard) and uninterrupted coverage dates.',
    cadence: 'Annual COI refresh',
  },
  {
    id: 'caqh-attestation',
    title: 'CAQH ProView attestation',
    description:
      'Complete quarterly CAQH ProView attestation, confirm W-9 / practice TIN alignment, and authorize all target commercial payers to pull profile updates.',
    cadence: 'Re-attest every 120 days',
  },
];

const STORAGE_KEY = 'emr-pulse-credentialing-checklist-v1';

export function CredentialingChecklistPage({
  onStartDiagnostic,
}: CredentialingChecklistPageProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore storage write errors
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedCount = CHECKLIST_ITEMS.filter((item) => checkedIds.includes(item.id)).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;

  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-12">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            EMR Pulse Free Tool · Provider Enrollment &amp; Payer Contracting
          </p>

          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-3xl">
            Credentialing &amp; CAQH Readiness Checklist
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Prevent claim holds from lapsed provider enrollments. Track your core credentialing documents before submitting commercial or Medicare applications.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          {/* Progress Header */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-[#070A0E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  Readiness Progress
                </span>
                <p className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {progressPercent}% Ready{' '}
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    ({completedCount} of {totalCount} verified)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isComplete && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Enrollment Ready
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setCheckedIds([])}
                  disabled={completedCount === 0}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] disabled:opacity-40 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Credentialing readiness completion"
              className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-600 dark:bg-[#39FF14]'
                    : 'bg-[#0F766E] dark:bg-[#39FF14]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Checklist */}
          <div className="mt-6 space-y-3">
            {CHECKLIST_ITEMS.map((item) => {
              const checked = checkedIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  htmlFor={`check-${item.id}`}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors sm:p-5 ${
                    checked
                      ? 'border-teal-700/30 bg-teal-50/50 dark:border-[#39FF14]/40 dark:bg-[#39FF14]/[0.05]'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#070A0E] dark:hover:border-white/25'
                  }`}
                >
                  <input
                    id={`check-${item.id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/30 dark:accent-[#39FF14] cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`font-display text-base font-bold ${
                          checked
                            ? 'text-[#0F766E] line-through dark:text-[#39FF14]'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {item.cadence}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <ClipboardCheck className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]" aria-hidden="true" />
            <span>Progress saves automatically in your browser. Zero provider PII or license numbers are transmitted.</span>
          </div>

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
