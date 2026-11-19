import { useState } from 'react';
import { ArrowRight, ChevronDown, ClipboardList, Receipt } from 'lucide-react';

interface PainPointsSectionsProps {
  onStartDiagnostic: () => void;
}

interface PainPointItem {
  title: string;
  detail: string;
}

const BILLING_PAIN_POINTS: PainPointItem[] = [
  {
    title: 'AI-driven denials and automated downcoding',
    detail:
      'Payers increasingly use automated review algorithms to flag, downcode, or reject complex E/M and specialty claims faster than manual billing teams can respond.',
  },
  {
    title: '"Sophisticated friction" from payers',
    detail:
      'Multi-step prior authorization rules, shifting medical-necessity criteria, and opaque remittance delays create deliberate friction that slows down earned reimbursement.',
  },
  {
    title: "Legacy RCM queues that don't learn",
    detail:
      'Static billing queues surface denials weeks after submission without root-cause pattern detection, forcing staff to rework the same payer errors repeatedly.',
  },
  {
    title: 'Billing transfer errors reported by Tebra / AdvancedMD users',
    detail:
      'Practices operating fragmented PM-to-EHR bridges—including issues reported by Tebra and AdvancedMD users—often face charge sync drops, modifier stripping, and missed clearinghouse rejections.',
  },
];

const WORKFLOW_PAIN_POINTS: PainPointItem[] = [
  {
    title: '80.7% of clinicians use daily workarounds (Black Book 2026)',
    detail:
      'Over four in five clinicians rely on manual workarounds every day to bypass rigid EHR templates and disconnected clinical workflows.',
  },
  {
    title: '56% manually track referrals, labs, and authorizations',
    detail:
      'More than half of practices manually follow up on outbound referrals, diagnostic lab orders, and prior authorizations to keep care from stalling.',
  },
  {
    title: '49% check payer portals outside the EHR',
    detail:
      'Nearly half of practice staff log into external insurer portals one-by-one because real-time eligibility and claim status inside their EHR remain incomplete.',
  },
  {
    title: '61% keep unofficial tracking lists',
    detail:
      'Over 60% of clinical and billing teams maintain shadow spreadsheets, sticky notes, or paper logs outside the EHR so urgent tasks do not slip through the cracks.',
  },
];

export function PainPointsSections({ onStartDiagnostic }: PainPointsSectionsProps) {
  const [billingOpen, setBillingOpen] = useState(true);
  const [workflowOpen, setWorkflowOpen] = useState(true);

  return (
    <section
      id="pain-points"
      className="border-t border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-[#0B1017] sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
              Industry Pain-Point Benchmarks
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
              Where independent practices lose revenue and clinical hours every day.
            </h2>
          </div>
          <button
            type="button"
            onClick={onStartDiagnostic}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open full diagnostic report</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Section A: Billing & Revenue Cycle Pain Points */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/12 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setBillingOpen((prev) => !prev)}
              aria-expanded={billingOpen}
              className="flex w-full items-start justify-between gap-4 text-left cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                  <Receipt className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    Section A
                  </span>
                  <h3 className="mt-0.5 font-display text-lg font-bold text-slate-900 dark:text-white">
                    Billing &amp; Revenue Cycle Pain Points
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    AI-driven denials, payer friction, static RCM queues, and charge-transfer errors.
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`mt-1 h-5 w-5 shrink-0 text-slate-600 transition-transform dark:text-slate-400 ${
                  billingOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {billingOpen ? (
              <ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-white/10">
                {BILLING_PAIN_POINTS.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0B1017]"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline dark:text-[#39FF14] cursor-pointer"
              >
                <span>Run the free diagnostic to get your full diagnostic report</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Section B: Administrative & Clinical Workflow Pain Points */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/12 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setWorkflowOpen((prev) => !prev)}
              aria-expanded={workflowOpen}
              className="flex w-full items-start justify-between gap-4 text-left cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    Section B
                  </span>
                  <h3 className="mt-0.5 font-display text-lg font-bold text-slate-900 dark:text-white">
                    Administrative &amp; Clinical Workflow Pain Points
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Daily EHR workarounds, manual tracking, and external portal overhead.
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`mt-1 h-5 w-5 shrink-0 text-slate-600 transition-transform dark:text-slate-400 ${
                  workflowOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {workflowOpen ? (
              <ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-white/10">
                {WORKFLOW_PAIN_POINTS.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0B1017]"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline dark:text-[#39FF14] cursor-pointer"
              >
                <span>Run the free diagnostic to get your full diagnostic report</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
