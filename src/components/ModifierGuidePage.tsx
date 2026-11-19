import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Search, ShieldAlert } from 'lucide-react';

interface ModifierGuidePageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

interface ModifierEntry {
  code: string;
  title: string;
  category: 'E/M Bundling' | 'NCCI Distinct Service (X{EPSU})';
  whenToUse: string;
  rejectionTrap: string;
  example: string;
}

const MODIFIER_ENTRIES: ModifierEntry[] = [
  {
    code: 'Modifier 25',
    title: 'Significant, Separately Identifiable E/M Service',
    category: 'E/M Bundling',
    whenToUse:
      'Append to an Evaluation & Management (E/M) code (e.g., 99213/99214) when performed on the same date as a minor procedure or preventive visit that requires distinct medical decision-making.',
    rejectionTrap:
      'Never append Modifier 25 when the E/M only reflects routine pre-procedure evaluation or consenting for the procedure itself (triggers CO-97 / CO-4 payer audits).',
    example: '99214-25 billed alongside 20610 (joint injection) when a separate chronic condition is also evaluated and documented.',
  },
  {
    code: 'Modifier 59',
    title: 'Distinct Procedural Service',
    category: 'NCCI Distinct Service (X{EPSU})',
    whenToUse:
      'Use only as a last resort to bypass a Medicare NCCI PTP edit when two procedures are distinct and none of the more specific X{EPSU} modifiers (XE, XP, XS, XU) apply.',
    rejectionTrap:
      'Overusing Modifier 59 instead of XE/XP/XS/XU is a top commercial and MAC audit flag leading to automatic CO-4 bundling rejections.',
    example: 'Two non-adjacent diagnostic procedures where anatomical site or encounter specificity does not align with XS/XE.',
  },
  {
    code: 'Modifier XE',
    title: 'Separate Encounter',
    category: 'NCCI Distinct Service (X{EPSU})',
    whenToUse:
      'Append when a service is distinct because it occurred during a completely separate encounter on the same calendar date.',
    rejectionTrap:
      'Documentation must clearly establish two distinct timestamps/visits rather than a single continuous clinic stay.',
    example: 'Morning office wound check followed by an afternoon return visit for an acute allergic reaction.',
  },
  {
    code: 'Modifier XP',
    title: 'Separate Practitioner',
    category: 'NCCI Distinct Service (X{EPSU})',
    whenToUse:
      'Append when two NCCI-bundled services are performed on the same date of service by different practitioners (different NPIs / specialties).',
    rejectionTrap:
      'Do not use if both providers belong to the same group billing under identical specialty taxonomy for shared follow-up care.',
    example: 'Cardiologist and pulmonologist in the same multispecialty group performing distinct diagnostic tests on the same day.',
  },
  {
    code: 'Modifier XS',
    title: 'Separate Structure',
    category: 'NCCI Distinct Service (X{EPSU})',
    whenToUse:
      'Append when a procedure is performed on a separate organ or distinct anatomical structure (e.g., separate lesion, separate joint, or contralateral limb).',
    rejectionTrap:
      'Chart notes and ICD-10 laterality codes must explicitly specify distinct anatomical sites to survive automated prepayment review.',
    example: 'Lesion excision on the left forearm billed alongside a biopsy on the right shoulder.',
  },
  {
    code: 'Modifier XU',
    title: 'Unusual Non-Overlapping Service',
    category: 'NCCI Distinct Service (X{EPSU})',
    whenToUse:
      'Append when a service is distinct because it does not overlap the usual components of the primary service performed on the same day.',
    rejectionTrap:
      'Ensure the clinical record demonstrates why the secondary procedure was clinically non-overlapping and medically necessary.',
    example: 'Diagnostic testing performed alongside an unrelated therapeutic intervention during the same outpatient session.',
  },
];

export function ModifierGuidePage({ onStartDiagnostic }: ModifierGuidePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModifiers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MODIFIER_ENTRIES;
    return MODIFIER_ENTRIES.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.whenToUse.toLowerCase().includes(q) ||
        item.rejectionTrap.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-12">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            EMR Pulse Free Tool · CPT &amp; NCCI Unbundling Reference
          </p>

          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-3xl">
            CPT / ICD-10 Modifier &amp; Bundling Guide
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Quick-reference rules for high-scrutiny CPT modifiers (25, 59, XE, XP, XS, XU) to eliminate CO-4 and CO-97 claim rejections before submission.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          {/* Search Input */}
          <div className="border-b border-slate-200 pb-6 dark:border-white/10">
            <label htmlFor="modifier-search-input" className="sr-only">
              Search CPT modifiers and bundling rules
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="modifier-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modifier code or scenario (e.g., 25, 59, XE, XS, joint injection, separate encounter)..."
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Jump to:</span>
              {MODIFIER_ENTRIES.map((mod) => (
                <button
                  key={mod.code}
                  type="button"
                  onClick={() => setSearchQuery(mod.code.replace('Modifier ', ''))}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-[#39FF14] dark:hover:text-[#39FF14] cursor-pointer"
                >
                  {mod.code.replace('Modifier ', '')}
                </button>
              ))}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-auto text-xs font-semibold text-[#0F766E] underline underline-offset-2 dark:text-[#39FF14] cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>
          </div>

          {/* Modifier Cards */}
          {filteredModifiers.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
              <BookOpen className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                No modifiers match &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex min-h-[38px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-white cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredModifiers.map((mod) => (
                <article
                  key={mod.code}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-[#070A0E]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
                      <span className="font-mono text-base font-extrabold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                        {mod.code}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {mod.category}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                      {mod.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {mod.whenToUse}
                    </p>

                    <p className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-[#0B1017] dark:text-slate-400">
                      <strong className="text-slate-900 dark:text-white">Example:</strong> {mod.example}
                    </p>
                  </div>

                  <div className="mt-4 flex items-start gap-2 pt-2 text-xs text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      <strong>Avoid Rejection:</strong> {mod.rejectionTrap}
                    </span>
                  </div>
                </article>
              ))}
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
