import { Helmet } from 'react-helmet-async';

export type SeoRouteKey =
  | 'home'
  | 'free-tools'
  | 'benchmark'
  | 'denial-check'
  | 'npi-lookup'
  | 'payer-directory'
  | 'credentialing-checklist'
  | 'modifier-guide'
  | 'timely-filing'
  | 'services'
  | 'about'
  | 'cybersecurity-resources'
  | 'diagnostic'
  | 'report';

interface SeoConfig {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

const SITE_NAME = 'EMR Pulse';
const DEFAULT_ORIGIN =
  'https://ais-pre-ai5sdcvb2arvttcn7eysq7-454289187961.asia-northeast1.run.app';

export const SEO_ROUTES: Record<SeoRouteKey, SeoConfig> = {
  home: {
    title: 'EMR Pulse | EMR Consulting & RCM Denial Management',
    description:
      'Vendor-neutral EMR consulting & RCM denial management diagnostic for independent medical practices. Quantify revenue leaks in 2 minutes—zero PHI.',
    path: '/',
  },
  'free-tools': {
    title: 'Free RCM Denial & AI Scribe Calculators | EMR Pulse',
    description:
      'Free RCM denial management & AI scribe ROI tools for independent medical practices. Estimate lost revenue & EMR consulting savings—zero PHI.',
    path: '/free-tools',
  },
  benchmark: {
    title: 'Cost Benchmarking & CPT Reimbursement Calculator | EMR Pulse',
    description:
      'Compare CPT code reimbursement across Medicare, commercial PPO, and Medicaid fee schedules. Free interactive cost benchmarking tool for medical practices.',
    path: '/benchmark',
  },
  'denial-check': {
    title: 'Denial Reason Quick-Check | EMR Pulse',
    description:
      'Check 2026 clearinghouse benchmark denial rates and remediation guidance by payer type and denial reason.',
    path: '/denial-check',
  },
  'npi-lookup': {
    title: 'NPI Registry & Taxonomy Lookup | EMR Pulse',
    description:
      'Query the public CMS NPPES NPI Registry to verify provider names, taxonomy codes, and billing addresses.',
    path: '/npi-lookup',
  },
  'payer-directory': {
    title: 'Payer Portal & EDI Directory | EMR Pulse',
    description:
      'Search Availity, Optum, Medicare MACs, and commercial payer portals alongside ERA/EFT Payer IDs.',
    path: '/payer-directory',
  },
  'credentialing-checklist': {
    title: 'Credentialing & CAQH Readiness Checklist | EMR Pulse',
    description:
      'Interactive readiness checklist for state license expiration, DEA renewal, malpractice COI, and CAQH ProView attestation.',
    path: '/credentialing-checklist',
  },
  'modifier-guide': {
    title: 'CPT / ICD-10 Modifier & Bundling Guide | EMR Pulse',
    description:
      'Quick-reference guide for Modifiers 25, 59, XE, XP, XS, and XU to prevent NCCI bundling claim rejections.',
    path: '/modifier-guide',
  },
  'timely-filing': {
    title: 'Timely Filing Limit Calculator | EMR Pulse',
    description:
      'Calculate exact initial submission and appeal deadlines for Medicare, Medicaid, and Commercial claims by Date of Service.',
    path: '/timely-filing',
  },
  services: {
    title: 'EMR Consulting, Workflow & RCM Services | EMR Pulse',
    description:
      'Independent workflow optimization, RCM denial consulting, and vendor-neutral EHR selection services for medical practices.',
    path: '/services',
  },
  about: {
    title: 'About Syed Zahid Ali | EMR Consulting — EMR Pulse',
    description:
      'Independent EMR consulting & RCM denial management guidance by Syed Zahid Ali for independent medical practices before signing an EHR contract.',
    path: '/about',
  },
  'cybersecurity-resources': {
    title: 'Free Cybersecurity & Ransomware Resources (CISA) | EMR Pulse',
    description:
      'Official StopRansomware.gov, CISA, and HHS cybersecurity toolkits and checklists for independent medical practices.',
    path: '/cybersecurity-resources',
  },
  diagnostic: {
    title: 'Free Dynamic EMR & RCM Diagnostic | EMR Pulse',
    description:
      '100% free branching EMR consulting and RCM denial management diagnostic for independent medical practices. No credit card and zero PHI.',
    path: '/diagnostic',
  },
  report: {
    title: 'Private Practice Diagnostic Report | EMR Pulse',
    description:
      'Private operational diagnostic report generated for your practice workflow. Not indexed by search engines.',
    path: '/report',
    noIndex: true,
  },
};

interface SeoHeadProps {
  route: SeoRouteKey;
}

export function SeoHead({ route }: SeoHeadProps) {
  const config = SEO_ROUTES[route];
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : DEFAULT_ORIGIN;
  const canonicalUrl = `${origin}${config.path}`;
  const ogImageUrl = `${origin}/og-image.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: origin,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    description: SEO_ROUTES.home.description,
    creator: {
      '@type': 'Person',
      name: 'Syed Zahid Ali',
      jobTitle: 'Healthcare IT & RCM Advisor',
      sameAs: 'https://linkedin.com/in/zahidshahh',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <Helmet prioritizeSeoTags>
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      <meta name="robots" content={config.noIndex ? 'noindex' : 'index, follow'} />

      {!config.noIndex && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph (LinkedIn / Social Sharing) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />

      {/* Twitter / X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {!config.noIndex && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
}
