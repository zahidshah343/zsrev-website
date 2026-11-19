import {
  ArrowRight,
  FileSearch,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { VENDOR_CATALOG } from '../data/questions';
import { FreeCalculators } from './FreeCalculators';
import { PainPointsSections } from './PainPointsSections';

interface LandingViewProps {
  onStartDiagnostic: () => void;
  onNavigateBenchmark?: () => void;
  onNavigateDenialCheck?: () => void;
  onNavigateNpiLookup?: () => void;
  onNavigatePayerDirectory?: () => void;
  onNavigateCredentialingChecklist?: () => void;
  onNavigateModifierGuide?: () => void;
  onNavigateTimelyFiling?: () => void;
}

const ANALYTICS_FRAMEWORK = [
  {
    step: '01',
    name: 'Descriptive',
    question: 'What happened?',
    detail: 'Your branching workflow checkpoints establish an immediate operational baseline.',
    Icon: FileSearch,
  },
  {
    step: '02',
    name: 'Diagnostic',
    question: 'Why did it happen?',
    detail: 'Pinpoints hidden root causes across claim lag, charting load, and staff ratio.',
    Icon: Search,
  },
  {
    step: '03',
    name: 'Predictive',
    question: 'What is likely to happen?',
    detail: 'Projects annual revenue leakage and clinician burnout exposure.',
    Icon: TrendingUp,
  },
  {
    step: '04',
    name: 'Prescriptive',
    question: 'What should we do?',
    detail: 'Delivers a prioritized category roadmap and unaffiliated partner matches.',
    Icon: Settings,
  },
];

export function LandingView({
  onStartDiagnostic,
  onNavigateBenchmark,
  onNavigateDenialCheck,
  onNavigateNpiLookup,
  onNavigatePayerDirectory,
  onNavigateCredentialingChecklist,
  onNavigateModifierGuide,
  onNavigateTimelyFiling,
}: LandingViewProps) {
  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#0F766E]/10 blur-3xl dark:bg-[#39FF14]/8"
        />

        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-[#0F766E] dark:text-[#39FF14]">
              <span>Vendor-neutral practice diagnostic</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                ·
              </span>
              <span className="text-slate-700 dark:text-slate-300">4-Stage Analytics Engine</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                ·
              </span>
              <span className="text-slate-700 dark:text-slate-300">No patient data</span>
            </div>

            <h1 className="font-display text-[clamp(2.2rem,4vw,3.35rem)] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white text-balance">
              Find out what&apos;s really costing your practice time and money — in 2 minutes.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-700 dark:text-slate-300 tracking-[0.01em] sm:text-lg">
              Built for all EMR, Practice Management (PM), RCM, and full-suite EHR teams. EMR Pulse, a ZSREV product, is strictly vendor-neutral — no pay-to-play rankings, no sales spin, and zero patient health information collected. Turn a quick branching assessment into a conservative Descriptive-to-Prescriptive roadmap.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#0F766E] px-6 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:shadow-[0_0_24px_rgba(57,255,20,0.22)] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Start Free Diagnostic</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <span className="text-sm text-slate-600 dark:text-slate-400">
                100% free · No credit card required · Instant report &amp; PDF export
              </span>
            </div>
          </div>

          {/* Professional Humanized Medical Practice Image */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-white/12 dark:bg-[#0B1017]">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                alt="Medical practice manager reviewing analytics in clinic office"
                referrerPolicy="no-referrer"
                className="h-[380px] w-full object-cover object-center transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-display text-base font-bold">Independent Practice Advisory</p>
                <p className="text-xs text-slate-200">
                  Data-driven clarity for outpatient clinics, primary care, and specialty groups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tools Section (No Login / No Email Gate) */}
      <FreeCalculators
        onStartDiagnostic={onStartDiagnostic}
        onNavigateBenchmark={onNavigateBenchmark}
        onNavigateDenialCheck={onNavigateDenialCheck}
        onNavigateNpiLookup={onNavigateNpiLookup}
        onNavigatePayerDirectory={onNavigatePayerDirectory}
        onNavigateCredentialingChecklist={onNavigateCredentialingChecklist}
        onNavigateModifierGuide={onNavigateModifierGuide}
        onNavigateTimelyFiling={onNavigateTimelyFiling}
      />

      {/* Two Collapsible Diagnostic Pain-Point Sections */}
      <PainPointsSections onStartDiagnostic={onStartDiagnostic} />

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-t border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-[#0B1017] sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
              Direct, consultative triage before you sit through a vendor demo.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              Most healthcare practices and RCM teams replace an entire EHR when they only needed an
              ambient scribe, PM overlay, or tighter denial workflow — or stay on a passive record
              system that quietly drains revenue.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border-t border-slate-200 pt-5 dark:border-white/15">
              <p className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                01
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                Capture Descriptive Baseline
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Choose your practice&apos;s biggest struggle—Billing &amp; RCM, Clinical &amp;
                Admin, or General Workflow—and answer 4–5 fast multiple-choice checkpoints.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-5 dark:border-white/15">
              <p className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                02
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                Diagnose &amp; Forecast Impact
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Uncover root operational risks and review a predictive estimate of annual revenue
                leakage and clinician burnout exposure.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-5 dark:border-white/15">
              <p className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                03
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                Execute Prescriptive Action
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Review your prioritized solution category, unlock tailored EMR/RCM partner cards, or
                book a 15-minute diagnostic call with Mr. Ali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Covered */}
      <section
        id="vendors"
        className="border-t border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-[#070A0E] sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-white/10 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                EMR, Practice Management, RCM &amp; Full-Suite EHR platforms evaluated
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Vendor-neutral recommendation — EMR Pulse is not affiliated with these vendors.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-[#0F766E] bg-teal-50 px-4 py-2 text-sm font-semibold text-[#0F766E] transition-colors hover:bg-[#0F766E] hover:text-white dark:border-[#39FF14]/50 dark:bg-[#39FF14]/10 dark:text-[#39FF14] dark:hover:bg-[#39FF14] dark:hover:text-[#070A0E] whitespace-nowrap shrink-0 cursor-pointer"
            >
              See your match
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VENDOR_CATALOG.map((vendor) => (
              <div
                key={vendor.name}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-sm dark:shadow-none"
              >
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {vendor.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {vendor.profile}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="border-t border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-[#070A0E] sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.03] dark:shadow-none sm:p-10">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-white/10 sm:flex-row sm:items-center">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  About EMR Pulse
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
                  Built to give independent practices clarity before they sign another contract.
                </h2>
              </div>

              <a
                href="https://linkedin.com/in/zahidshahh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Mr. Ali on LinkedIn (opens in a new tab)"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-[#0A66C2] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#004182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66C2] whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>Connect with Mr. Ali on LinkedIn</span>
              </a>
            </div>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                EMR Pulse was built by Syed Zahid Ali, a Healthcare IT &amp; RCM advisor who has
                spent years working with independent practices across the US. After watching too
                many providers get buried under unusual contract terms, vendor lock-in, and endless
                discovery calls that go nowhere, he built this platform to change the conversation.
              </p>
              <p>
                EMR Pulse is not here to pick a fight with any vendor. It&apos;s here to give
                providers and practice managers real-time, data-driven clarity on where their
                revenue is leaking and which workflow gaps are costing them the most—before they
                sign another contract.
              </p>
              <p>
                If you&apos;re tired of navigating the EMR/RCM maze alone, the diagnostic takes a
                few quick questions. No PHI. No patient data. Just a clear map of where to look
                next.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <ShieldCheck
                  className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]"
                  aria-hidden="true"
                />
                <span>Vendor-neutral · 100% free · Zero PHI collected</span>
              </div>

              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Start Your Free Diagnostic</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* No-PHI Pledge */}
      <section
        id="no-phi"
        className="border-t border-slate-200 bg-white py-14 dark:border-white/10 dark:bg-[#0B1017] sm:py-16"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Zero Protected Health Information (No PHI)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              EMR Pulse collects operational workflow indicators only. Never enter patient names,
              dates of birth, medical record numbers, payer IDs, or clinical chart notes anywhere in
              this diagnostic.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartDiagnostic}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Start 2-minute diagnostic</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}
