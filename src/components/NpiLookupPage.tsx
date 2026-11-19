import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  Stethoscope,
} from 'lucide-react';

interface NpiLookupPageProps {
  onStartDiagnostic: () => void;
  onGoHome: () => void;
}

interface NpiAddress {
  line1: string;
  cityStateZip: string;
  phone: string;
  purpose: string;
}

interface NpiTaxonomy {
  code: string;
  desc: string;
  primary: boolean;
  state: string;
  license: string;
}

interface NpiLookupResult {
  found: boolean;
  npi: string;
  enumerationType: string;
  status: string;
  providerName: string;
  primaryTaxonomy: {
    code: string;
    desc: string;
    state: string;
    license: string;
  } | null;
  taxonomies: NpiTaxonomy[];
  billingAddress: NpiAddress | null;
  practiceAddress: NpiAddress | null;
  error?: string;
}

const SAMPLE_NPIS = [
  { npi: '1881018208', label: 'Mayo Clinic (Org)' },
  { npi: '1003000126', label: 'Sample Provider' },
];

export function NpiLookupPage({ onStartDiagnostic }: NpiLookupPageProps) {
  const [npiInput, setNpiInput] = useState('1881018208');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<NpiLookupResult | null>(null);

  const runLookup = async (targetNpi: string) => {
    const clean = targetNpi.replace(/\D/g, '');
    if (!/^\d{10}$/.test(clean)) {
      setErrorMessage('Please enter a valid 10-digit NPI number.');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/npi-lookup?number=${encodeURIComponent(clean)}`);
      const data = (await response.json()) as NpiLookupResult;

      if (!response.ok || !data.found) {
        setResult(null);
        setErrorMessage(data.error || 'No matching NPI record found in the CMS NPPES registry.');
        return;
      }

      setResult(data);
    } catch {
      setResult(null);
      setErrorMessage('Unable to query the CMS NPPES registry right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runLookup(npiInput);
  };

  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-12">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            EMR Pulse Free Tool · Live CMS NPPES Registry v2.1
          </p>

          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white text-balance max-w-3xl">
            NPI Registry &amp; Taxonomy Lookup
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            Verify provider enumeration details, primary taxonomy codes, and official billing addresses directly from the public CMS NPPES NPI database before submitting claims.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-[#0B1017] sm:p-10">
          <div className="border-b border-slate-200 pb-5 dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
              10-Digit NPI Search
            </span>
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Look Up Provider Name, Taxonomy &amp; Billing Address
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="npi-number-input"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              National Provider Identifier (10 Digits)
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="npi-number-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={npiInput}
                  onChange={(e) => setNpiInput(e.target.value)}
                  placeholder="Enter 10-digit NPI (e.g., 1881018208)"
                  className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 font-mono text-sm font-semibold text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 tabular-nums"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] disabled:opacity-60 dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isLoading ? 'Searching CMS...' : 'Lookup NPI'}</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Quick examples:</span>
              {SAMPLE_NPIS.map((sample) => (
                <button
                  key={sample.npi}
                  type="button"
                  onClick={() => {
                    setNpiInput(sample.npi);
                    void runLookup(sample.npi);
                  }}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-[#39FF14] dark:hover:text-[#39FF14] cursor-pointer tabular-nums"
                >
                  {sample.npi} ({sample.label})
                </button>
              ))}
            </div>
          </form>

          {/* LOADING SKELETON */}
          {isLoading && (
            <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[#070A0E]">
              <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-8 w-72 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {!isLoading && errorMessage && (
            <div
              role="alert"
              className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <div>
                <p className="font-bold">Lookup Notice</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* EMPTY PROMPT STATE */}
          {!isLoading && !errorMessage && !result && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
              <Building2 className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-bold text-slate-800 dark:text-slate-200">
                Ready to query the CMS NPPES Registry
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Enter any 10-digit individual or organizational NPI above and click Lookup NPI to retrieve live taxonomy and billing address records.
              </p>
            </div>
          )}

          {/* POPULATED RESULT */}
          {!isLoading && result && (
            <div className="mt-8 rounded-2xl border border-teal-700/25 bg-teal-50/40 p-6 dark:border-[#39FF14]/30 dark:bg-[#39FF14]/[0.03] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-white/10">
                <div>
                  <p className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                    NPI {result.npi} · {result.enumerationType} · Status: {result.status}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                    {result.providerName}
                  </h3>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified in NPPES
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#070A0E]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    <Stethoscope className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Primary Taxonomy Code</span>
                  </div>
                  {result.primaryTaxonomy ? (
                    <div className="mt-3 space-y-1.5">
                      <p className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {result.primaryTaxonomy.code}
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {result.primaryTaxonomy.desc}
                      </p>
                      {result.primaryTaxonomy.state && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          State: {result.primaryTaxonomy.state}
                          {result.primaryTaxonomy.license
                            ? ` · License: ${result.primaryTaxonomy.license}`
                            : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      No taxonomy code listed on file.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#070A0E]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Billing / Mailing Address</span>
                  </div>
                  {result.billingAddress ? (
                    <div className="mt-3 space-y-1 text-sm text-slate-800 dark:text-slate-200">
                      <p className="font-semibold">{result.billingAddress.line1}</p>
                      <p className="tabular-nums">{result.billingAddress.cityStateZip}</p>
                      {result.billingAddress.phone && (
                        <p className="pt-1 font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                          Tel: {result.billingAddress.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      No billing address listed.
                    </p>
                  )}
                </div>
              </div>

              {result.practiceAddress &&
                result.billingAddress &&
                result.practiceAddress.line1 !== result.billingAddress.line1 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 dark:border-white/10 dark:bg-[#070A0E] dark:text-slate-300">
                    <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Primary Practice Location:{' '}
                    </span>
                    <span className="font-medium">
                      {result.practiceAddress.line1}, {result.practiceAddress.cityStateZip}
                    </span>
                  </div>
                )}
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
