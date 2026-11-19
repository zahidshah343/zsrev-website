import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Download,
  Info,
  Mail,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { ThemeMode } from '../App';
import {
  CALENDLY_URL,
  STRUGGLE_PATHS,
  VENDOR_CATEGORY_SOLUTIONS,
  VENDOR_PRICING_TABLE,
} from '../data/questions';
import { trackEvent } from '../lib/analytics';
import { getAccessToken } from '../lib/firebaseAuth';
import { saveLeadToFirestore } from '../lib/firestoreLeads';
import type { DiagnosticAnswers, DiagnosticReport } from '../types/diagnostic';
import { downloadDiagnosticPdf, getDiagnosticPdfBase64 } from '../utils/pdfExport';
import {
  buildConciseAnswersSummary,
  buildEmrPulseRecommendation,
  buildRevenueImpactNarrative,
  computeBenchmarkComparison,
  computeRevenueRisk,
  computeRiskBreakdownBars,
  computeWorkflowLoadRisk,
} from '../utils/riskMetrics';
import type { RiskGaugeMetric } from '../utils/riskMetrics';
import { ConfirmEmailModal } from './ConfirmEmailModal';
import { GoogleSignInButton } from './GoogleSignInButton';

interface ReportViewProps {
  answers: DiagnosticAnswers;
  report: DiagnosticReport;
  theme: ThemeMode;
  onRetake: () => void;
  onNavigateServices: () => void;
  authUserEmail: string | null;
  authUserDisplayName: string | null;
  gmailAccessToken: string | null;
  isLoggingIn: boolean;
  authError: string | null;
  onGoogleSignIn: () => Promise<string | null>;
  onAuthExpired: () => void;
}

function getBarColorClass(severity: RiskGaugeMetric['severity']): string {
  if (severity === 'high') return 'bg-red-600 dark:bg-red-500';
  if (severity === 'moderate') return 'bg-amber-600 dark:bg-amber-400';
  return 'bg-[#0F766E] dark:bg-[#39FF14]';
}

function getSeverityTextClass(severity: RiskGaugeMetric['severity']): string {
  if (severity === 'high') return 'text-red-700 dark:text-red-400';
  if (severity === 'moderate') return 'text-amber-700 dark:text-amber-300';
  return 'text-[#0F766E] dark:text-[#39FF14]';
}

function getSeverityBadgeClass(severity: RiskGaugeMetric['severity']): string {
  if (severity === 'high') {
    return 'border-red-300 bg-red-50 text-red-800 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-200';
  }
  if (severity === 'moderate') {
    return 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-200';
  }
  return 'border-teal-700/30 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/15 dark:text-[#39FF14]';
}

function getSeverityShortLabel(severity: RiskGaugeMetric['severity']): string {
  if (severity === 'high') return 'High Risk';
  if (severity === 'moderate') return 'Moderate';
  return 'Controlled';
}

function shouldEnforceTurnstile(): boolean {
  if (import.meta.env.PROD !== true) {
    return false;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  const hostname = window.location.hostname.toLowerCase();
  const isLocalhost =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  const isAiStudioPreviewHost =
    hostname.startsWith('ais-dev-') || hostname.endsWith('.aistudio.google.com');
  let isInsideIframe = false;
  try {
    isInsideIframe = window.self !== window.top;
  } catch {
    isInsideIframe = true;
  }
  return !isLocalhost && !isAiStudioPreviewHost && !isInsideIframe;
}

function SummaryMetricCard({ metric }: { metric: RiskGaugeMetric }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/12 dark:bg-white/[0.03]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {metric.title}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${getSeverityBadgeClass(metric.severity)}`}
          >
            {getSeverityShortLabel(metric.severity)}
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className={`font-display text-base font-bold ${getSeverityTextClass(metric.severity)}`}>
            {metric.label}
          </p>
          <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {metric.score}%
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
          role="progressbar"
          aria-valuenow={metric.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${metric.title}: ${metric.score}%`}
        >
          <div
            className={`h-full rounded-full ${getBarColorClass(metric.severity)}`}
            style={{ width: `${metric.score}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {metric.answerLabel}:{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {metric.answerDisplay}
          </span>
        </p>
      </div>
    </div>
  );
}

export function ReportView({
  answers,
  report,
  theme,
  onRetake,
  onNavigateServices,
  authUserEmail,
  authUserDisplayName,
  gmailAccessToken,
  isLoggingIn,
  authError,
  onGoogleSignIn,
  onAuthExpired,
}: ReportViewProps) {
  // Bottom inline email composer state
  const [showInlineEmail, setShowInlineEmail] = useState(false);
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const isTurnstileEnforced = useMemo(() => shouldEnforceTurnstile(), []);
  const [isPreparingSend, setIsPreparingSend] = useState(false);
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState(false);
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null);

  const [pendingRecipient, setPendingRecipient] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);
  const [emailSentInfo, setEmailSentInfo] = useState<{
    recipientEmail: string;
    fileName: string;
  } | null>(null);

  const reportId = useMemo(() => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `#EP-2026-${num}`;
  }, [report.generatedAt]);
  const attachmentFileName = `EMR-Pulse-Report-${reportId.replace('#', '')}.pdf`;

  const pathMeta =
    STRUGGLE_PATHS.find((item) => item.id === answers.strugglePath) ?? STRUGGLE_PATHS[0];
  const vendorCategories = VENDOR_CATEGORY_SOLUTIONS[answers.strugglePath];
  const revenueRisk = computeRevenueRisk(answers);
  const workflowRisk = computeWorkflowLoadRisk(answers);
  const conciseAnswersSummary = buildConciseAnswersSummary(answers);
  const riskBars = computeRiskBreakdownBars(answers);
  const benchmarkBars = computeBenchmarkComparison(answers);
  const impactNarrative = buildRevenueImpactNarrative(answers);
  const emrPulseRecommendation = buildEmrPulseRecommendation(answers, report);
  const safeTopRisks = Array.isArray(report.topRisks) ? report.topRisks : [];

  const parsedDate = Date.parse(report.generatedAt);
  const generatedDate = Number.isNaN(parsedDate)
    ? new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date(parsedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const handleInlineEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inlineEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      setInlineError('Please enter a valid work or practice email.');
      return;
    }

    if (isTurnstileEnforced && !turnstileToken) {
      setInlineError('Please complete the security check.');
      return;
    }

    setInlineError(null);
    setEmailSendError(null);
    setIsPreparingSend(true);

    try {
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          role: 'Other',
          answers,
          recommendedCategory: report.recommendedCategory,
          topRiskTitles: safeTopRisks.map((r) => r.title),
          turnstileToken:
            turnstileToken || (isTurnstileEnforced ? '' : 'dev-preview-bypass'),
        }),
      });
      const leadData = await leadResponse.json().catch(() => ({}));
      if (!leadResponse.ok) {
        setInlineError(
          typeof leadData.error === 'string'
            ? leadData.error
            : 'Please complete the security check.'
        );
        return;
      }
      if (typeof leadData.id === 'string') {
        setSavedLeadId(leadData.id);
      }

      setPendingRecipient(trimmed);
      const activeToken = gmailAccessToken || (await getAccessToken());
      if (activeToken) {
        setNeedsGoogleAuth(false);
        setIsConfirmModalOpen(true);
      } else {
        setNeedsGoogleAuth(true);
      }
    } catch {
      setInlineError('Unable to verify request right now. Please try again.');
    } finally {
      setIsPreparingSend(false);
    }
  };

  const handleConnectGoogleForSend = async () => {
    setEmailSendError(null);
    const token = await onGoogleSignIn();
    if (!token) return;
    setNeedsGoogleAuth(false);
    if (pendingRecipient || inlineEmail.trim()) {
      setPendingRecipient((prev) => prev || inlineEmail.trim());
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmSendEmail = async () => {
    const activeToken = gmailAccessToken || (await getAccessToken());
    if (!activeToken) {
      onAuthExpired();
      setIsConfirmModalOpen(false);
      return;
    }

    const targetEmail = (pendingRecipient || inlineEmail).trim();
    setIsSendingEmail(true);
    setEmailSendError(null);

    try {
      const { base64, fileName } = getDiagnosticPdfBase64(report, answers, reportId, theme);
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          recipientEmail: targetEmail,
          role: 'Other',
          answers,
          report,
          reportId,
          leadId: savedLeadId,
          pdfBase64: base64,
          fileName,
          theme,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          onAuthExpired();
          setIsConfirmModalOpen(false);
          setEmailSendError(
            data.error ||
              'Gmail authorization expired. Please sign in with Google again to send.'
          );
          return;
        }
        throw new Error(data.error || 'Could not send email via Gmail.');
      }

      const sentEmail = data.recipientEmail || targetEmail;
      void trackEvent('email_report_sent');

      try {
        await saveLeadToFirestore(sentEmail, reportId);
      } catch {
        // Non-blocking: structured error already logged by saveLeadToFirestore
      }

      setEmailSentInfo({
        recipientEmail: sentEmail,
        fileName: data.fileName || fileName,
      });
      setNeedsGoogleAuth(false);
      setIsConfirmModalOpen(false);
    } catch (err: unknown) {
      setEmailSendError(
        err instanceof Error ? err.message : 'Failed to send email via Gmail.'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <main className="flex-1 bg-slate-100 py-8 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9] sm:py-12">
      {/* SINGLE-COLUMN DOCUMENT WHITE-PAPER CONTAINER */}
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-white/12 dark:bg-[#0B1017] dark:shadow-none sm:px-11 sm:py-11">
        {/* TOP SUMMARY HEADER */}
        <header className="border-b border-slate-200 pb-8 dark:border-white/12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-[#0F766E] dark:text-[#39FF14]">
                {pathMeta.shortLabel} Diagnostic Brief
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{reportId}</span>
              <span aria-hidden="true">·</span>
              <span>{generatedDate}</span>
              <span aria-hidden="true">·</span>
              <span>Zero PHI Collected</span>
            </div>

            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 underline underline-offset-4 transition-colors hover:text-[#0F766E] dark:text-slate-400 dark:hover:text-[#39FF14] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Start New Diagnostic</span>
            </button>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl text-balance">
            Your Practice Risk &amp; Revenue Snapshot
          </h1>

          {/* Concise 1-2 line snapshot of user's specific answers */}
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <span className="font-semibold text-slate-900 dark:text-white">Your Profile: </span>
            {conciseAnswersSummary}
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {report.executiveSummary}
          </p>

          {/* 3 VISUAL SUMMARY CARDS */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryMetricCard metric={revenueRisk} />
            <SummaryMetricCard metric={workflowRisk} />

            <div className="flex flex-col justify-between rounded-xl border border-teal-700/25 bg-teal-50/80 p-5 dark:border-[#39FF14]/35 dark:bg-[#39FF14]/[0.06]">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Annual Impact
                  </span>
                  <span className="inline-flex items-center rounded-md border border-teal-700/25 bg-white/80 px-2 py-0.5 text-[11px] font-bold text-[#0F766E] dark:border-[#39FF14]/35 dark:bg-[#070A0E] dark:text-[#39FF14]">
                    Conservative
                  </span>
                </div>
                <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                  {report.impactRange}
                </p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Priority fix:{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {report.recommendedCategory}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* CONTINUOUS SINGLE-COLUMN VISUAL & CONCISE REPORT */}
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {/* SECTION 1: 1. Root Causes & Operational Risks (Visual Breakdown Chart + Concise Bullets) */}
          <section aria-labelledby="section-root-causes" className="py-8">
            <h2
              id="section-root-causes"
              className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              1. Root Causes &amp; Operational Risks
            </h2>

            {report.rcmRiskAlert ? (
              <div
                role="region"
                aria-label="RCM Risk Alert"
                className="mt-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400"
                  aria-hidden="true"
                />
                <p className="text-sm leading-snug">
                  <span className="font-bold text-red-950 dark:text-red-200">
                    RCM Risk Alert:{' '}
                  </span>
                  {report.rcmRiskAlert}
                </p>
              </div>
            ) : null}

            {/* Visual Horizontal Risk Profile Chart mapped from user inputs */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Risk Heatmap Across Your Inputs
                </p>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  0–100 Risk Index
                </span>
              </div>

              <div className="space-y-3.5">
                {riskBars.map((bar) => (
                  <div key={bar.dimension} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {bar.dimension}:
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {bar.userAnswer}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-bold ${getSeverityBadgeClass(bar.severity)}`}
                        >
                          {bar.levelLabel}
                        </span>
                        <span className="w-8 text-right font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          {bar.score}%
                        </span>
                      </div>
                    </div>

                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
                      role="progressbar"
                      aria-valuenow={bar.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${bar.dimension} risk ${bar.score}%`}
                    >
                      <div
                        className={`h-full rounded-full ${getBarColorClass(bar.severity)}`}
                        style={{ width: `${bar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concise 1-2 line risk summaries */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {safeTopRisks.map((risk, idx) => (
                <div
                  key={`${risk.title}-${idx}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      1.{idx + 1} {risk.title}
                    </h3>
                    <span className="inline-flex shrink-0 items-center rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:border-amber-400/35 dark:bg-amber-400/15 dark:text-amber-200">
                      Key Driver
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0F766E] dark:text-[#39FF14]">
                    {risk.mechanism}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {risk.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: 2. How This Impacts Your Revenue (Benchmark Chart + Concise Summary) */}
          <section aria-labelledby="section-revenue-impact" className="py-8">
            <h2
              id="section-revenue-impact"
              className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              2. How This Impacts Your Revenue
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200 sm:text-base">
              {impactNarrative}
            </p>

            {/* Simple Comparative Benchmark Bar Chart */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Practice Exposure vs. Top-Quartile Benchmark
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-600 dark:bg-amber-400" />
                    Your Current Setup
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#0F766E] dark:bg-[#39FF14]" />
                    Industry Benchmark Target
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {benchmarkBars.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                        {item.currentValueLabel} vs. {item.targetValueLabel}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-amber-600 dark:bg-amber-400"
                            style={{ width: `${item.currentPercent}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                          {item.currentPercent}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#0F766E] dark:bg-[#39FF14]"
                            style={{ width: `${item.targetPercent}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-[11px] font-bold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                          {item.targetPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-teal-700/25 bg-teal-50/70 p-5 dark:border-[#39FF14]/30 dark:bg-[#39FF14]/[0.05]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                  Conservative Industry Loss Estimate
                </p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {report.impactRange}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {report.impactDisclaimer}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  First Priority Solution
                </p>
                <p className="mt-1.5 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {report.recommendedCategory}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {report.categoryRationale}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: 3. Recommended Vendor Categories */}
          <section aria-labelledby="section-vendor-categories" className="py-8">
            <h2
              id="section-vendor-categories"
              className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              3. Recommended Vendor Categories
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              Vendor-neutral categories aligned with your {pathMeta.shortLabel} answers.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {vendorCategories.map((item, idx) => (
                <div
                  key={item.category}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      3.{idx + 1} {item.category}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#0F766E] dark:text-[#39FF14]">
                      {item.examples}
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Verify: </span>
                    {item.whatToLookFor}
                  </p>
                </div>
              ))}
            </div>

            {report.vendorMatches.length > 0 ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Specific Platforms to Evaluate
                </p>
                <ul className="mt-2.5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {report.vendorMatches.map((vendor) => (
                    <li key={vendor.name} className="leading-snug">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {vendor.name}:{' '}
                      </span>
                      <span>{vendor.oneLineReason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Market Snapshot Pricing Table */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/12">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 dark:bg-white/[0.05] dark:text-slate-200">
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                      Est. Market Price
                    </th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                      Best For
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {VENDOR_PRICING_TABLE.map((row) => (
                    <tr key={row.vendorName}>
                      <td className="px-4 py-2.5 font-display font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {row.vendorName}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-medium text-[#0F766E] dark:text-[#39FF14] whitespace-nowrap">
                        {row.solutionType}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-200 tabular-nums whitespace-nowrap">
                        {row.estStartingPrice}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300">
                        {row.bestFor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: EMR Pulse Recommendations (Directly before PDF/Email/Call footer) */}
          <section aria-labelledby="section-emr-pulse-recommendations" className="py-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2
                  id="section-emr-pulse-recommendations"
                  className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                >
                  EMR Pulse Recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Recommended advisory scope and estimated budget based on your specific inputs.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateServices}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline dark:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>See how EMR Pulse can solve this specific issue</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Tailored Action Plan */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.02] lg:col-span-7">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {emrPulseRecommendation.engagementTitle}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {emrPulseRecommendation.tailoredSummary}
                </p>

                <ul className="mt-4 space-y-2">
                  {emrPulseRecommendation.actionItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Approximate Pricing Block + Highly Visible Disclaimer */}
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-teal-700/30 bg-teal-50/70 p-5 dark:border-[#39FF14]/35 dark:bg-[#39FF14]/[0.06] lg:col-span-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#39FF14]">
                    Approximate Advisory Pricing
                  </span>
                  <p className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {emrPulseRecommendation.approxPricingRange}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                    {emrPulseRecommendation.pricingStructure}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Calibrated for:{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {emrPulseRecommendation.practiceScaleLabel}
                    </span>
                  </p>
                </div>

                {/* Highly visible pricing disclaimer right next to the pricing */}
                <div
                  role="note"
                  className="flex items-start gap-2.5 rounded-lg border border-amber-400 bg-amber-50 p-3.5 text-xs font-semibold leading-relaxed text-amber-950 dark:border-amber-400/50 dark:bg-amber-400/15 dark:text-amber-100"
                >
                  <Info
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
                    aria-hidden="true"
                  />
                  <span>{emrPulseRecommendation.disclaimerText}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM-ONLY ACTION BAR: [Download PDF] | [Send to Email] | [Book 15-Min Call] */}
        <footer className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-white/12 dark:bg-white/[0.03]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Save or Review Your Report
              </h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Download the visual PDF, send a copy by email, or book a 15-minute review with Mr.
                Ali.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void trackEvent('pdf_export');
                downloadDiagnosticPdf(report, answers, true, reportId, theme);
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/20 dark:bg-[#0B1017] dark:text-white dark:hover:border-[#39FF14] dark:hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              aria-expanded={showInlineEmail}
              onClick={() => {
                setShowInlineEmail((prev) => !prev);
                setInlineError(null);
              }}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showInlineEmail
                  ? 'border-[#0F766E] bg-teal-50 text-[#0F766E] dark:border-[#39FF14] dark:bg-[#39FF14]/12 dark:text-[#39FF14]'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-[#0F766E] hover:text-[#0F766E] dark:border-white/20 dark:bg-[#0B1017] dark:text-white dark:hover:border-[#39FF14] dark:hover:text-[#39FF14]'
              }`}
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Send to Email</span>
            </button>

            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackEvent('calendly_click', { location: 'report_bottom' })}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap shrink-0"
            >
              <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Book 15-Min Call</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>

            {/* Inline Email Composer right next to the bottom action buttons */}
            {showInlineEmail && !emailSentInfo ? (
              <form
                onSubmit={handleInlineEmailSubmit}
                noValidate
                className="flex flex-1 flex-wrap items-center gap-2.5 border-t border-slate-200 pt-3 dark:border-white/10 lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0"
              >
                <label htmlFor="bottom-inline-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bottom-inline-email"
                  type="email"
                  required
                  value={inlineEmail}
                  onChange={(e) => {
                    setInlineEmail(e.target.value);
                    if (inlineError) setInlineError(null);
                  }}
                  placeholder="you@yourpractice.com"
                  className="min-h-[44px] min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#070A0E] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Turnstile
                    siteKey={
                      import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
                    }
                    options={{ theme, size: 'compact' }}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      if (inlineError?.includes('security check')) {
                        setInlineError(null);
                      }
                    }}
                    onExpire={() => {
                      setTurnstileToken(null);
                      if (isTurnstileEnforced) {
                        setInlineError('Please complete the security check.');
                      }
                    }}
                    onError={() => {
                      setTurnstileToken(null);
                      if (isTurnstileEnforced) {
                        setInlineError('Please complete the security check.');
                      }
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isPreparingSend}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] disabled:opacity-60 dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{isPreparingSend ? 'Preparing...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          {inlineError ? (
            <p
              role="alert"
              className="mt-3 flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{inlineError}</span>
            </p>
          ) : null}

          {needsGoogleAuth && !gmailAccessToken ? (
            <div className="mt-3 flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Connect your Google account to send the PDF report to{' '}
                <span className="font-semibold">{pendingRecipient || inlineEmail.trim()}</span>.
              </span>
              <GoogleSignInButton
                onClick={handleConnectGoogleForSend}
                disabled={isLoggingIn}
                compact
              />
            </div>
          ) : null}

          {emailSentInfo ? (
            <div
              role="status"
              className="mt-3 flex items-center gap-2.5 rounded-lg border border-emerald-700/30 bg-emerald-50 px-4 py-2.5 text-xs text-slate-900 dark:border-[#39FF14]/45 dark:bg-[#39FF14]/12 dark:text-white"
            >
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-emerald-700 dark:text-[#39FF14]"
                aria-hidden="true"
              />
              <span>
                Sent <span className="font-mono">{emailSentInfo.fileName}</span> to{' '}
                <span className="font-semibold">{emailSentInfo.recipientEmail}</span>.
              </span>
            </div>
          ) : null}

          {emailSendError && !isConfirmModalOpen ? (
            <p
              role="alert"
              className="mt-3 flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{emailSendError}</span>
            </p>
          ) : null}

          {authError ? (
            <p
              role="alert"
              className="mt-3 flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{authError}</span>
            </p>
          ) : null}

          <p className="mt-5 flex items-start gap-2 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:text-slate-400">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]"
              aria-hidden="true"
            />
            <span>
              Confidentiality &amp; Compliance Notice: This report is vendor-neutral and intended
              for operational evaluation only. EMR Pulse does not collect, process, or store
              Protected Health Information (PHI). Always ensure any third-party vendors you engage
              are fully HIPAA-compliant.
            </span>
          </p>
        </footer>
      </article>

      <ConfirmEmailModal
        isOpen={isConfirmModalOpen}
        recipientEmail={(pendingRecipient || inlineEmail).trim()}
        recipientRole="Practice Team"
        connectedEmail={authUserEmail}
        connectedDisplayName={authUserDisplayName}
        attachmentFileName={attachmentFileName}
        isSending={isSendingEmail}
        errorMessage={emailSendError}
        onConfirm={handleConfirmSendEmail}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setEmailSendError(null);
        }}
      />
    </main>
  );
}
