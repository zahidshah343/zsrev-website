import { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-white/15 dark:bg-[#0D131C] dark:text-slate-100 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2
              id="privacy-modal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-white"
            >
              Privacy &amp; Data
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Privacy and Data modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            We use Google Analytics to understand site usage (page views, button clicks). We use
            Firebase Firestore to securely store the email address you voluntarily provide to
            receive your report. We never collect or store patient health information (PHI). You
            can opt out via browser settings.
          </p>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
