import { Mail, Paperclip, Send, X } from 'lucide-react';
import { CALENDLY_URL } from '../data/questions';

interface ConfirmEmailModalProps {
  isOpen: boolean;
  recipientEmail: string;
  recipientRole: string;
  connectedEmail: string | null;
  connectedDisplayName: string | null;
  attachmentFileName: string;
  isSending: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmEmailModal({
  isOpen,
  recipientEmail,
  recipientRole,
  connectedEmail,
  connectedDisplayName,
  attachmentFileName,
  isSending,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmEmailModalProps) {
  if (!isOpen) return null;

  const senderDisplayName = connectedDisplayName?.trim() || 'Google Workspace Account';

  const greetingRole = recipientRole || 'there';
  const subject = 'Your EMR Pulse Diagnostic Report & Next Steps';
  const bodyPreview = `Hi ${greetingRole}, thank you for using EMR Pulse. Attached is your personalized diagnostic report. If you want to save weeks of vendor research and get priority pricing, book a free 15-min call with me here: ${CALENDLY_URL}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-email-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/75"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-white/15 dark:bg-[#0C1118] dark:text-slate-100">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-700/25 bg-teal-50 text-[#0F766E] dark:border-[#39FF14]/40 dark:bg-[#39FF14]/10 dark:text-[#39FF14]">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="confirm-email-title"
                className="font-display text-base font-bold text-slate-900 dark:text-white"
              >
                Confirm Diagnostic Report Email
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Review recipient and PDF attachment before sending via secure email.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSending}
            aria-label="Cancel email delivery"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">From:</span>
              <span
                title={connectedEmail || 'Google Workspace Account'}
                className="font-medium text-slate-900 dark:text-white"
              >
                {senderDisplayName}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">To:</span>
              <span className="font-mono font-semibold text-[#0F766E] dark:text-[#39FF14]">
                {recipientEmail}
                {recipientRole ? ` (${recipientRole})` : ''}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2 border-t border-slate-200 pt-2 dark:border-white/10">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Subject:</span>
              <span className="text-right font-semibold text-slate-900 dark:text-white">
                {subject}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="mb-1.5 font-semibold text-slate-600 dark:text-slate-400">
              Message body:
            </p>
            <p className="leading-relaxed text-slate-700 dark:text-slate-200">{bodyPreview}</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-teal-700/25 bg-teal-50 px-3.5 py-2.5 text-slate-800 dark:border-[#39FF14]/25 dark:bg-[#39FF14]/6 dark:text-slate-200">
            <Paperclip
              className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#39FF14]"
              aria-hidden="true"
            />
            <span className="truncate font-mono text-xs">{attachmentFileName}</span>
          </div>

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSending}
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] disabled:opacity-60 dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
          >
            <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{isSending ? 'Sending email...' : 'Confirm & Send Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
