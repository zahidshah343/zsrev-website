import type { DiagnosticAnswers, DiagnosticReport } from '../types/diagnostic';

export interface RiskGaugeMetric {
  title: string;
  score: number; // 0 to 100
  label: string;
  severity: 'high' | 'moderate' | 'low';
  colorHex: string;
  bgTintHex: string;
  rgb: [number, number, number];
  bgRgb: [number, number, number];
  answerLabel: string;
  answerDisplay: string;
}

export function generateReportId(generatedAt: string): string {
  let hash = 0;
  for (let i = 0; i < generatedAt.length; i++) {
    hash = (hash * 31 + generatedAt.charCodeAt(i)) % 10000;
  }
  const code = String(Math.abs(hash)).padStart(4, '0');
  return `#EP-2026-${code}`;
}

export function computeRevenueRisk(answers: DiagnosticAnswers): RiskGaugeMetric {
  if (answers.strugglePath === 'billing') {
    const rate = answers.currentDenialRate || 'Not sure';
    if (rate === 'Over 15%' || rate === '10%–15%') {
      return {
        title: 'Revenue Leakage Risk',
        score: 88,
        label: 'High Denial Exposure',
        severity: 'high',
        colorHex: '#DC2626',
        bgTintHex: '#FEF2F2',
        rgb: [220, 38, 38],
        bgRgb: [254, 242, 242],
        answerLabel: 'Denial rate',
        answerDisplay: rate,
      };
    }
    if (rate === '6%–10%' || rate === 'Not sure') {
      return {
        title: 'Revenue Leakage Risk',
        score: 72,
        label: 'Moderate-High Exposure',
        severity: 'moderate',
        colorHex: '#EA580C',
        bgTintHex: '#FFF7ED',
        rgb: [234, 88, 12],
        bgRgb: [255, 247, 237],
        answerLabel: 'Denial rate',
        answerDisplay: rate,
      };
    }
    if (rate === '3%–6%') {
      return {
        title: 'Revenue Leakage Risk',
        score: 48,
        label: 'Moderate Variance',
        severity: 'moderate',
        colorHex: '#D97706',
        bgTintHex: '#FFFBEB',
        rgb: [217, 119, 6],
        bgRgb: [255, 251, 235],
        answerLabel: 'Denial rate',
        answerDisplay: rate,
      };
    }
    return {
      title: 'Revenue Leakage Risk',
      score: 24,
      label: 'Controlled Baseline',
      severity: 'low',
      colorHex: '#0F5C5B',
      bgTintHex: '#EDF6F5',
      rgb: [15, 92, 91],
      bgRgb: [237, 246, 245],
      answerLabel: 'Denial rate',
      answerDisplay: rate,
    };
  }

  if (answers.strugglePath === 'clinical') {
    const authWait = answers.priorAuthTurnaround || 'Not sure';
    const isHigh =
      authWait === '2+ weeks or frequent delays' || authWait === '1–2 weeks';
    const isMod = authWait === '3–5 business days' || authWait === 'Not sure';
    return {
      title: 'Delayed Care & Coding Risk',
      score: isHigh ? 82 : isMod ? 58 : 26,
      label: isHigh
        ? 'High Visit-Delay Risk'
        : isMod
          ? 'Moderate Turnaround Lag'
          : 'Timely Auth Turnaround',
      severity: isHigh ? 'high' : isMod ? 'moderate' : 'low',
      colorHex: isHigh ? '#DC2626' : isMod ? '#D97706' : '#0F5C5B',
      bgTintHex: isHigh ? '#FEF2F2' : isMod ? '#FFFBEB' : '#EDF6F5',
      rgb: isHigh ? [220, 38, 38] : isMod ? [217, 119, 6] : [15, 92, 91],
      bgRgb: isHigh ? [254, 242, 242] : isMod ? [255, 251, 235] : [237, 246, 245],
      answerLabel: 'Prior auth wait',
      answerDisplay: authWait,
    };
  }

  // Other / General Workflow
  const setup = answers.workflowSetup || '';
  const isHigh = setup.includes('Disconnected') || setup.includes('Evaluating');
  const isMod = setup.includes('bridges');
  return {
    title: 'System Fragmentation Risk',
    score: isHigh ? 78 : isMod ? 52 : 28,
    label: isHigh
      ? 'High Cross-Tool Friction'
      : isMod
        ? 'Moderate Handoff Overhead'
        : 'Unified Platform Baseline',
    severity: isHigh ? 'high' : isMod ? 'moderate' : 'low',
    colorHex: isHigh ? '#DC2626' : isMod ? '#D97706' : '#0F5C5B',
    bgTintHex: isHigh ? '#FEF2F2' : isMod ? '#FFFBEB' : '#EDF6F5',
    rgb: isHigh ? [220, 38, 38] : isMod ? [217, 119, 6] : [15, 92, 91],
    bgRgb: isHigh ? [254, 242, 242] : isMod ? [255, 251, 235] : [237, 246, 245],
    answerLabel: 'System setup',
    answerDisplay: setup || 'General workflow',
  };
}

export function computeWorkflowLoadRisk(answers: DiagnosticAnswers): RiskGaugeMetric {
  if (answers.strugglePath === 'billing') {
    const ar = answers.arDays || 'Not sure';
    const rework = answers.clearinghouseRework || '';
    const isHigh =
      ar === '60+ days' || ar === '45–60 days' || rework === 'Daily manual rework';
    const isMod = ar === '30–45 days' || ar === 'Not sure' || rework === 'Weekly manual batching';
    return {
      title: 'AR Aging & Rework Load',
      score: isHigh ? 84 : isMod ? 58 : 26,
      label: isHigh
        ? 'High Collection Drag'
        : isMod
          ? 'Moderate Rework Load'
          : 'Healthy AR Velocity',
      severity: isHigh ? 'high' : isMod ? 'moderate' : 'low',
      colorHex: isHigh ? '#DC2626' : isMod ? '#D97706' : '#0F5C5B',
      bgTintHex: isHigh ? '#FEF2F2' : isMod ? '#FFFBEB' : '#EDF6F5',
      rgb: isHigh ? [220, 38, 38] : isMod ? [217, 119, 6] : [15, 92, 91],
      bgRgb: isHigh ? [254, 242, 242] : isMod ? [255, 251, 235] : [237, 246, 245],
      answerLabel: 'Days in AR',
      answerDisplay: ar,
    };
  }

  if (answers.strugglePath === 'clinical') {
    const hrs = answers.dailyChartingHours || '1–2 hrs/day';
    const authHrs = answers.priorAuthWeeklyHours || '';
    const isHigh = hrs === '3+ hrs/day' || authHrs === '30+ hrs/wk';
    const isMod = hrs === '2–3 hrs/day' || authHrs === '15–30 hrs/wk' || hrs === '1–2 hrs/day';
    return {
      title: 'Staff & Clinician Workload',
      score: isHigh ? 86 : isMod ? 62 : 24,
      label: isHigh
        ? 'High Charting & Auth Strain'
        : isMod
          ? 'Moderate Admin Load'
          : 'Sustainable Workload',
      severity: isHigh ? 'high' : isMod ? 'moderate' : 'low',
      colorHex: isHigh ? '#DC2626' : isMod ? '#D97706' : '#0F5C5B',
      bgTintHex: isHigh ? '#FEF2F2' : isMod ? '#FFFBEB' : '#EDF6F5',
      rgb: isHigh ? [220, 38, 38] : isMod ? [217, 119, 6] : [15, 92, 91],
      bgRgb: isHigh ? [254, 242, 242] : isMod ? [255, 251, 235] : [237, 246, 245],
      answerLabel: 'Daily charting',
      answerDisplay: hrs,
    };
  }

  // Other / General Workflow
  const hrs = answers.weeklyAdminOverhead || 'Not sure';
  const isHigh = hrs === '30+ hrs/wk' || hrs === '15–30 hrs/wk';
  const isMod = hrs === '5–15 hrs/wk' || hrs === 'Not sure';
  return {
    title: 'Manual Workaround Load',
    score: isHigh ? 82 : isMod ? 56 : 25,
    label: isHigh
      ? 'High Manual Workaround Drag'
      : isMod
        ? 'Moderate Staff Overhead'
        : 'Contained Workarounds',
    severity: isHigh ? 'high' : isMod ? 'moderate' : 'low',
    colorHex: isHigh ? '#DC2626' : isMod ? '#D97706' : '#0F5C5B',
    bgTintHex: isHigh ? '#FEF2F2' : isMod ? '#FFFBEB' : '#EDF6F5',
    rgb: isHigh ? [220, 38, 38] : isMod ? [217, 119, 6] : [15, 92, 91],
    bgRgb: isHigh ? [254, 242, 242] : isMod ? [255, 251, 235] : [237, 246, 245],
    answerLabel: 'Weekly hours lost',
    answerDisplay: hrs,
  };
}

export function getOperationalPostureRows(
  answers: DiagnosticAnswers
): Array<{ label: string; value: string }> {
  const pathTitle =
    answers.strugglePath === 'billing'
      ? 'Billing & RCM'
      : answers.strugglePath === 'clinical'
        ? 'Clinical & Admin'
        : 'General Workflow';

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Focus Area', value: pathTitle },
  ];

  if (answers.billingSetup) {
    rows.push({ label: 'Billing Setup', value: answers.billingSetup });
  }
  if (answers.monthlyClaimVolume) {
    rows.push({ label: 'Monthly Claims', value: answers.monthlyClaimVolume });
  }
  if (answers.currentDenialRate) {
    rows.push({ label: 'Denial Rate', value: answers.currentDenialRate });
  }
  if (answers.arDays) {
    rows.push({ label: 'Days in AR', value: answers.arDays });
  }
  if (answers.clearinghouseRework) {
    rows.push({ label: 'Clearinghouse Rework', value: answers.clearinghouseRework });
  }
  if (answers.providerCount) {
    rows.push({ label: 'Providers', value: answers.providerCount });
  }
  if (answers.priorAuthWeeklyHours) {
    rows.push({ label: 'Weekly Prior Auth', value: answers.priorAuthWeeklyHours });
  }
  if (answers.priorAuthTurnaround) {
    rows.push({ label: 'Prior Auth Wait', value: answers.priorAuthTurnaround });
  }
  if (answers.dailyChartingHours) {
    rows.push({ label: 'Daily Charting', value: answers.dailyChartingHours });
  }
  if (answers.icdCodingBottleneck) {
    rows.push({ label: 'Documentation Bottleneck', value: answers.icdCodingBottleneck });
  }
  if (answers.practiceSize) {
    rows.push({ label: 'Team Size', value: answers.practiceSize });
  }
  if (answers.workflowSetup) {
    rows.push({ label: 'System Integration', value: answers.workflowSetup });
  }
  if (answers.primaryFrictionArea) {
    rows.push({ label: 'Primary Friction', value: answers.primaryFrictionArea });
  }
  if (answers.weeklyAdminOverhead) {
    rows.push({ label: 'Weekly Workarounds', value: answers.weeklyAdminOverhead });
  }

  return rows;
}

export function buildConciseAnswersSummary(answers: DiagnosticAnswers): string {
  const rows = getOperationalPostureRows(answers);
  return rows.map((r) => `${r.label}: ${r.value}`).join(' · ');
}

export interface RiskBreakdownBar {
  dimension: string;
  userAnswer: string;
  score: number; // 0 to 100
  levelLabel: 'High Risk' | 'Moderate' | 'Controlled';
  severity: 'high' | 'moderate' | 'low';
  rgb: [number, number, number];
}

function makeBar(
  dimension: string,
  userAnswer: string,
  score: number,
  severity: 'high' | 'moderate' | 'low'
): RiskBreakdownBar {
  return {
    dimension,
    userAnswer,
    score,
    levelLabel: severity === 'high' ? 'High Risk' : severity === 'moderate' ? 'Moderate' : 'Controlled',
    severity,
    rgb:
      severity === 'high'
        ? [220, 38, 38]
        : severity === 'moderate'
          ? [217, 119, 6]
          : [15, 118, 110],
  };
}

export function computeRiskBreakdownBars(answers: DiagnosticAnswers): RiskBreakdownBar[] {
  if (answers.strugglePath === 'billing') {
    const setup = answers.billingSetup || 'Not specified';
    const setupSev: 'high' | 'moderate' | 'low' = setup.includes('In-house')
      ? 'high'
      : setup.includes('Separate')
        ? 'moderate'
        : 'low';
    const setupScore = setupSev === 'high' ? 76 : setupSev === 'moderate' ? 58 : 28;

    const vol = answers.monthlyClaimVolume || 'Not sure';
    const volSev: 'high' | 'moderate' | 'low' =
      vol === '3,500+ claims/mo'
        ? 'high'
        : vol === '1,500–3,500 claims/mo' || vol === 'Not sure'
          ? 'moderate'
          : 'low';
    const volScore = vol === '3,500+ claims/mo' ? 78 : vol === '1,500–3,500 claims/mo' ? 58 : vol === 'Not sure' ? 55 : 34;

    const denial = answers.currentDenialRate || 'Not sure';
    const denialSev: 'high' | 'moderate' | 'low' =
      denial === 'Over 15%' || denial === '10%–15%'
        ? 'high'
        : denial === '6%–10%' || denial === '3%–6%' || denial === 'Not sure'
          ? 'moderate'
          : 'low';
    const denialScore =
      denial === 'Over 15%'
        ? 94
        : denial === '10%–15%'
          ? 84
          : denial === '6%–10%' || denial === 'Not sure'
            ? 68
            : denial === '3%–6%'
              ? 48
              : 22;

    const ar = answers.arDays || 'Not sure';
    const arSev: 'high' | 'moderate' | 'low' =
      ar === '60+ days' || ar === '45–60 days'
        ? 'high'
        : ar === '30–45 days' || ar === 'Not sure'
          ? 'moderate'
          : 'low';
    const arScore = ar === '60+ days' ? 90 : ar === '45–60 days' ? 78 : ar === 'Not sure' ? 60 : ar === '30–45 days' ? 50 : 24;

    const rework = answers.clearinghouseRework || 'Not sure';
    const reworkSev: 'high' | 'moderate' | 'low' =
      rework === 'Daily manual rework'
        ? 'high'
        : rework === 'Weekly manual batching' || rework === 'Not sure'
          ? 'moderate'
          : 'low';
    const reworkScore =
      rework === 'Daily manual rework'
        ? 88
        : rework === 'Weekly manual batching' || rework === 'Not sure'
          ? 60
          : rework === 'A few times per month'
            ? 38
            : 20;

    return [
      makeBar('Billing Model', setup, setupScore, setupSev),
      makeBar('Claim Scale', vol, volScore, volSev),
      makeBar('Denial Exposure', denial, denialScore, denialSev),
      makeBar('AR Velocity', ar, arScore, arSev),
      makeBar('Clearinghouse Rework', rework, reworkScore, reworkSev),
    ];
  }

  if (answers.strugglePath === 'clinical') {
    const providers = answers.providerCount || 'Not specified';
    const provSev: 'high' | 'moderate' | 'low' =
      providers === '11+ providers'
        ? 'high'
        : providers === '6–10 providers' || providers === '3–5 providers'
          ? 'moderate'
          : 'low';
    const provScore = providers === '11+ providers' ? 76 : providers === '6–10 providers' ? 60 : providers === '3–5 providers' ? 46 : 30;

    const paHours = answers.priorAuthWeeklyHours || 'Not sure';
    const paSev: 'high' | 'moderate' | 'low' =
      paHours === '30+ hrs/wk' || paHours === '15–30 hrs/wk'
        ? 'high'
        : paHours === '5–15 hrs/wk' || paHours === 'Not sure'
          ? 'moderate'
          : 'low';
    const paScore = paHours === '30+ hrs/wk' ? 92 : paHours === '15–30 hrs/wk' ? 76 : paHours === 'Not sure' ? 58 : paHours === '5–15 hrs/wk' ? 48 : 22;

    const paWait = answers.priorAuthTurnaround || 'Not sure';
    const waitSev: 'high' | 'moderate' | 'low' =
      paWait === '2+ weeks or frequent delays' || paWait === '1–2 weeks'
        ? 'high'
        : paWait === '3–5 business days' || paWait === 'Not sure'
          ? 'moderate'
          : 'low';
    const waitScore = paWait === '2+ weeks or frequent delays' ? 90 : paWait === '1–2 weeks' ? 78 : paWait === 'Not sure' ? 58 : paWait === '3–5 business days' ? 50 : 24;

    const chart = answers.dailyChartingHours || 'Not specified';
    const chartSev: 'high' | 'moderate' | 'low' =
      chart === '3+ hrs/day'
        ? 'high'
        : chart === '2–3 hrs/day' || chart === '1–2 hrs/day'
          ? 'moderate'
          : 'low';
    const chartScore = chart === '3+ hrs/day' ? 90 : chart === '2–3 hrs/day' ? 68 : chart === '1–2 hrs/day' ? 46 : 22;

    const bottleneck = answers.icdCodingBottleneck || 'Not specified';
    const botSev: 'high' | 'moderate' | 'low' =
      bottleneck.includes('Under-coded') || bottleneck.includes('After-hours')
        ? 'high'
        : 'moderate';
    const botScore = botSev === 'high' ? 80 : 58;

    return [
      makeBar('Practice Scale', providers, provScore, provSev),
      makeBar('Prior Auth Effort', paHours, paScore, paSev),
      makeBar('Approval Turnaround', paWait, waitScore, waitSev),
      makeBar('Daily Charting', chart, chartScore, chartSev),
      makeBar('Primary Bottleneck', bottleneck, botScore, botSev),
    ];
  }

  const size = answers.practiceSize || 'Not specified';
  const sizeSev: 'high' | 'moderate' | 'low' =
    size === '26+ total team' ? 'high' : size === '11–25 total team' || size === '4–10 total team' ? 'moderate' : 'low';
  const sizeScore = size === '26+ total team' ? 74 : size === '11–25 total team' ? 58 : size === '4–10 total team' ? 44 : 28;

  const setup = answers.workflowSetup || 'Not specified';
  const setupSev: 'high' | 'moderate' | 'low' =
    setup.includes('Disconnected') || setup.includes('Evaluating')
      ? 'high'
      : setup.includes('bridges')
        ? 'moderate'
        : 'low';
  const setupScore = setupSev === 'high' ? 84 : setupSev === 'moderate' ? 54 : 26;

  const friction = answers.primaryFrictionArea || 'Not specified';
  const fricSev: 'high' | 'moderate' | 'low' =
    friction.includes('Mixed') || friction.includes('intake') ? 'high' : 'moderate';
  const fricScore = fricSev === 'high' ? 76 : 58;

  const hrs = answers.weeklyAdminOverhead || 'Not sure';
  const hrsSev: 'high' | 'moderate' | 'low' =
    hrs === '30+ hrs/wk' || hrs === '15–30 hrs/wk'
      ? 'high'
      : hrs === '5–15 hrs/wk' || hrs === 'Not sure'
        ? 'moderate'
        : 'low';
  const hrsScore = hrs === '30+ hrs/wk' ? 92 : hrs === '15–30 hrs/wk' ? 76 : hrs === 'Not sure' ? 58 : hrs === '5–15 hrs/wk' ? 48 : 24;

  return [
    makeBar('Practice Size', size, sizeScore, sizeSev),
    makeBar('System Silos', setup, setupScore, setupSev),
    makeBar('Daily Friction', friction, fricScore, fricSev),
    makeBar('Workaround Hours', hrs, hrsScore, hrsSev),
  ];
}

export interface BenchmarkComparisonItem {
  label: string;
  currentValueLabel: string;
  targetValueLabel: string;
  currentPercent: number;
  targetPercent: number;
}

export function computeBenchmarkComparison(
  answers: DiagnosticAnswers
): BenchmarkComparisonItem[] {
  const rev = computeRevenueRisk(answers);
  const work = computeWorkflowLoadRisk(answers);
  if (answers.strugglePath === 'billing') {
    return [
      {
        label: 'First-Pass Denial Exposure',
        currentValueLabel: answers.currentDenialRate || 'Elevated',
        targetValueLabel: '< 3% Top-Quartile Target',
        currentPercent: rev.score,
        targetPercent: 20,
      },
      {
        label: 'AR Collection & Rework Friction',
        currentValueLabel: answers.arDays || 'Elevated',
        targetValueLabel: '< 30 Days Target',
        currentPercent: work.score,
        targetPercent: 22,
      },
    ];
  }
  if (answers.strugglePath === 'clinical') {
    return [
      {
        label: 'Prior Auth Turnaround Delay',
        currentValueLabel: answers.priorAuthTurnaround || 'Variable',
        targetValueLabel: '< 48 hrs ePA Target',
        currentPercent: rev.score,
        targetPercent: 20,
      },
      {
        label: 'Clinician Charting & Admin Load',
        currentValueLabel: answers.dailyChartingHours || 'Elevated',
        targetValueLabel: '< 1 hr/day Target',
        currentPercent: work.score,
        targetPercent: 22,
      },
    ];
  }
  return [
    {
      label: 'Cross-System Handoff Friction',
      currentValueLabel: answers.workflowSetup || 'Fragmented',
      targetValueLabel: 'Unified Sync Target',
      currentPercent: rev.score,
      targetPercent: 22,
    },
    {
      label: 'Weekly Manual Workaround Load',
      currentValueLabel: answers.weeklyAdminOverhead || 'Elevated',
      targetValueLabel: '< 5 hrs/wk Target',
      currentPercent: work.score,
      targetPercent: 20,
    },
  ];
}

export interface EmrPulseRecommendation {
  engagementTitle: string;
  tailoredSummary: string;
  actionItems: string[];
  approxPricingRange: string;
  pricingStructure: string;
  practiceScaleLabel: string;
  disclaimerText: string;
}

export const PRICING_DISCLAIMER_TEXT =
  'Note: Pricing is an approximate estimate based on the services rendered and your specific practice size. Final quotes may vary.';

export function buildEmrPulseRecommendation(
  answers: DiagnosticAnswers,
  report: DiagnosticReport
): EmrPulseRecommendation {
  if (answers.strugglePath === 'billing') {
    const vol = answers.monthlyClaimVolume || '500–1,500 claims/mo';
    const isHighRisk =
      answers.currentDenialRate === '6%–10%' ||
      answers.currentDenialRate === '10%–15%' ||
      answers.currentDenialRate === 'Over 15%' ||
      answers.currentDenialRate === 'Not sure' ||
      answers.arDays === '45–60 days' ||
      answers.arDays === '60+ days' ||
      answers.clearinghouseRework === 'Daily manual rework';

    let approxPricingRange = '$1,800 – $3,000';
    if (vol === 'Under 500 claims/mo') {
      approxPricingRange = '$1,200 – $2,000';
    } else if (vol === '1,500–3,500 claims/mo') {
      approxPricingRange = '$2,600 – $4,200';
    } else if (vol === '3,500+ claims/mo') {
      approxPricingRange = '$3,800 – $6,000';
    }

    return {
      engagementTitle: isHighRisk
        ? `RCM Recovery & ${report.recommendedCategory} Sprint`
        : 'Preventive RCM & Clearinghouse Optimization Audit',
      tailoredSummary: `Tailored for your "${answers.billingSetup || 'current billing'}" setup (${vol}) to tighten front-end scrubbing and recover stalled AR without unnecessary EMR replacement.`,
      actionItems: [
        `Root-cause audit of ${answers.currentDenialRate || 'first-pass'} denials and ${answers.arDays || 'AR aging'} payer queues.`,
        `Configure automated clearinghouse edit checks to eliminate ${answers.clearinghouseRework || 'manual claim rework'}.`,
        'Vendor-neutral comparison and SLA/pricing review if adding an RCM overlay or partner.',
      ],
      approxPricingRange,
      pricingStructure: 'One-time diagnostic implementation & RCM advisory sprint',
      practiceScaleLabel: vol,
      disclaimerText: PRICING_DISCLAIMER_TEXT,
    };
  }

  if (answers.strugglePath === 'clinical') {
    const providers = answers.providerCount || '3–5 providers';
    let approxPricingRange = '$1,800 – $3,200';
    if (providers === '1–2 providers') {
      approxPricingRange = '$1,000 – $1,800';
    } else if (providers === '6–10 providers') {
      approxPricingRange = '$3,000 – $5,200';
    } else if (providers === '11+ providers') {
      approxPricingRange = '$4,800 – $8,000';
    }

    return {
      engagementTitle: `${report.recommendedCategory} & Clinical Workflow Advisory`,
      tailoredSummary: `Sized for ${providers} handling ${answers.priorAuthWeeklyHours || 'recurring'} weekly prior auths and ${answers.dailyChartingHours || 'daily'} provider charting.`,
      actionItems: [
        `Prioritize fixing "${answers.icdCodingBottleneck || 'documentation bottlenecks'}" with structured EHR templates or AI scribe evaluation.`,
        `Streamline prior authorization queues to shorten ${answers.priorAuthTurnaround || 'payer'} turnaround delays.`,
        'Vendor-neutral pilot scorecard, HIPAA BAA verification, and contract pricing negotiation.',
      ],
      approxPricingRange,
      pricingStructure: 'Fixed-scope workflow optimization & vendor selection sprint',
      practiceScaleLabel: providers,
      disclaimerText: PRICING_DISCLAIMER_TEXT,
    };
  }

  const size = answers.practiceSize || '4–10 total team';
  let approxPricingRange = '$1,600 – $2,800';
  if (size === '1–3 total team') {
    approxPricingRange = '$950 – $1,600';
  } else if (size === '11–25 total team') {
    approxPricingRange = '$2,600 – $4,500';
  } else if (size === '26+ total team') {
    approxPricingRange = '$4,200 – $7,000';
  }

  return {
    engagementTitle: `${report.recommendedCategory} & System Integration Roadmap`,
    tailoredSummary: `Calibrated for a ${size} practice experiencing "${answers.primaryFrictionArea || 'cross-tool friction'}" across ${answers.workflowSetup || 'current systems'}.`,
    actionItems: [
      `Eliminate ${answers.weeklyAdminOverhead || 'weekly'} manual data-entry workarounds between intake, EHR, and billing.`,
      'Bridge vs. platform-consolidation ROI analysis tailored to your exact team footprint.',
      'Vendor-neutral shortlist and contract term review before committing to multi-year fees.',
    ],
    approxPricingRange,
    pricingStructure: 'One-time operational architecture & vendor selection engagement',
    practiceScaleLabel: size,
    disclaimerText: PRICING_DISCLAIMER_TEXT,
  };
}

export function buildRevenueImpactNarrative(answers: DiagnosticAnswers): string {
  if (answers.strugglePath === 'billing') {
    const denialInfo = answers.currentDenialRate
      ? `${answers.currentDenialRate} first-pass denials`
      : 'untracked first-pass denials';
    const arInfo = answers.arDays ? `${answers.arDays} Days in AR` : 'extended Days in AR';
    return `With ${denialInfo} and ${arInfo} on "${answers.billingSetup || 'current billing'}", collectible cash stalls before clearing. Manual rework pulls staff away from high-value payer recovery and increases timely-filing write-offs.`;
  }

  if (answers.strugglePath === 'clinical') {
    const team = answers.providerCount || 'your clinical team';
    const paHours = answers.priorAuthWeeklyHours || 'weekly staff hours';
    const charting = answers.dailyChartingHours || 'daily charting';
    return `Across ${team}, ${paHours} on prior authorizations slows visit scheduling while ${charting} of documentation limits billable patient capacity. Resolving "${answers.icdCodingBottleneck || 'documentation gaps'}" protects both clinician hours and capture accuracy.`;
  }

  const size = answers.practiceSize || 'your team';
  const hours = answers.weeklyAdminOverhead || 'weekly staff hours';
  return `Across ${size}, "${answers.primaryFrictionArea || 'daily workarounds'}" consumes ${hours} per week on repetitive re-keying across "${answers.workflowSetup || 'disconnected tools'}". Closing those handoff gaps restores front-desk capacity and catches eligibility issues before visit day.`;
}
