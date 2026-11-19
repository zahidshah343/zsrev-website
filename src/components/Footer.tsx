import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PrivacyModal } from './PrivacyModal';

interface FooterProps {
  onNavigateServices: () => void;
  onNavigateCybersecurity: () => void;
  onNavigateContact: () => void;
}

const WHATSAPP_URL = 'https://wa.me/923064330657?text=Hi%20Mr.%20Ali%2C%20I%20have%20a%20question%20about%20EMR%20Pulse.';

export function Footer({ onNavigateServices, onNavigateCybersecurity, onNavigateContact }: FooterProps) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#0A0E14]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 py-8 text-center text-sm text-slate-600 dark:text-slate-400 sm:px-6">
          <p className="font-medium leading-relaxed text-slate-800 dark:text-slate-200">
            Built for EMR vendors and independent practices.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://linkedin.com/in/zahidshahh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect with Mr. Ali on LinkedIn (opens in a new tab)"
              className="inline-flex items-center gap-2 rounded-md bg-[#0A66C2] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#004182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66C2] whitespace-nowrap shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>Connect with Mr. Ali on LinkedIn</span>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Mr. Ali on WhatsApp (opens in a new tab)"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition-colors hover:bg-[#20ba5a] whitespace-nowrap shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>WhatsApp Mr. Ali</span>
            </a>

            <span className="text-xs text-slate-600 dark:text-slate-500 whitespace-nowrap shrink-0">
              Operations only · Zero PHI collected
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-white/20">
              ·
            </span>

            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                onNavigateServices();
              }}
              className="text-xs font-medium text-slate-700 underline underline-offset-4 transition-colors hover:text-[#0F766E] dark:text-slate-300 dark:hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Services
            </a>

            <span aria-hidden="true" className="text-slate-300 dark:text-white/20">
              ·
            </span>

            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigateContact();
              }}
              className="text-xs font-medium text-slate-700 underline underline-offset-4 transition-colors hover:text-[#0F766E] dark:text-slate-300 dark:hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Contact
            </a>

            <span aria-hidden="true" className="text-slate-300 dark:text-white/20">
              ·
            </span>

            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-xs font-medium text-slate-700 underline underline-offset-4 transition-colors hover:text-[#0F766E] dark:text-slate-300 dark:hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Privacy &amp; Data
            </button>

            <span aria-hidden="true" className="text-slate-300 dark:text-white/20">
              ·
            </span>

            <a
              href="/cybersecurity-resources"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCybersecurity();
              }}
              className="text-xs font-medium text-slate-700 underline underline-offset-4 transition-colors hover:text-[#0F766E] dark:text-slate-300 dark:hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Free Cybersecurity &amp; Ransomware Resources (CISA)
            </a>
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-300">
            <span>© 2024 ZSREV. All rights reserved. EMR Pulse is a product of ZSREV.</span>
            <span>|</span>
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                onNavigateServices();
              }}
              className="underline underline-offset-4 hover:text-[#0F766E] dark:hover:text-[#39FF14] cursor-pointer"
            >
              Staffing Site
            </a>
            <span>|</span>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigateContact();
              }}
              className="underline underline-offset-4 hover:text-[#0F766E] dark:hover:text-[#39FF14] cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}
