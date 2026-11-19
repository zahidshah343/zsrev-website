import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { CALENDLY_URL } from '../data/questions';
import { trackEvent } from '../lib/analytics';

interface ContactPageProps {
  onStartDiagnostic: () => void;
}

const WHATSAPP_URL = 'https://wa.me/923064330657?text=Hi%20Mr.%20Ali%2C%20I%20have%20a%20question%20about%20EMR%20Pulse.';

export function ContactPage({ onStartDiagnostic }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    trackEvent('contact_form_submit', { email });

    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <main className="flex-1 bg-slate-950 text-slate-100">
      {/* HERO SECTION */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#39FF14]/30 bg-white/[0.04] px-3.5 py-1 text-xs font-semibold text-[#39FF14] shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Direct Access · Fast Remote Advisory</span>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold leading-[1.12] tracking-tight text-white text-balance">
           Get in touch with the ZSREV team
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-slate-300 sm:text-lg">
            Whether you need help with independent practice RCM, EMR triage, or custom workflow optimization, reach out directly.
          </p>

          <p className="mt-2 text-xs font-medium text-[#39FF14] tracking-wide">
            📍 Based in Lahore, Pakistan. Serving US independent practices remotely.
          </p>
        </div>

        {/* DIRECT WHATSAPP & CONTACT CARDS */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* WhatsApp Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#39FF14]/30 bg-[#0B1017] p-6 shadow-lg shadow-[#39FF14]/5 sm:p-7">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/20 text-[#25D366]">
                  <MessageSquare className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Instant WhatsApp</h3>
                  <p className="text-xs text-slate-400">Fastest response for US clients</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Connect instantly with the ZSREV team via WhatsApp for direct operational inquiries and urgent questions
              </p>
            </div>
            <div className="mt-6">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { location: 'contact_page' })}
                className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-[#20ba5a] shadow-md cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Chat with the team on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/12 bg-[#0B1017] p-6 shadow-sm sm:p-7">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-700/30 bg-[#0F766E]/20 text-[#39FF14]">
                  <Mail className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Direct Email</h3>
                  <p className="text-xs text-slate-400">Secure inbox monitoring</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Send formal inquiries or documentation reviews directly to our primary operational inbox.
              </p>
            </div>
            <div className="mt-6">
              <a
                href="mailto:emrpulse.us@gmail.com"
                className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition-colors hover:border-[#39FF14] hover:text-[#39FF14]"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>emrpulse.us@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Calendly Demo Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/12 bg-[#0B1017] p-6 shadow-sm sm:p-7">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-700/30 bg-[#0F766E]/20 text-[#39FF14]">
                  <Calendar className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Schedule Call</h3>
                  <p className="text-xs text-slate-400">15-Minute Consultation</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Book a direct 1-on-1 video call on Calendly to review your practice setup and denial reports.
              </p>
            </div>
            <div className="mt-6">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('calendly_click', { location: 'contact_page' })}
                className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-md dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33]"
              >
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Book 15-Min Demo</span>
              </a>
            </div>
          </div>
        </div>

        {/* CONTACT FORM & INFO SECTION */}
        <div className="mt-12 rounded-2xl border border-white/12 bg-[#0B1017] p-8 shadow-xl sm:p-10">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold text-white">Send a Direct Message</h2>
            <p className="mt-2 text-sm text-slate-300">
              Fill out the form below and we will route your inquiry directly to <span className="text-[#39FF14] font-semibold">emrpulse.us@gmail.com</span>.
            </p>
          </div>

          {isSubmitted ? (
            <div className="mt-8 rounded-xl border border-[#39FF14]/35 bg-[#39FF14]/10 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#39FF14]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-bold text-white">Message Sent Successfully!</h3>
              <p className="mt-1 text-sm text-slate-300">
                Thank you, {name}. Your inquiry has been sent to Mr. Ali. We will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.1]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="mt-2 min-h-[48px] w-full rounded-xl border border-white/25 bg-[#070A0E] px-4 text-sm text-white placeholder:text-slate-500 focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Your Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sjenkins@clinic.com"
                    className="mt-2 min-h-[48px] w-full rounded-xl border border-white/25 bg-[#070A0E] px-4 text-sm text-white placeholder:text-slate-500 focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Message / Practice Inquiry
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your practice struggle, billing lag, or EHR questions..."
                  className="mt-2 w-full rounded-xl border border-white/25 bg-[#070A0E] p-4 text-sm text-white placeholder:text-slate-500 focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-7 py-3.5 text-sm font-bold text-[#070A0E] transition-colors hover:bg-[#52FF33] shadow-md disabled:opacity-60 cursor-pointer"
                >
                  <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message to Mr. Ali'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* BOTTOM DIAGNOSTIC PROMPT */}
        <div className="mt-12 rounded-2xl border border-teal-700/30 bg-teal-950/20 p-8 text-center sm:p-10">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
            Want an instant automated breakdown before we chat?
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
            Run our 2-minute vendor-neutral diagnostic tool to generate your practice risk score and PDF report instantly.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D5F59] shadow-md dark:bg-[#39FF14] dark:text-[#070A0E] dark:hover:bg-[#52FF33] cursor-pointer"
            >
              <span>Run Free Diagnostic Now</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
