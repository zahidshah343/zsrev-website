import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  Layers,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PATH_QUESTIONS, STRUGGLE_PATHS } from '../data/questions';
import type { DiagnosticAnswers, StrugglePath } from '../types/diagnostic';

const RESEARCH_PROGRESS_STEPS = [
  'Validating operational inputs against RCM benchmarks...',
  'Calculating estimated revenue leakage and AR aging impact...',
  'Correlating workflow data with industry pain points...',
  'Synthesizing vendor-neutral recommendations...',
] as const;

interface DiagnosticFormProps {
  initialAnswers?: Partial<DiagnosticAnswers>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (answers: DiagnosticAnswers) => void;
  onBackToHome: () => void;
}

function getPathIcon(pathId: StrugglePath) {
  switch (pathId) {
    case 'billing':
      return Receipt;
    case 'clinical':
      return ClipboardList;
    case 'other':
      return Layers;
  }
}

export function DiagnosticForm({
  initialAnswers = {},
  isSubmitting,
  errorMessage,
  onSubmit,
  onBackToHome,
}: DiagnosticFormProps) {
  const [selectedPath, setSelectedPath] = useState<StrugglePath | null>(
    initialAnswers.strugglePath ?? null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<DiagnosticAnswers>>(initialAnswers);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isSubmitting) {
      setLoadingLineIndex(0);
      return;
    }
    setLoadingLineIndex(0);
    const intervalId = window.setInterval(() => {
      setLoadingLineIndex((prev) =>
        prev < RESEARCH_PROGRESS_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 920);
    return () => window.clearInterval(intervalId);
  }, [isSubmitting]);

  const handleChoosePath = (path: StrugglePath) => {
    setLocalError(null);
    setSelectedPath(path);
    setStepIndex(0);
    setAnswers((prev) =>
      prev.strugglePath === path ? prev : { strugglePath: path }
    );
  };

  if (isSubmitting) {
    const activePathMeta =
      STRUGGLE_PATHS.find((item) => item.id === selectedPath) ?? STRUGGLE_PATHS[0];
    const currentMessage = RESEARCH_PROGRESS_STEPS[loadingLineIndex];
    const progressRatio = (loadingLineIndex + 1) / RESEARCH_PROGRESS_STEPS.length;

    return (
      <main
        aria-live="polite"
        aria-busy="true"
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9] sm:px-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0F766E]/8 blur-3xl dark:bg-[#39FF14]/6"
        />

        <section className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/12 dark:bg-[#0B1017] dark:shadow-none sm:p-12">
          <p className="text-xs font-semibold text-[#0F766E] dark:text-[#39FF14]">
            {activePathMeta.shortLabel} Analysis · Zero PHI Collected
          </p>

          <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
            Preparing your practice snapshot
          </h1>

          {/* Sequential fading text lines — no spinner */}
          <div className="mt-8 flex min-h-[4.25rem] items-center justify-center px-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingLineIndex}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-base font-medium leading-relaxed text-slate-800 dark:text-slate-100 sm:text-lg"
              >
                {currentMessage}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 4-segment research progress bar */}
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Benchmarking &amp; synthesis</span>
              <span className="font-mono font-semibold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
                Step {loadingLineIndex + 1} of {RESEARCH_PROGRESS_STEPS.length}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
              role="progressbar"
              aria-valuenow={loadingLineIndex + 1}
              aria-valuemin={1}
              aria-valuemax={RESEARCH_PROGRESS_STEPS.length}
            >
              <div
                className="h-full origin-left rounded-full bg-[#0F766E] transition-transform duration-300 ease-out dark:bg-[#39FF14]"
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>

            <ol className="mt-6 space-y-2 text-left">
              {RESEARCH_PROGRESS_STEPS.map((label, idx) => {
                const isDone = idx < loadingLineIndex;
                const isCurrent = idx === loadingLineIndex;
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-2.5 text-xs transition-opacity duration-200 ${
                      isCurrent
                        ? 'font-semibold text-slate-900 opacity-100 dark:text-white'
                        : isDone
                          ? 'text-[#0F766E] opacity-85 dark:text-[#39FF14]'
                          : 'text-slate-500 opacity-45 dark:text-slate-500'
                    }`}
                  >
                    <span className="font-mono text-[11px] tabular-nums">0{idx + 1}.</span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>
    );
  }

  // ENTRY SCREEN: "What is your practice struggling with today?"
  if (!selectedPath) {
    return (
      <main className="relative flex-1 overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#0F766E]/8 blur-3xl dark:bg-[#39FF14]/6"
        />

        <section className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F766E] dark:text-[#39FF14]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>This diagnostic is 100% free. No credit card required.</span>
            </p>

            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl text-balance">
              What is your practice struggling with today?
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Pick the area creating the biggest drag on cash flow or staff hours. You&apos;ll get a
              targeted operational assessment and one-page summary report with zero patient data.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STRUGGLE_PATHS.map((option) => {
              const Icon = getPathIcon(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleChoosePath(option.id)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-150 hover:border-[#0F766E] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-[#39FF14] dark:hover:bg-white/[0.07] dark:focus-visible:outline-[#39FF14] cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-700/20 bg-teal-50 text-[#0F766E] transition-colors group-hover:bg-[#0F766E] group-hover:text-white dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14] dark:group-hover:bg-[#39FF14] dark:group-hover:text-[#070A0E]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {option.questionCountLabel}
                      </span>
                    </div>

                    <h2 className="mt-5 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">
                      {option.title}
                    </h2>

                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {option.subtitle}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-4 text-sm font-bold text-[#0F766E] dark:border-white/10 dark:text-[#39FF14]">
                    <span>Start {option.shortLabel} diagnostic</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to overview</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // QUESTIONNAIRE FLOW FOR SELECTED PATH
  const questions = PATH_QUESTIONS[selectedPath];
  const pathMeta = STRUGGLE_PATHS.find((item) => item.id === selectedPath)!;
  const safeStepIndex = Math.min(stepIndex, questions.length - 1);
  const currentQuestion = questions[safeStepIndex];
  const totalCount = questions.length;
  const progressRatio = (safeStepIndex + 1) / totalCount;
  const progressPercent = Math.round(progressRatio * 100);
  const selectedValue = answers[currentQuestion.id] ?? '';
  const isLastStep = safeStepIndex === totalCount - 1;

  const handleSelectValue = (value: string) => {
    setLocalError(null);
    setAnswers((prev) => ({
      ...prev,
      strugglePath: selectedPath,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isSubmitting) return;
    if (!selectedValue) {
      setLocalError(
        currentQuestion.inputType === 'select'
          ? 'Please choose a range from the dropdown to continue.'
          : 'Please select one of the options above to continue.'
      );
      return;
    }

    if (isLastStep) {
      const missingIndex = questions.findIndex((q) => !answers[q.id]);
      if (missingIndex !== -1) {
        setStepIndex(missingIndex);
        setLocalError('Please complete this question before generating your report.');
        return;
      }
      setLocalError(null);
      onSubmit({
        ...answers,
        strugglePath: selectedPath,
      } as DiagnosticAnswers);
      return;
    }

    setLocalError(null);
    setStepIndex(Math.min(safeStepIndex + 1, totalCount - 1));
  };

  const handlePrevious = () => {
    if (isSubmitting) return;
    setLocalError(null);
    if (safeStepIndex === 0) {
      setSelectedPath(null);
      return;
    }
    setStepIndex(Math.max(safeStepIndex - 1, 0));
  };

  const displayedError = localError || errorMessage;

  return (
    <main className="relative flex-1 overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#0F766E]/8 blur-3xl dark:bg-[#39FF14]/6"
      />

      <section className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Path Context Header + Free Notice */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-[#0F766E] dark:text-[#39FF14]">
              {pathMeta.shortLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>100% Free · Zero PHI</span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setLocalError(null);
              setSelectedPath(null);
            }}
            className="text-xs font-semibold text-slate-600 underline underline-offset-4 transition-colors hover:text-[#0F766E] dark:text-slate-400 dark:hover:text-[#39FF14] whitespace-nowrap cursor-pointer"
          >
            Change focus area
          </button>
        </div>

        {/* Question Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono font-semibold text-[#0F766E] dark:text-[#39FF14] tabular-nums">
              Question {safeStepIndex + 1} of {totalCount}
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums">
              {progressPercent}% complete
            </span>
          </div>
          <div
            className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
            role="progressbar"
            aria-valuenow={safeStepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalCount}
            aria-label={`Question ${safeStepIndex + 1} of ${totalCount}`}
          >
            <div
              className="h-full rounded-full bg-[#0F766E] dark:bg-[#39FF14] transition-transform duration-200 ease-out origin-left"
              style={{ transform: `scaleX(${progressRatio})` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:backdrop-blur-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] sm:p-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedPath}-${currentQuestion.id}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-[1.7rem] text-balance">
                {currentQuestion.question}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {currentQuestion.helperText}
              </p>

              {currentQuestion.inputType === 'select' ? (
                <div className="mt-7">
                  <label
                    htmlFor={`select-${currentQuestion.id}`}
                    className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Select a range
                  </label>
                  <div className="relative">
                    <select
                      id={`select-${currentQuestion.id}`}
                      value={selectedValue}
                      disabled={isSubmitting}
                      onChange={(e) => handleSelectValue(e.target.value)}
                      className="min-h-[54px] w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 pr-11 py-3.5 text-base font-medium text-slate-900 transition-colors focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#0B1017] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25 cursor-pointer"
                    >
                      <option value="">
                        {currentQuestion.placeholder || 'Select an option range...'}
                      </option>
                      {currentQuestion.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ) : (
                <fieldset className="mt-7 space-y-3" aria-label={currentQuestion.question}>
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedValue === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSelectValue(option)}
                        aria-pressed={isSelected}
                        className={`flex min-h-[54px] w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:focus-visible:outline-[#39FF14] cursor-pointer ${
                          isSelected
                            ? 'border-[#0F766E] bg-teal-50 text-slate-900 dark:border-[#39FF14] dark:bg-[#39FF14]/12 dark:text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100 dark:border-white/12 dark:bg-white/[0.02] dark:text-slate-200 dark:hover:border-white/30 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="leading-snug">{option}</span>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? 'border-[#0F766E] bg-[#0F766E] text-white dark:border-[#39FF14] dark:bg-[#39FF14] dark:text-[#070A0E]'
                              : 'border-slate-400 bg-transparent dark:border-white/30'
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          {displayedError ? (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-400/35 dark:bg-red-500/10 dark:text-red-200"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400"
                aria-hidden="true"
              />
              <span>{displayedError}</span>
            </div>
          ) : null}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{safeStepIndex === 0 ? 'All struggles' : 'Previous'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLastStep ? (
                <>
                  <span>Generate Report</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
