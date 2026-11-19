import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { ThemeMode } from '../App';
import { CALENDLY_URL } from '../data/questions';
import { trackEvent } from '../lib/analytics';

interface ServicesPageProps {
  theme: ThemeMode;
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

const SERVICE_PILLARS = [
  {
    number: '01',
    title: 'Workflow Optimization',
    subtitle: 'Fix clinical and administrative bottlenecks without unnecessary software churn.',
    summary:
      'Before replacing your EHR, we map where staff hours and provider evenings are actually going—across ambient charting, prior authorization queues, clearinghouse edits, and front-desk handoffs.',
    deliverables: [
      'Charting & ICD/CPT documentation workflow audit (identifying high-ROI ambient AI scribe or template fixes)',
      'Prior authorization queue triage to cut manual payer portal checks and peer-to-peer delays',
      'Cross-system handoff cleanup when clinical EHR and billing run on separate platforms',
    ],
  },
  {
    number: '02',
    title: 'RCM Consulting & Denial Recovery',
    subtitle: 'Tighten clean-claim rates, AR accountability, and clearinghouse rejection workflows.',
    summary:
      'Independent practices routinely lose collectible revenue to preventable front-end rejections and slow denial follow-up. We establish measurable clean-claim controls whether billing is in-house or outsourced.',
    deliverables: [
      'Denial root-cause breakdown by payer edit, coding mismatch, eligibility lag, and timely-filing risk',
      'Clearinghouse rejection rule tuning so recurring claim scrubs happen before submission, not manually',
      'Billing vendor or internal RCM KPI scorecard (first-pass yield, days in AR, denial turnaround)',
    ],
  },
  {
    number: '03',
    title: 'Vendor Selection & Contract Advisory',
    subtitle: 'Vendor-neutral EHR, PM, and RCM comparisons before you sign a multi-year contract.',
    summary:
      'No vendor kickbacks and no pay-to-play shortlists. We help you evaluate whether an overlay tool solves your gap or whether a full EHR/RCM transition is genuinely justified.',
    deliverables: [
      'Shortlist calibration across ambulatory EHRs, RCM overlays, and managed billing partners',
      'Live demo scorecards focused on your real clinic workflows rather than canned sales scripts',
      'Contract & pricing term review to flag auto-renewals, data export fees, and hidden per-claim surcharges',
    ],
  },
];

export function ServicesPage({ onStartDiagnostic, onGoHome }: ServicesPageProps) {
  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#0F766E] dark:text-slate-300 dark:hover:text-[#39FF14] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to overview</span>
        </button>

        {/* Hero / Header */}
        <div className="mt-6 grid grid-cols-1 items-stretch gap-8 border-b border-slate-200 pb-12 dark:border-white/10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs font-bold tracking-wider text-[#0F766E] dark:text-[#39FF14]">
              EMR PULSE ADVISORY SERVICES
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,3.6vw,3.1rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance">
              Practical healthcare IT and RCM advisory built for independent practices.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
              Led by Syed Zahid Ali (Mr. Ali), EMR Pulse helps medical practices resolve denial
              leakage, prior-authorization drag, and EHR workflow bottlenecks—with zero vendor
              affiliations and conservative, evidence-based projections.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0A192F] dark:shadow-none lg:col-span-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Ready to review your bottleneck?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Bring your diagnostic output to a 15-minute call. No sales pitch—just clear next
                steps for your practice.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void trackEvent('calendly_click', { location: 'services_hero' })}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14]"
              >
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Book a free 15-min call</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-[#39FF14]/60 dark:hover:text-[#39FF14] cursor-pointer"
              >
                <span>Run the free diagnostic</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Advisory Pillars */}
        <div className="mt-12 space-y-8">
          {SERVICE_PILLARS.map((pillar) => (
            <article
              key={pillar.number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.03] dark:shadow-none sm:p-8"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <span className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                    {pillar.number}.
                  </span>
                  <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {pillar.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {pillar.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {pillar.summary}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-5 dark:border-white/10 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    What We Deliver
                  </h3>
                  <ul className="mt-4 space-y-3.5">
                    {pillar.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Trust + Action Strip */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.03] dark:shadow-none sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] dark:text-[#39FF14]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>100% Vendor-Neutral · Zero PHI Required</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
              Not sure whether to fix your current workflow or evaluate a new platform?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Start with the 100% free branching diagnostic or schedule a direct 15-minute review
              with Mr. Ali.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap cursor-pointer"
            >
              <span>Run Free Diagnostic</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent('calendly_click', { location: 'services_footer' })}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-[#39FF14]/60 dark:hover:text-[#39FF14] whitespace-nowrap"
            >
              <span>Schedule 15-min call</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
