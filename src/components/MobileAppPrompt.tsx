import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Bell, CheckCircle2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function MobileAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleNotifySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = notifyEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setNotifyError('Please enter a valid email address.');
      return;
    }

    setNotifyError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/mobile-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Could not save your notification request.');
      }
      setSubmittedEmail(trimmed);
      setNotifyEmail('');
    } catch (err: unknown) {
      setNotifyError(
        err instanceof Error ? err.message : 'Unable to save request right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Mobile access and updates"
      className="border-t border-slate-200 bg-slate-50 py-10 dark:border-white/10 dark:bg-[#070A0E]"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {deferredPrompt && !isInstalled ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
            >
              <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Add EMR Pulse to Home Screen</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowNotifyForm((prev) => !prev)}
            aria-expanded={showNotifyForm}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.1] dark:focus-visible:outline-[#39FF14] cursor-pointer"
          >
            <Bell className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]" aria-hidden="true" />
            <span>Mobile App Coming Soon — Notify Me</span>
          </button>
        </div>

        {showNotifyForm ? (
          <div className="mt-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-white/12 dark:bg-white/[0.04]">
            {submittedEmail ? (
              <div
                role="status"
                className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-700 dark:text-[#39FF14]"
                  aria-hidden="true"
                />
                <span>
                  You&apos;re on the list! We&apos;ll notify{' '}
                  <span className="font-semibold">{submittedEmail}</span> when the EMR Pulse
                  mobile app launches.
                </span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} noValidate className="space-y-2">
                <label
                  htmlFor="mobile-notify-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Get notified when the EMR Pulse mobile app launches (No PHI)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="mobile-notify-email"
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => {
                      setNotifyEmail(e.target.value);
                      if (notifyError) setNotifyError(null);
                    }}
                    placeholder="you@yourpractice.com"
                    className="min-h-[42px] flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/25 dark:border-white/15 dark:bg-[#0B1017] dark:text-white dark:focus:border-[#39FF14] dark:focus:ring-[#39FF14]/25"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#0F766E] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0D5F59] disabled:opacity-60 dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Notify Me'}
                  </button>
                </div>
                {notifyError ? (
                  <p role="alert" className="text-xs text-red-700 dark:text-red-400">
                    {notifyError}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
