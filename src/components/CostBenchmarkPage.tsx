import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronDown,
  Info,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CALENDLY_URL } from '../data/questions';
import { trackEvent } from '../lib/analytics';

interface CostBenchmarkPageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

export interface CptOption {
  code: string;
  description: string;
  medicareRate: number;
  commercialAverage: number;
  medicaidRate: number;
  category: string;
}

export type Specialty =
  | 'Primary Care'
  | 'Cardiology'
  | 'Orthopedics'
  | 'Behavioral Health'
  | 'Multi-Specialty';

export const SPECIALTIES: Specialty[] = [
  'Primary Care',
  'Cardiology',
  'Orthopedics',
  'Behavioral Health',
  'Multi-Specialty',
];

/**
 * Backend Data Sync Strategy:
 * This static mock database mirrors the annual CMS Fee Schedule and commercial payer fee index.
 * In production, this data should be automatically synced every 24 hours via a scheduled Cloud Function
 * fetching the latest Federal Register and clearinghouse rate benchmarks, replacing this static constant with an API endpoint call.
 */
export const CPT_DATABASE_BY_SPECIALTY: Record<Specialty, CptOption[]> = {
  'Primary Care': [
    {
      code: 'CPT 99214',
      description: 'Office / outpatient visit, established patient, 30–39 minutes',
      medicareRate: 128.45,
      commercialAverage: 198.50,
      medicaidRate: 92.10,
      category: 'Evaluation & Management (E/M)',
    },
    {
      code: 'CPT 99213',
      description: 'Office / outpatient visit, established patient, 20–29 minutes',
      medicareRate: 91.20,
      commercialAverage: 142.30,
      medicaidRate: 68.40,
      category: 'Evaluation & Management (E/M)',
    },
    {
      code: 'CPT 99396',
      description: 'Periodic comprehensive preventive medicine reevaluation, established patient, 40-64 years',
      medicareRate: 155.00,
      commercialAverage: 235.00,
      medicaidRate: 110.00,
      category: 'Preventive Medicine',
    },
    {
      code: 'CPT 36415',
      description: 'Routine venipuncture (blood draw) from patient',
      medicareRate: 4.50,
      commercialAverage: 16.80,
      medicaidRate: 3.20,
      category: 'Laboratory Services',
    },
  ],
  'Cardiology': [
    {
      code: 'CPT 93000',
      description: 'Electrocardiogram (ECG/EKG), routine with interpretation and report',
      medicareRate: 29.80,
      commercialAverage: 74.20,
      medicaidRate: 21.00,
      category: 'Cardiology & Diagnostics',
    },
    {
      code: 'CPT 93306',
      description: 'Echocardiography, transthoracic, real-time with image documentation',
      medicareRate: 185.40,
      commercialAverage: 420.00,
      medicaidRate: 135.00,
      category: 'Cardiology Imaging',
    },
    {
      code: 'CPT 93452',
      description: 'Left heart catheterization including coronary angiography',
      medicareRate: 450.00,
      commercialAverage: 1150.00,
      medicaidRate: 340.00,
      category: 'Invasive Cardiology',
    },
  ],
  'Orthopedics': [
    {
      code: 'CPT 27447',
      description: 'Arthroplasty, knee, condyle and plateau; total knee replacement',
      medicareRate: 1420.00,
      commercialAverage: 3850.00,
      medicaidRate: 1050.00,
      category: 'Joint Surgery',
    },
    {
      code: 'CPT 29881',
      description: 'Arthroscopy, knee, surgical; with meniscectomy (medial or lateral)',
      medicareRate: 580.00,
      commercialAverage: 1450.00,
      medicaidRate: 420.00,
      category: 'Arthroscopic Surgery',
    },
    {
      code: 'CPT 99213',
      description: 'Office / outpatient visit, established patient, 20–29 minutes',
      medicareRate: 91.20,
      commercialAverage: 142.30,
      medicaidRate: 68.40,
      category: 'Evaluation & Management (E/M)',
    },
  ],
  'Behavioral Health': [
    {
      code: 'CPT 90834',
      description: 'Psychotherapy, 45 minutes with patient',
      medicareRate: 105.50,
      commercialAverage: 175.00,
      medicaidRate: 85.00,
      category: 'Psychotherapy',
    },
    {
      code: 'CPT 90791',
      description: 'Psychiatric diagnostic evaluation without medical services',
      medicareRate: 165.00,
      commercialAverage: 250.00,
      medicaidRate: 120.00,
      category: 'Diagnostic Evaluation',
    },
    {
      code: 'CPT 90837',
      description: 'Psychotherapy, 60 minutes with patient',
      medicareRate: 138.00,
      commercialAverage: 220.00,
      medicaidRate: 105.00,
      category: 'Psychotherapy',
    },
  ],
  'Multi-Specialty': [
    {
      code: 'CPT 99214',
      description: 'Office / outpatient visit, established patient, 30–39 minutes',
      medicareRate: 128.45,
      commercialAverage: 198.50,
      medicaidRate: 92.10,
      category: 'Evaluation & Management (E/M)',
    },
    {
      code: 'CPT 93000',
      description: 'Electrocardiogram (ECG/EKG), routine with interpretation and report',
      medicareRate: 29.80,
      commercialAverage: 74.20,
      medicaidRate: 21.00,
      category: 'Cardiology & Diagnostics',
    },
    {
      code: 'CPT 27447',
      description: 'Arthroplasty, knee, total knee replacement',
      medicareRate: 1420.00,
      commercialAverage: 3850.00,
      medicaidRate: 1050.00,
      category: 'Joint Surgery',
    },
    {
      code: 'CPT 90834',
      description: 'Psychotherapy, 45 minutes with patient',
      medicareRate: 105.50,
      commercialAverage: 175.00,
      medicaidRate: 85.00,
      category: 'Psychotherapy',
    },
    {
      code: 'CPT 71046',
      description: 'Chest X-ray, 2 views, frontal and lateral',
      medicareRate: 38.60,
      commercialAverage: 115.40,
      medicaidRate: 27.50,
      category: 'Radiology & Imaging',
    },
  ],
};

const PAYER_LIST = [
  'All Payers (Comparative Average)',
  'Medicare Fee-for-Service',
  'Blue Cross Blue Shield (Commercial PPO)',
  'Aetna Health Network',
  'UnitedHealthcare Commercial',
  'State Medicaid Managed Care',
] as const;

export function CostBenchmarkPage({
  onStartDiagnostic,
}: CostBenchmarkPageProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>('Primary Care');
  const availableCodes = CPT_DATABASE_BY_SPECIALTY[selectedSpecialty];
  const [selectedCode, setSelectedCode] = useState<string>(availableCodes[0].code);
  const [selectedPayer, setSelectedPayer] = useState<string>('All Payers (Comparative Average)');

  // Pulse AI Search state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const handleSpecialtyChange = (newSpecialty: Specialty) => {
    setSelectedSpecialty(newSpecialty);
    const codesForNew = CPT_DATABASE_BY_SPECIALTY[newSpecialty];
    if (codesForNew && codesForNew.length > 0) {
      setSelectedCode(codesForNew[0].code);
    }
  };

  const activeCpt =
    availableCodes.find((item) => item.code === selectedCode) ?? availableCodes[0];

  const handleAiSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiSearching(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/pulse-ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      setAiResponse(data.answer || "I don't have benchmark data for this code yet");
    } catch {
      setAiResponse("I don't have benchmark data for this code yet");
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-sky-50 via-teal-50/20 to-slate-50 text-slate-900 dark:from-[#070A0E] dark:via-[#0B1521] dark:to-[#070A0E] dark:text-[#F1F5F9]">
      {/* HERO SECTION */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/25 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0F766E] shadow-sm backdrop-blur-md dark:border-[#39FF14]/30 dark:bg-white/[0.04] dark:text-[#39FF14]">
            <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>EMR Pulse Free Tool · 2026 Fee Schedule &amp; Cost Benchmarking</span>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.25rem,4vw,3.6rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-4xl">
            Compare CPT Codes Across Payer Schedules
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Transparently compare Medicare, commercial insurance, and Medicaid reimbursement benchmarks across common CPT codes and specialties. Zero PHI required.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                void trackEvent('calendly_click', { location: 'benchmark_sample' });
                document.getElementById('benchmark-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-sm dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap cursor-pointer"
            >
              <span>Explore Sample Data</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>

            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent('calendly_click', { location: 'benchmark_hero' })}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:border-[#39FF14]/60 dark:hover:text-[#39FF14] whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Book a Demo</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* CORE FUNCTIONALITY: SELECTORS & COMPARATIVE BAR CHART */}
      <section id="benchmark-tool" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-white/10 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                Interactive Reimbursement Analyzer
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                Compare CPT Codes Across Payer Schedules
              </h2>
            </div>

            {/* Pulse AI Search trigger */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-teal-700/30 bg-teal-50 px-4 py-2 text-xs font-bold text-[#0F766E] transition-colors hover:bg-teal-100 dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14] dark:hover:bg-[#39FF14]/20 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Ask Pulse AI</span>
            </button>
          </div>

          {/* Selectors: Specialty, Code, Payer */}
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="specialty-select"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Select Specialty
              </label>
              <div className="relative">
                <select
                  id="specialty-select"
                  value={selectedSpecialty}
                  onChange={(e) => handleSpecialtyChange(e.target.value as Specialty)}
                  className="min-h-[50px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 py-3 text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                >
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
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
                htmlFor="cpt-select"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Select Medical Code (CPT)
              </label>
              <div className="relative">
                <select
                  id="cpt-select"
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                  className="min-h-[50px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 py-3 text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                >
                  {availableCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} — {item.description.slice(0, 42)}...
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
                htmlFor="payer-select"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Select Payer Network
              </label>
              <div className="relative">
                <select
                  id="payer-select"
                  value={selectedPayer}
                  onChange={(e) => setSelectedPayer(e.target.value)}
                  className="min-h-[50px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-10 py-3 text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                >
                  {PAYER_LIST.map((payer) => (
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
          </div>

          {/* Active Code Meta Banner */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14]">
                {activeCpt.code} · {activeCpt.category} ({selectedSpecialty})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Selected Filter: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPayer}</span>
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white">
              {activeCpt.description}
            </p>
          </div>

          {/* COMPARATIVE BAR CHART (CSS-based responsive bars) */}
          <div className="mt-8">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Comparative Reimbursement Analysis (Per Encounter)
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              National and regional clearinghouse averages for {activeCpt.code}.
            </p>

            <div className="mt-6 space-y-4">
              {/* Commercial Average Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">Commercial PPO Average</span>
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                    ${activeCpt.commercialAverage.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#0F766E] dark:bg-[#39FF14] transition-all duration-300"
                    style={{ width: `${Math.min(100, (activeCpt.commercialAverage / 3000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Medicare Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">Medicare Baseline (RBRVS)</span>
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                    ${activeCpt.medicareRate.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-teal-600 dark:bg-teal-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (activeCpt.medicareRate / 3000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Medicaid Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">State Medicaid Managed Care</span>
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                    ${activeCpt.medicaidRate.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (activeCpt.medicaidRate / 3000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]" aria-hidden="true" />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Commercial realization is <span className="font-bold text-slate-900 dark:text-white">+{Math.round(((activeCpt.commercialAverage - activeCpt.medicareRate) / activeCpt.medicareRate) * 100)}%</span> above Medicare baseline for this code.
                </span>
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                Source: 2026 Clearinghouse &amp; Payer Index
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PULSE AI SEARCH MODAL / WIDGET */}
      {isAiModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/15 dark:bg-[#0B1017] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-[#0F766E] dark:bg-[#39FF14]/15 dark:text-[#39FF14]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Ask Pulse AI (Clinical &amp; RCM Data Search)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setAiQuery('');
                  setAiResponse(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Query 2026 fee schedules, CPT modifiers, or regional payer denial benchmarks in plain English.
            </p>

            <form onSubmit={handleAiSearchSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="ai-query-input" className="sr-only">
                  Search query
                </label>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="ai-query-input"
                    type="text"
                    required
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g. Average commercial multiplier for CPT 99214, or common denial reasons for BCBS"
                    className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#39FF14]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isAiSearching}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] disabled:opacity-60 dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap cursor-pointer"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>{isAiSearching ? 'Analyzing Benchmarks...' : 'Ask Pulse AI'}</span>
                </button>
              </div>
            </form>

            {aiResponse && (
              <div
                role="region"
                aria-label="AI Search Result"
                className="mt-5 rounded-xl border border-teal-700/30 bg-teal-50/70 p-4 text-sm text-slate-800 dark:border-[#39FF14]/35 dark:bg-[#39FF14]/[0.06] dark:text-slate-200"
              >
                <p className="font-bold text-[#0F766E] dark:text-[#39FF14]">Pulse AI Intelligence Result</p>
                <p className="mt-1.5 leading-relaxed text-xs sm:text-sm">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM CTA: STANDARDIZED EMR PULSE DIAGNOSTIC REDIRECT */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-teal-700/25 bg-white p-8 text-center shadow-sm dark:border-[#39FF14]/30 dark:bg-[#0A192F] dark:shadow-none sm:flex-row sm:text-left sm:p-10">
          <div className="max-w-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0F766E] dark:text-[#39FF14] sm:justify-start">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>100% Free · Vendor-Neutral Advisory</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
              Want to know how these rates impact your overall practice revenue?
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Run the full diagnostic to quantify your specific denial exposure and AR aging lag in 2 minutes.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-md dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap cursor-pointer"
            >
              <span>Run the full diagnostic</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
