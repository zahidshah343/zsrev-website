import { ArrowLeft, ArrowUpRight, ShieldAlert, ShieldCheck } from 'lucide-react';

interface CybersecurityPageProps {
  onGoHome: () => void;
  onStartDiagnostic: () => void;
}

const CISA_RESOURCES = [
  {
    title: 'StopRansomware.gov (Federal Interagency Hub)',
    organization: 'CISA · FBI · HHS',
    url: 'https://www.stopransomware.gov/',
    description:
      'Central federal portal for ransomware prevention, incident response checklists, reporting steps, and advisories tailored for healthcare and small businesses.',
  },
  {
    title: 'CISA Healthcare and Public Health (HPH) Cybersecurity Toolkit',
    organization: 'CISA',
    url: 'https://www.cisa.gov/topics/cyber-threats-and-advisories/healthcare-and-public-health',
    description:
      'Free vulnerability scanning services, healthcare threat briefings, and no-cost defensive playbooks designed specifically for clinics and hospital IT teams.',
  },
  {
    title: 'CISA #StopRansomware Guide & Response Checklist',
    organization: 'CISA & MS-ISAC',
    url: 'https://www.cisa.gov/stopransomware/ransomware-guide',
    description:
      'Step-by-step preparedness controls (offline backups, MFA, network segmentation) and immediate containment steps if a practice or clearinghouse experiences an attack.',
  },
  {
    title: 'HHS 405(d) Health Industry Cybersecurity Practices (HICP)',
    organization: 'U.S. Department of Health & Human Services',
    url: 'https://405d.hhs.gov/',
    description:
      'Actionable HIPAA-aligned cybersecurity practices written specifically for small and medium medical practices without dedicated security teams.',
  },
];

const PRACTICE_CHECKLIST = [
  'Enforce phishing-resistant multi-factor authentication (MFA) across EHR, clearinghouse, email, and remote desktop logins.',
  'Maintain encrypted, immutable offline backups tested regularly so a clinic outage never forces ransom payment.',
  'Verify your EHR, RCM, and clearinghouse Business Associate Agreements (BAAs) define breach notification timelines and downtime recovery SLAs.',
  'Patch internet-facing VPNs and firewalls immediately using CISA Known Exploited Vulnerabilities (KEV) alerts.',
];

export function CybersecurityPage({ onGoHome, onStartDiagnostic }: CybersecurityPageProps) {
  return (
    <main className="flex-1 bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#0F766E] dark:text-slate-300 dark:hover:text-[#39FF14] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to overview</span>
        </button>

        <div className="mt-6 border-b border-slate-200 pb-8 dark:border-white/10">
          <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>FREE PUBLIC HEALTHCARE IT SECURITY RESOURCES</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl text-balance">
            Free Cybersecurity &amp; Ransomware Resources (CISA)
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Independent medical practices face disproportionate disruption from clearinghouse outages
            and ransomware incidents. Below are official, no-cost federal resources from
            StopRansomware.gov, CISA, and HHS to protect clinical continuity and billing operations.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {CISA_RESOURCES.map((resource) => (
            <article
              key={resource.url}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.03] dark:shadow-none"
            >
              <div>
                <p className="font-mono text-xs font-semibold text-[#0F766E] dark:text-[#39FF14]">
                  {resource.organization}
                </p>
                <h2 className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {resource.title}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {resource.description}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E] underline underline-offset-4 transition-colors hover:text-[#0D5F59] dark:text-[#39FF14] dark:hover:text-[#52FF33]"
                >
                  <span>Visit official resource</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.03] dark:shadow-none sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Practice Readiness Essentials</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
            Baseline vendor &amp; clinic security checks
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {PRACTICE_CHECKLIST.map((item, idx) => (
              <li key={item} className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                  0{idx + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              EMR Pulse never collects patient data (PHI) or clinical network credentials.
            </p>
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
            >
              Run Free Workflow Diagnostic
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
