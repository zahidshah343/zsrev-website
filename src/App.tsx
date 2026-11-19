import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { DiagnosticForm } from './components/DiagnosticForm';
import { ReportView } from './components/ReportView';
import { SeoHead, SEO_ROUTES } from './components/SeoHead';
import type { SeoRouteKey } from './components/SeoHead';
import { ServicesPage } from './components/ServicesPage';
import { CybersecurityPage } from './components/CybersecurityPage';
import { CostBenchmarkPage } from './components/CostBenchmarkPage';
import { DenialCheckPage } from './components/DenialCheckPage';
import { NpiLookupPage } from './components/NpiLookupPage';
import { PayerDirectoryPage } from './components/PayerDirectoryPage';
import { CredentialingChecklistPage } from './components/CredentialingChecklistPage';
import { ModifierGuidePage } from './components/ModifierGuidePage';
import { TimelyFilingPage } from './components/TimelyFilingPage';
import { ContactPage } from './components/ContactPage';
import { trackEvent } from './lib/analytics';
import {
  clearAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from './lib/firebaseAuth';
import type { DiagnosticAnswers, DiagnosticReport } from './types/diagnostic';

type AppStep =
  | 'landing'
  | 'diagnostic'
  | 'report'
  | 'services'
  | 'cybersecurity'
  | 'benchmark'
  | 'contact'
  | 'denial-check'
  | 'npi-lookup'
  | 'payer-directory'
  | 'credentialing-checklist'
  | 'modifier-guide'
  | 'timely-filing';
export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'emr-pulse-theme';

function resolvePathState(pathname: string): { step: AppStep; seoRoute: SeoRouteKey } {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/free-tools') {
    return { step: 'landing', seoRoute: 'free-tools' };
  }
  if (normalized === '/benchmark') {
    return { step: 'benchmark' as AppStep, seoRoute: 'benchmark' };
  }
  if (normalized === '/denial-check') {
    return { step: 'denial-check' as AppStep, seoRoute: 'denial-check' };
  }
  if (normalized === '/npi-lookup') {
    return { step: 'npi-lookup' as AppStep, seoRoute: 'npi-lookup' };
  }
  if (normalized === '/payer-directory') {
    return { step: 'payer-directory' as AppStep, seoRoute: 'payer-directory' };
  }
  if (normalized === '/credentialing-checklist') {
    return { step: 'credentialing-checklist' as AppStep, seoRoute: 'credentialing-checklist' };
  }
  if (normalized === '/modifier-guide') {
    return { step: 'modifier-guide' as AppStep, seoRoute: 'modifier-guide' };
  }
  if (normalized === '/timely-filing') {
    return { step: 'timely-filing' as AppStep, seoRoute: 'timely-filing' };
  }
  if (normalized === '/services') {
    return { step: 'services', seoRoute: 'services' };
  }
  if (normalized === '/cybersecurity-resources') {
    return { step: 'cybersecurity', seoRoute: 'cybersecurity-resources' };
  }
  if (normalized === '/contact') {
    return { step: 'contact' as AppStep, seoRoute: 'about' };
  }
  if (normalized === '/about') {
    return { step: 'landing', seoRoute: 'about' };
  }
  if (normalized === '/diagnostic') {
    return { step: 'diagnostic', seoRoute: 'diagnostic' };
  }
  if (normalized === '/report') {
    return { step: 'report', seoRoute: 'report' };
  }
  return { step: 'landing', seoRoute: 'home' };
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const initialRoute =
    typeof window !== 'undefined'
      ? resolvePathState(window.location.pathname)
      : { step: 'landing' as AppStep, seoRoute: 'home' as SeoRouteKey };

  const [step, setStep] = useState<AppStep>(initialRoute.step);
  const [seoRoute, setSeoRoute] = useState<SeoRouteKey>(initialRoute.seoRoute);
  const [answers, setAnswers] = useState<DiagnosticAnswers | null>(null);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncBrowserPath = (targetPath: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handlePopState = () => {
      const next = resolvePathState(window.location.pathname);
      setStep(next.step);
      setSeoRoute(next.seoRoute);
      if (next.seoRoute === 'free-tools') {
        window.setTimeout(() => {
          document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      } else if (next.seoRoute === 'about') {
        window.setTimeout(() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (initialRoute.seoRoute === 'free-tools') {
      window.setTimeout(() => {
        document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else if (initialRoute.seoRoute === 'about') {
      window.setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [initialRoute.seoRoute]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return;
      } catch {
        // Ignore storage errors
      }
      setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = initAuth(
      (user, token) => {
        if (!active) return;
        setAuthUser(user);
        setGmailAccessToken(token);
        setAuthError(null);
      },
      () => {
        if (!active) return;
        setAuthUser(null);
        setGmailAccessToken(null);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (step === 'diagnostic') {
      void trackEvent('page_view', {
        page_title: SEO_ROUTES.diagnostic.title,
      });
    } else if (step === 'report' && report) {
      void trackEvent('page_view', {
        page_title: SEO_ROUTES.report.title,
      });
    } else if (step === 'services') {
      void trackEvent('page_view', {
        page_title: SEO_ROUTES.services.title,
      });
    } else if (step === 'cybersecurity') {
      void trackEvent('page_view', {
        page_title: SEO_ROUTES['cybersecurity-resources'].title,
      });
    } else if (step === 'landing') {
      void trackEvent('page_view', {
        page_title: SEO_ROUTES[seoRoute].title,
      });
    }
  }, [step, seoRoute, report]);

  // Scroll to absolute top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const handleGoogleSignIn = async (): Promise<string | null> => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setAuthUser(result.user);
        setGmailAccessToken(result.accessToken);
        return result.accessToken;
      }
      return null;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      setAuthError(message);
      return null;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setAuthUser(null);
    setGmailAccessToken(null);
    setAuthError(null);
  };

  const handleAuthExpired = () => {
    clearAccessToken();
    setGmailAccessToken(null);
    setAuthError('Gmail session expired. Please sign in with Google again to send emails.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDiagnostic = () => {
    setErrorMessage(null);
    setAnswers(null);
    setReport(null);
    setStep('diagnostic');
    setSeoRoute('diagnostic');
    syncBrowserPath('/diagnostic');
    void trackEvent('diagnostic_start');
    scrollToTop();
  };

  const handleGoHome = () => {
    setErrorMessage(null);
    setStep('landing');
    setSeoRoute('home');
    syncBrowserPath('/');
    scrollToTop();
  };

  const handleNavigateFreeTools = () => {
    setErrorMessage(null);
    setSeoRoute('free-tools');
    syncBrowserPath('/free-tools');
    if (step !== 'landing') {
      setStep('landing');
      window.setTimeout(() => {
        document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }
    document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavigateAbout = () => {
    setErrorMessage(null);
    setSeoRoute('about');
    syncBrowserPath('/about');
    if (step !== 'landing') {
      setStep('landing');
      window.setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavigateServices = () => {
    setErrorMessage(null);
    setStep('services');
    setSeoRoute('services');
    syncBrowserPath('/services');
    scrollToTop();
  };

  const handleNavigateBenchmark = () => {
    setErrorMessage(null);
    setStep('benchmark');
    setSeoRoute('benchmark');
    syncBrowserPath('/benchmark');
    scrollToTop();
  };

  const handleNavigateCybersecurity = () => {
    setErrorMessage(null);
    setStep('cybersecurity');
    setSeoRoute('cybersecurity-resources');
    syncBrowserPath('/cybersecurity-resources');
    scrollToTop();
  };

  const handleNavigateContact = () => {
    setErrorMessage(null);
    setStep('contact');
    setSeoRoute('about');
    syncBrowserPath('/contact');
    scrollToTop();
  };

  const handleNavigateDenialCheck = () => {
    setErrorMessage(null);
    setStep('denial-check');
    setSeoRoute('denial-check');
    syncBrowserPath('/denial-check');
    scrollToTop();
  };

  const handleNavigateNpiLookup = () => {
    setErrorMessage(null);
    setStep('npi-lookup');
    setSeoRoute('npi-lookup');
    syncBrowserPath('/npi-lookup');
    scrollToTop();
  };

  const handleNavigatePayerDirectory = () => {
    setErrorMessage(null);
    setStep('payer-directory');
    setSeoRoute('payer-directory');
    syncBrowserPath('/payer-directory');
    scrollToTop();
  };

  const handleNavigateCredentialingChecklist = () => {
    setErrorMessage(null);
    setStep('credentialing-checklist');
    setSeoRoute('credentialing-checklist');
    syncBrowserPath('/credentialing-checklist');
    scrollToTop();
  };

  const handleNavigateModifierGuide = () => {
    setErrorMessage(null);
    setStep('modifier-guide');
    setSeoRoute('modifier-guide');
    syncBrowserPath('/modifier-guide');
    scrollToTop();
  };

  const handleNavigateTimelyFiling = () => {
    setErrorMessage(null);
    setStep('timely-filing');
    setSeoRoute('timely-filing');
    syncBrowserPath('/timely-filing');
    scrollToTop();
  };

  const handleDiagnosticSubmit = async (submittedAnswers: DiagnosticAnswers) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const minimumAnimationDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 3800);
    });

    try {
      const fetchPromise = fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: submittedAnswers }),
      });

      const [response] = await Promise.all([fetchPromise, minimumAnimationDelay]);

      const data = (await response.json().catch(() => ({}))) as Partial<DiagnosticReport> & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate diagnostic report.');
      }

      setAnswers(submittedAnswers);
      setReport(data as DiagnosticReport);
      setStep('report');
      setSeoRoute('report');
      syncBrowserPath('/report');
      void trackEvent('diagnostic_complete');
      scrollToTop();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating your diagnostic.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#070A0E] dark:text-[#F1F5F9]">
      <SeoHead route={step === 'report' ? 'report' : seoRoute} />

      <Header
        currentStep={step}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onStartDiagnostic={handleStartDiagnostic}
        onGoHome={handleGoHome}
        onNavigateFreeTools={handleNavigateFreeTools}
        onNavigateServices={handleNavigateServices}
        onNavigateAbout={handleNavigateAbout}
        onNavigateContact={handleNavigateContact}
        authUserEmail={authUser?.email ?? null}
        authUserDisplayName={authUser?.displayName?.trim() || null}
        isAuthenticated={Boolean(authUser)}
        isLoggingIn={isLoggingIn}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {authError && (
        <div
          role="alert"
          className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 sm:px-6"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="font-semibold underline underline-offset-2 hover:opacity-80 shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {step === 'landing' && (
        <LandingView
          onStartDiagnostic={handleStartDiagnostic}
          onNavigateBenchmark={handleNavigateBenchmark}
          onNavigateDenialCheck={handleNavigateDenialCheck}
          onNavigateNpiLookup={handleNavigateNpiLookup}
          onNavigatePayerDirectory={handleNavigatePayerDirectory}
          onNavigateCredentialingChecklist={handleNavigateCredentialingChecklist}
          onNavigateModifierGuide={handleNavigateModifierGuide}
          onNavigateTimelyFiling={handleNavigateTimelyFiling}
        />
      )}

      {step === 'services' && (
        <ServicesPage
          theme={theme}
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'benchmark' && (
        <CostBenchmarkPage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'cybersecurity' && (
        <CybersecurityPage
          onGoHome={handleGoHome}
          onStartDiagnostic={handleStartDiagnostic}
        />
      )}

      {step === 'contact' && (
        <ContactPage onStartDiagnostic={handleStartDiagnostic} />
      )}

      {step === 'denial-check' && (
        <DenialCheckPage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'npi-lookup' && (
        <NpiLookupPage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'payer-directory' && (
        <PayerDirectoryPage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'credentialing-checklist' && (
        <CredentialingChecklistPage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'modifier-guide' && (
        <ModifierGuidePage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'timely-filing' && (
        <TimelyFilingPage
          onStartDiagnostic={handleStartDiagnostic}
          onGoHome={handleGoHome}
        />
      )}

      {step === 'diagnostic' && (
        <DiagnosticForm
          initialAnswers={answers ?? {}}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onSubmit={handleDiagnosticSubmit}
          onBackToHome={handleGoHome}
        />
      )}

      {step === 'report' && answers && report && (
        <ReportView
          answers={answers}
          report={report}
          theme={theme}
          onRetake={handleStartDiagnostic}
          onNavigateServices={handleNavigateServices}
          authUserEmail={authUser?.email ?? null}
          authUserDisplayName={authUser?.displayName?.trim() || null}
          gmailAccessToken={gmailAccessToken}
          isLoggingIn={isLoggingIn}
          authError={authError}
          onGoogleSignIn={handleGoogleSignIn}
          onAuthExpired={handleAuthExpired}
        />
      )}

      {step === 'report' && (!answers || !report) && (
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Generate your practice diagnostic report
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Diagnostic reports are generated dynamically in-session with zero PHI stored on public
            URLs. Answer a few quick workflow checkpoints to view your report.
          </p>
          <button
            type="button"
            onClick={handleStartDiagnostic}
            className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
          >
            Start Your Free Diagnostic
          </button>
        </main>
      )}

      <Footer
        onNavigateServices={handleNavigateServices}
        onNavigateCybersecurity={handleNavigateCybersecurity}
        onNavigateContact={handleNavigateContact}
      />
    </div>
  );
}
