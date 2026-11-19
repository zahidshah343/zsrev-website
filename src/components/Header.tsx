import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../App';

interface HeaderProps {
  currentStep:
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
  theme: ThemeMode;
  onToggleTheme: () => void;
  onStartDiagnostic: () => void;
  onGoHome: () => void;
  onNavigateFreeTools: () => void;
  onNavigateServices: () => void;
  onNavigateAbout: () => void;
  onNavigateContact: () => void;
  authUserEmail?: string | null;
  authUserDisplayName?: string | null;
  isAuthenticated?: boolean;
  isLoggingIn?: boolean;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
}

export function Header({
  currentStep,
  theme,
  onToggleTheme,
  onStartDiagnostic,
  onGoHome,
  onNavigateFreeTools,
  onNavigateServices,
  onNavigateAbout,
  onNavigateContact,
}: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-[#070A0E]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        {/* Modern Unique SVG Logo + EMR Pulse Brand */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F766E] dark:focus-visible:outline-[#39FF14] cursor-pointer shrink-0"
        >
          <svg
            className="h-8 w-8 text-[#0F766E] dark:text-[#39FF14]"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" className="fill-teal-50 dark:fill-white/[0.06]" />
            <path
              d="M6 16H10L13 9L19 23L22 16H26"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="19" cy="23" r="2" className="fill-[#0F766E] dark:fill-[#39FF14]" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              ZSREV
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              A ZSREV Company
            </span>
          </div>
        </button>

        {/* EXACT ORDER: About | Our Services | Free Tools */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAbout();
            }}
            className="hover:text-[#0F766E] dark:hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            About
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNavigateServices();
            }}
            className="hover:text-[#0F766E] dark:hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Our Services
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNavigateFreeTools();
            }}
            className="hover:text-[#0F766E] dark:hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Free Tools
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNavigateContact();
            }}
            className="hover:text-[#0F766E] dark:hover:text-[#39FF14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-800 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.1] dark:focus-visible:outline-[#39FF14] shrink-0 cursor-pointer"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-300" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" aria-hidden="true" />
            )}
          </button>

          {currentStep === 'landing' ||
          currentStep === 'services' ||
          currentStep === 'benchmark' ||
          currentStep === 'contact' ||
          currentStep === 'cybersecurity' ||
          currentStep === 'denial-check' ||
          currentStep === 'npi-lookup' ||
          currentStep === 'payer-directory' ||
          currentStep === 'credentialing-checklist' ||
          currentStep === 'modifier-guide' ||
          currentStep === 'timely-filing' ? (
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] dark:focus-visible:outline-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Diagnostic
            </button>
          ) : (
            <button
              type="button"
              onClick={currentStep === 'report' ? onStartDiagnostic : onGoHome}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:border-[#39FF14]/50 dark:hover:bg-white/[0.08] dark:focus-visible:outline-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {currentStep === 'report' ? 'Retake Diagnostic' : 'Exit to Overview'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
