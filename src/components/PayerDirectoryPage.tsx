import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Network, Search } from 'lucide-react';

interface PayerDirectoryPageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

interface PayerEntry {
  id: string;
  payerName: string;
  networkOrClearinghouse: string;
  category: 'Clearinghouse' | 'Medicare MAC' | 'Commercial' | 'Medicaid';
  eraEftPayerId: string;
  portalName: string;
  portalUrl: string;
  notes: string;
}

const PAYER_DIRECTORY: PayerEntry[] = [
  {
    id: 'availity',
    payerName: 'Availity Essentials (Multi-Payer Portal)',
    networkOrClearinghouse: 'Availity Clearinghouse',
    category: 'Clearinghouse',
    eraEftPayerId: 'AVAIL / Multi-Payer',
    portalName: 'Availity Essentials Portal',
    portalUrl: 'https://www.availity.com/',
    notes: 'Primary gateway for Anthem/Elevance, BCBS plans, Aetna, and Humana 835 ERA/EFT enrollment.',
  },
  {
    id: 'optum',
    payerName: 'Optum / UnitedHealthcare (Optum Pay)',
    networkOrClearinghouse: 'Optum / Change Healthcare',
    category: 'Clearinghouse',
    eraEftPayerId: '87726 (UHC Commercial)',
    portalName: 'Optum Pay & Provider Portal',
    portalUrl: 'https://www.optum.com/',
    notes: 'Centralizes ERA/EFT enrollment and claim status inquiries for UnitedHealthcare & Oxford.',
  },
  {
    id: 'mac-novitas',
    payerName: 'Medicare MAC — Novitas Solutions (JH & JL)',
    networkOrClearinghouse: 'Medicare Part A/B MAC',
    category: 'Medicare MAC',
    eraEftPayerId: '04412 (JL) / 04402 (JH)',
    portalName: 'Novitasphere Portal',
    portalUrl: 'https://www.novitas-solutions.com/',
    notes: 'Covers PA, NJ, MD, DE, DC (JL) and TX, CO, NM, OK, AR, LA, MS (JH).',
  },
  {
    id: 'mac-ngs',
    payerName: 'Medicare MAC — National Government Services (NGS)',
    networkOrClearinghouse: 'Medicare Part A/B MAC',
    category: 'Medicare MAC',
    eraEftPayerId: '13202 (J6) / 13292 (JK)',
    portalName: 'NGSConnex Portal',
    portalUrl: 'https://www.ngsmedicare.com/',
    notes: 'Covers NY, CT, MA, ME, NH, RI, VT (JK) and IL, MN, WI (J6).',
  },
  {
    id: 'mac-palmetto',
    payerName: 'Medicare MAC — Palmetto GBA (JJ & JM)',
    networkOrClearinghouse: 'Medicare Part A/B MAC',
    category: 'Medicare MAC',
    eraEftPayerId: '11202 (JM) / 10202 (JJ)',
    portalName: 'eServices Portal',
    portalUrl: 'https://www.palmettogba.com/',
    notes: 'Covers NC, SC, VA, WV (JM) and AL, GA, TN (JJ) plus Railroad Medicare.',
  },
  {
    id: 'mac-noridian',
    payerName: 'Medicare MAC — Noridian Healthcare Solutions (JE & JF)',
    networkOrClearinghouse: 'Medicare Part A/B MAC',
    category: 'Medicare MAC',
    eraEftPayerId: '01112 (JE) / 02102 (JF)',
    portalName: 'Noridian Medicare Portal',
    portalUrl: 'https://med.noridianmedicare.com/',
    notes: 'Covers CA, NV, HI (JE) and WA, OR, AZ, UT, ID, MT, WY, AK, ND, SD (JF).',
  },
  {
    id: 'aetna',
    payerName: 'Aetna (Commercial & Medicare Advantage)',
    networkOrClearinghouse: 'Availity / Change Healthcare',
    category: 'Commercial',
    eraEftPayerId: '60054',
    portalName: 'Aetna Provider Portal (via Availity)',
    portalUrl: 'https://www.aetna.com/health-care-professionals.html',
    notes: 'Use Payer ID 60054 for standard 837P claims and 835 ERA remittance setup.',
  },
  {
    id: 'cigna',
    payerName: 'Cigna Healthcare',
    networkOrClearinghouse: 'Cigna for Health Care Professionals',
    category: 'Commercial',
    eraEftPayerId: '62308',
    portalName: 'CignaforHCP Portal',
    portalUrl: 'https://cignaforhcp.cigna.com/',
    notes: 'Supports electronic eligibility, prior auth, and EFT enrollment via ECHO / PaySpan.',
  },
  {
    id: 'humana',
    payerName: 'Humana (Commercial & MA)',
    networkOrClearinghouse: 'Availity',
    category: 'Commercial',
    eraEftPayerId: '61101',
    portalName: 'Humana Provider Portal (Availity)',
    portalUrl: 'https://www.humana.com/provider',
    notes: 'Standard Payer ID 61101 for Medicare Advantage and commercial plans.',
  },
  {
    id: 'medicaid-tmhp',
    payerName: 'State Medicaid FFS Reference (e.g., TMHP / eMedNY)',
    networkOrClearinghouse: 'State Medicaid Portal',
    category: 'Medicaid',
    eraEftPayerId: '77022 (TX) / EMEDNY (NY)',
    portalName: 'State Medicaid EDI Portal',
    portalUrl: 'https://www.medicaid.gov/',
    notes: 'Verify state-specific 835 ERA enrollment and Trading Partner IDs prior to billing.',
  },
];

const CATEGORIES: Array<'All' | PayerEntry['category']> = [
  'All',
  'Clearinghouse',
  'Medicare MAC',
  'Commercial',
  'Medicaid',
];

export function PayerDirectoryPage({ onStartDiagnostic }: PayerDirectoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | PayerEntry['category']>('All');

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PAYER_DIRECTORY.filter((entry) => {
      const matchesCat = activeCategory === 'All' || entry.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        entry.payerName.toLowerCase().includes(q) ||
        entry.networkOrClearinghouse.toLowerCase().includes(q) ||
        entry.eraEftPayerId.toLowerCase().includes(q) ||
        entry.portalName.toLowerCase().includes(q) ||
        entry.notes.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeCategory]);

  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-12">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            EMR Pulse Free Tool · Billing &amp; Front-Desk EDI Reference
          </p>

          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-3xl">
            Payer Portal &amp; EDI Directory
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Quickly locate clearinghouse gateways, Medicare Administrative Contractor (MAC) portals, and ERA/EFT Payer IDs for claim submission and remittance setup.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          {/* Search and Category Controls */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-white/10">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="payer-directory-search" className="sr-only">
                Search payers, MACs, portals, or Payer IDs
              </label>
              <input
                id="payer-directory-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by payer name, MAC, clearinghouse, or ERA/EFT Payer ID (e.g., Availity, Optum, 87726)..."
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by payer category">
                {CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`min-h-[36px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'border-[#0F766E] bg-[#0F766E] text-white dark:border-[#39FF14] dark:bg-[#39FF14] dark:text-[#070A0E]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/12 dark:bg-white/[0.03] dark:text-slate-300'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Showing {filteredEntries.length} of {PAYER_DIRECTORY.length} entries
              </span>
            </div>
          </div>

          {/* Directory Results */}
          {filteredEntries.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
              <Network className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                No matching payers found
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Try clearing your search or switching back to All categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="mt-4 inline-flex min-h-[38px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-white cursor-pointer"
              >
                Reset Directory Filters
              </button>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-200 dark:divide-white/10">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col justify-between gap-4 py-5 first:pt-1 last:pb-1 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-[#0F766E] dark:text-[#39FF14]">
                        {entry.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.networkOrClearinghouse}</span>
                    </div>

                    <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      {entry.payerName}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {entry.notes}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2 shrink-0">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left sm:text-right dark:border-white/10 dark:bg-[#070A0E]">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        ERA / EFT Payer ID
                      </span>
                      <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {entry.eraEftPayerId}
                      </span>
                    </div>

                    <a
                      href={entry.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-teal-700/30 bg-teal-50 px-3.5 py-2 text-xs font-bold text-[#0F766E] transition-colors hover:bg-[#0F766E] hover:text-white dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14] dark:hover:bg-[#39FF14] dark:hover:text-[#070A0E] whitespace-nowrap shrink-0"
                    >
                      <span>{entry.portalName}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                </div>
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
