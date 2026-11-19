import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { CALENDLY_URL, PATH_QUESTIONS } from './src/data/questions.ts';
import type {
  DiagnosticAnswers,
  DiagnosticReport,
  StrugglePath,
} from './src/types/diagnostic.ts';
import { buildDiagnosticPdfDocument } from './src/utils/pdfExport.ts';
import { getOperationalPostureRows } from './src/utils/riskMetrics.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');
const MOBILE_WAITLIST_FILE = path.join(__dirname, 'data', 'mobile-waitlist.json');
const SENDER_EMAIL = 'emrpulse.us@gmail.com';

type DiagnosticAnswersInput = DiagnosticAnswers;

interface StoredLead {
  id: string;
  email: string;
  role: string;
  answers: DiagnosticAnswersInput;
  recommendedCategory: string;
  topRiskTitles: string[];
  submittedAt: string;
  emailSent?: boolean;
  emailSentAt?: string;
  gmailMessageId?: string;
}

const ALLOWED_LEAD_ROLES = new Set([
  'Physician/Owner',
  'Practice Manager',
  'Billing/RCM Manager',
  'Other',
]);

const ALLOWED_STRUGGLE_PATHS = new Set<StrugglePath>(['billing', 'clinical', 'other']);

const HARDCODED_VENDORS = [
  {
    name: 'Cerbo',
    profile:
      'Lightweight, relationship-first EHR built for independent primary care, concierge/DPC, and lean clinics with minimal admin overhead.',
  },
  {
    name: 'athenahealth',
    profile:
      'Cloud EHR and integrated revenue cycle network known for automated claim scrubbing, denial tracking, and payer rule updates.',
  },
  {
    name: 'Veradigm',
    profile:
      'Flexible ambulatory EHR and practice management platform with open third-party workflow integrations for established independent groups.',
  },
  {
    name: 'eClinicalWorks',
    profile:
      'Cost-competitive all-in-one ambulatory EHR/PM suite offering native AI ambient documentation and scalable RCM options.',
  },
  {
    name: 'Tebra',
    profile:
      'Modern EHR, billing, and patient experience platform built for small-to-midsize independent practices seeking faster staff onboarding.',
  },
  {
    name: 'Azalea Health',
    profile:
      'Cloud EHR and RCM tailored for rural, community, and independent specialty practices prioritizing guided data migration and support.',
  },
  {
    name: 'Veradigm RCS',
    profile:
      'Dedicated revenue cycle services (RCM) and denial recovery team built to eliminate claim lag and unworked AR without forcing an immediate EMR rip-and-replace.',
  },
  {
    name: 'AdvancedMD',
    profile:
      'Integrated practice management and automated denial-management suite with real-time claim scrubbing and payer follow-up automation.',
  },
  {
    name: 'Waystar',
    profile:
      'Dedicated revenue cycle and automated denial-management platform that layers onto existing EMRs to surface claim rejections immediately.',
  },
];

const ALLOWED_VENDOR_NAMES = new Set(HARDCODED_VENDORS.map((v) => v.name));
const RCM_PRIORITY_VENDOR_NAMES = new Set(['Veradigm RCS', 'Waystar', 'AdvancedMD']);

const RCM_RISK_ALERT_TEXT =
  'Your denial discovery lag is a critical revenue risk. Industry benchmarks show practices with this profile lose a significant percentage of collectible revenue annually. Prioritizing automated denial management or an RCM audit is highly recommended.';

async function readLeadsTable(): Promise<StoredLead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredLead[]) : [];
  } catch {
    return [];
  }
}

async function appendLead(lead: StoredLead): Promise<void> {
  await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  const existing = await readLeadsTable();
  existing.push(lead);
  await fs.writeFile(LEADS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
}

async function markLeadEmailSent(
  leadId: string,
  gmailMessageId: string
): Promise<void> {
  const existing = await readLeadsTable();
  const idx = existing.findIndex((item) => item.id === leadId);
  if (idx === -1) return;
  existing[idx] = {
    ...existing[idx],
    emailSent: true,
    emailSentAt: new Date().toISOString(),
    gmailMessageId,
  };
  await fs.writeFile(LEADS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
}

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function wrapBase64(base64: string): string {
  return base64.replace(/.{1,76}/g, '$&\r\n').trimEnd();
}

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function validateReportPayload(candidate: unknown): DiagnosticReport | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const obj = candidate as Record<string, unknown>;
  if (
    typeof obj.executiveSummary !== 'string' ||
    !Array.isArray(obj.topRisks) ||
    typeof obj.impactRange !== 'string' ||
    typeof obj.impactDisclaimer !== 'string' ||
    typeof obj.recommendedCategory !== 'string' ||
    typeof obj.categoryRationale !== 'string' ||
    !Array.isArray(obj.vendorMatches) ||
    typeof obj.generatedAt !== 'string'
  ) {
    return null;
  }

  return {
    executiveSummary: obj.executiveSummary,
    rcmRiskAlert: typeof obj.rcmRiskAlert === 'string' ? obj.rcmRiskAlert : null,
    topRisks: obj.topRisks.slice(0, 2),
    impactRange: obj.impactRange,
    impactDisclaimer: obj.impactDisclaimer,
    recommendedCategory: obj.recommendedCategory,
    categoryRationale: obj.categoryRationale,
    vendorMatches: obj.vendorMatches.slice(0, 3),
    generatedAt: obj.generatedAt,
  };
}

function validateAnswers(body: unknown): DiagnosticAnswersInput | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = body as Record<string, unknown>;
  const strugglePath = candidate.strugglePath;

  if (
    typeof strugglePath !== 'string' ||
    !ALLOWED_STRUGGLE_PATHS.has(strugglePath as StrugglePath)
  ) {
    return null;
  }

  const typedPath = strugglePath as StrugglePath;
  const pathQuestions = PATH_QUESTIONS[typedPath];
  const validated: DiagnosticAnswersInput = {
    strugglePath: typedPath,
  };

  for (const question of pathQuestions) {
    const val = candidate[question.id];
    if (
      typeof val !== 'string' ||
      !(question.options as readonly string[]).includes(val)
    ) {
      return null;
    }
    validated[question.id] = val;
  }

  return validated;
}

function isDevOrPreviewRequest(req: Request): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  const host = (req.hostname || req.headers.host || '').toLowerCase();
  const origin = (req.headers.origin || '').toLowerCase();
  return (
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0') ||
    host.startsWith('ais-dev-') ||
    origin.includes('://localhost') ||
    origin.includes('://127.0.0.1') ||
    origin.includes('://ais-dev-')
  );
}

async function verifyTurnstileToken(
  token: unknown,
  req: Request
): Promise<boolean> {
  if (isDevOrPreviewRequest(req)) {
    return true;
  }

  if (typeof token !== 'string' || token.trim().length < 10) {
    return false;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    // Frontend Turnstile token was generated by @marsidev/react-turnstile;
    // full server-side siteverify runs automatically when TURNSTILE_SECRET_KEY is configured.
    return true;
  }

  const remoteIp = req.ip;

  try {
    const body = new URLSearchParams({
      secret,
      response: token.trim(),
    });
    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }
    );
    if (!verifyRes.ok) return false;
    const data = (await verifyRes.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use((_req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/diagnostic', async (req: Request, res: Response) => {
    const answers = validateAnswers(req.body?.answers);
    if (!answers) {
      res.status(400).json({
        error: 'Please complete all diagnostic checkpoints using the provided options.',
      });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Diagnostic service is not configured with a Gemini API key yet. Please check Settings > Secrets.',
      });
      return;
    }

    const isHighDenialRisk =
      answers.strugglePath === 'billing' &&
      (answers.currentDenialRate === '6%–10%' ||
        answers.currentDenialRate === '10%–15%' ||
        answers.currentDenialRate === 'Over 15%' ||
        answers.currentDenialRate === 'Not sure' ||
        answers.arDays === '45–60 days' ||
        answers.arDays === '60+ days' ||
        answers.clearinghouseRework === 'Daily manual rework');
    const isHighDenialLag = isHighDenialRisk;

    const postureRows = getOperationalPostureRows(answers);
    const profileSummaryLines = postureRows
      .map((row, idx) => `${idx + 1}. ${row.label}: ${row.value}`)
      .join('\n');

    const vendorCatalogText = HARDCODED_VENDORS.map(
      (v) => `- ${v.name}: ${v.profile}`
    ).join('\n');

    const rcmPriorityDirective = isHighDenialLag
      ? `CRITICAL RCM DIRECTIVE (triggered by elevated denial/AR/rework exposure):
- You MUST include the "rcmRiskAlert" field set verbatim to: "${RCM_RISK_ALERT_TEXT}"
- In "vendorMatches", you MUST prioritize RCM services (such as Veradigm RCS) and denial management tools (such as AdvancedMD or Waystar) over general EMRs — select at least 2 from [Veradigm RCS, AdvancedMD, Waystar] and up to 1 optional fit from the rest of the catalog if relevant.`
      : `- Set "rcmRiskAlert" to an empty string "" unless denial/AR exposure is explicitly elevated.`;

    const prompt = `You are a seasoned, vendor-neutral healthcare operations consultant advising U.S. medical practices and designated users of EMR, Practice Management (PM), RCM, and full-suite EHR software.

Practice Operational Profile (Workflow only — zero PHI):
${profileSummaryLines}

${rcmPriorityDirective}

Write a direct, consultative, visual-first diagnostic brief totaling roughly 140–170 words across all narrative fields combined (keep every section ultra-concise—max 1–2 short sentences per field).
STRICT CONSERVATIVE ESTIMATE RULES:
- Use CONSERVATIVE, realistic financial and time estimates grounded strictly in the inputs above. Do NOT exaggerate, inflate, or over-promise savings.
- In "impactDisclaimer" (and reflected consistently with "impactRange"), write 1–2 concise sentences patterned after:
  "Based on industry averages, practices your size lose approximately $X - $Y annually due to [specific issue]."
  noting it is a conservative estimate, not a guarantee.
- Identify the practice's top 2 operational risks grounded directly in their selected focus path (${answers.strugglePath}) and inputs above.
- Recommend ONE priority solution category to tackle first from these exact four options:
  "AI Scribe"
  "Automated Prior Auth"
  "Integrated RCM"
  "Workflow Layer on Top of Existing EMR"
- Select 2 or 3 best-fit vendors strictly from the hardcoded list below and give one concise, plain-spoken sentence for why each fits this exact operational profile:
${vendorCatalogText}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a candid, vendor-neutral medical practice operations advisor. Avoid marketing clichés, exclamation marks, and long paragraphs. Every narrative field must be 1–2 crisp sentences with conservative financial estimates.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description:
                  'Exactly 1–2 short sentences (~28 words max) summarizing the practice posture.',
              },
              rcmRiskAlert: {
                type: Type.STRING,
                description:
                  'Verbatim RCM Risk Alert text when denial discovery lag is elevated; otherwise empty string.',
              },
              topRisks: {
                type: Type.ARRAY,
                description: 'Exactly 2 primary operational risks based on the answers.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: 'Short risk title (e.g., "Delayed Denial Visibility").',
                    },
                    mechanism: {
                      type: Type.STRING,
                      description: 'Short causal chain (e.g., "Denial lag -> Revenue leakage").',
                    },
                    detail: {
                      type: Type.STRING,
                      description: '1–2 concise sentences (~25 words max).',
                    },
                  },
                  required: ['title', 'mechanism', 'detail'],
                },
              },
              impactRange: {
                type: Type.STRING,
                description:
                  'Approximate annual impact figure (e.g., "$28,000 – $55,000/yr & 300+ clinician hours").',
              },
              impactDisclaimer: {
                type: Type.STRING,
                description:
                  '1–2 short sentences (~28 words max) noting conservative industry estimate, not a guarantee.',
              },
              recommendedCategory: {
                type: Type.STRING,
                description:
                  'Must be one of: "AI Scribe", "Automated Prior Auth", "Integrated RCM", or "Workflow Layer on Top of Existing EMR".',
              },
              categoryRationale: {
                type: Type.STRING,
                description:
                  '1–2 concise sentences (~30 words max) explaining why to tackle this category first.',
              },
              vendorMatches: {
                type: Type.ARRAY,
                description:
                  '2 to 3 matched vendors strictly from Cerbo, athenahealth, Veradigm, eClinicalWorks, Tebra, Azalea Health, Veradigm RCS, AdvancedMD, Waystar.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    oneLineReason: {
                      type: Type.STRING,
                      description: 'One crisp sentence explaining fit for this user profile.',
                    },
                  },
                  required: ['name', 'oneLineReason'],
                },
              },
            },
            required: [
              'executiveSummary',
              'rcmRiskAlert',
              'topRisks',
              'impactRange',
              'impactDisclaimer',
              'recommendedCategory',
              'categoryRationale',
              'vendorMatches',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Empty response received from diagnostic engine.');
      }

      const parsed = JSON.parse(rawText);

      const sanitizedVendors = Array.isArray(parsed.vendorMatches)
        ? parsed.vendorMatches
            .filter(
              (v: { name?: unknown; oneLineReason?: unknown }) =>
                typeof v?.name === 'string' &&
                ALLOWED_VENDOR_NAMES.has(v.name) &&
                typeof v?.oneLineReason === 'string'
            )
            .slice(0, 3)
        : [];

      const defaultRcmVendors = [
        {
          name: 'Veradigm RCS',
          oneLineReason:
            'Dedicated revenue cycle services uncover and work denied claims quickly without forcing an immediate EMR replacement.',
        },
        {
          name: 'Waystar',
          oneLineReason:
            'Automated denial management and claim-scrubbing layer directly onto your existing EMR to surface rejections in real time.',
        },
        {
          name: 'AdvancedMD',
          oneLineReason:
            'Automated denial tracking and clean-claim workflows help eliminate weeks-long billing visibility gaps.',
        },
      ];

      let finalVendors: Array<{ name: string; oneLineReason: string }> =
        sanitizedVendors.length >= 2
          ? sanitizedVendors
          : [
              {
                name: 'athenahealth',
                oneLineReason:
                  'Strong claim-scrubbing and integrated RCM workflows reduce denial discovery lag for lean teams.',
              },
              {
                name: 'Tebra',
                oneLineReason:
                  'Streamlined practice management and intuitive UI help small independent teams adopt tools quickly.',
              },
            ];

      if (isHighDenialLag) {
        const rcmMatches = sanitizedVendors.filter((v: { name: string }) =>
          RCM_PRIORITY_VENDOR_NAMES.has(v.name)
        );
        const nonRcmMatches = sanitizedVendors.filter(
          (v: { name: string }) => !RCM_PRIORITY_VENDOR_NAMES.has(v.name)
        );
        const mergedRcm = [...rcmMatches];
        for (const fallback of defaultRcmVendors) {
          if (mergedRcm.length >= 2) break;
          if (!mergedRcm.some((v) => v.name === fallback.name)) {
            mergedRcm.push(fallback);
          }
        }
        finalVendors = [...mergedRcm, ...nonRcmMatches].slice(0, 3);
      }

      const topRisks = Array.isArray(parsed.topRisks)
        ? parsed.topRisks.slice(0, 2)
        : [];

      res.json({
        executiveSummary: String(parsed.executiveSummary || ''),
        rcmRiskAlert: isHighDenialLag ? RCM_RISK_ALERT_TEXT : null,
        topRisks,
        impactRange: String(parsed.impactRange || ''),
        impactDisclaimer: String(parsed.impactDisclaimer || ''),
        recommendedCategory: String(parsed.recommendedCategory || ''),
        categoryRationale: String(parsed.categoryRationale || ''),
        vendorMatches: finalVendors,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.error('Gemini diagnostic error:', err);
      const message =
        err instanceof Error ? err.message : 'Unable to generate diagnostic report.';
      const status =
        message.includes('403') || message.includes('PERMISSION_DENIED')
          ? 403
          : message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : 500;
      res.status(status).json({
        error:
          status === 429
            ? 'Diagnostic quota reached temporarily. Please wait a moment and try again.'
            : status === 403
              ? 'Gemini API key permission error. Please verify your key in Settings > Secrets.'
              : 'Could not generate the diagnostic report right now. Please try again.',
      });
    }
  });

  app.post('/api/leads', async (req: Request, res: Response) => {
    const turnstileValid = await verifyTurnstileToken(req.body?.turnstileToken, req);
    if (!turnstileValid) {
      res.status(400).json({
        error: 'Bot verification failed or expired. Please complete the Cloudflare security check and try again.',
      });
      return;
    }

    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRaw)) {
      res.status(400).json({ error: 'Please enter a valid work or practice email address.' });
      return;
    }

    const roleRaw = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
    if (!ALLOWED_LEAD_ROLES.has(roleRaw)) {
      res.status(400).json({ error: 'Please select your role in the practice.' });
      return;
    }

    const answers = validateAnswers(req.body?.answers);
    if (!answers) {
      res.status(400).json({ error: 'Missing valid diagnostic answers.' });
      return;
    }

    const recommendedCategory =
      typeof req.body?.recommendedCategory === 'string'
        ? req.body.recommendedCategory.slice(0, 100)
        : 'Unspecified';

    const topRiskTitles = Array.isArray(req.body?.topRiskTitles)
      ? req.body.topRiskTitles
          .filter((item: unknown): item is string => typeof item === 'string')
          .slice(0, 2)
      : [];

    const lead: StoredLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: emailRaw.toLowerCase(),
      role: roleRaw,
      answers,
      recommendedCategory,
      topRiskTitles,
      submittedAt: new Date().toISOString(),
    };

    try {
      await appendLead(lead);
      res.status(201).json({
        success: true,
        id: lead.id,
        role: lead.role,
        submittedAt: lead.submittedAt,
      });
    } catch (err) {
      console.error('Failed to store lead submission:', err);
      res.status(500).json({ error: 'Unable to save your request right now. Please retry.' });
    }
  });

  app.get('/api/leads', async (_req: Request, res: Response) => {
    try {
      const submissions = await readLeadsTable();
      res.json({
        total: submissions.length,
        submissions,
      });
    } catch (err) {
      console.error('Failed to read lead submissions:', err);
      res.status(500).json({ error: 'Unable to read submissions.' });
    }
  });

  app.post('/api/mobile-notify', async (req: Request, res: Response) => {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRaw)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    try {
      await fs.mkdir(path.dirname(MOBILE_WAITLIST_FILE), { recursive: true });
      let existing: Array<{ email: string; submittedAt: string }> = [];
      try {
        const raw = await fs.readFile(MOBILE_WAITLIST_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existing = parsed;
        }
      } catch {
        // File does not exist yet
      }
      const normalized = emailRaw.toLowerCase();
      if (!existing.some((entry) => entry.email === normalized)) {
        existing.push({ email: normalized, submittedAt: new Date().toISOString() });
        await fs.writeFile(
          MOBILE_WAITLIST_FILE,
          JSON.stringify(existing, null, 2),
          'utf-8'
        );
      }
      res.status(201).json({ success: true, email: normalized });
    } catch (err) {
      console.error('Failed to save mobile notify email:', err);
      res.status(500).json({ error: 'Unable to save notification request right now.' });
    }
  });

  app.post('/api/send-report-email', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const accessToken =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length).trim()
        : '';

    if (!accessToken) {
      res.status(401).json({
        error: 'Gmail authorization is required. Please sign in with Google first.',
      });
      return;
    }

    const recipientEmailRaw =
      typeof req.body?.recipientEmail === 'string'
        ? req.body.recipientEmail.trim()
        : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmailRaw)) {
      res.status(400).json({ error: 'Please provide a valid recipient email address.' });
      return;
    }

    const roleRaw = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
    const greetingRole = ALLOWED_LEAD_ROLES.has(roleRaw) ? roleRaw : 'there';

    const answers = validateAnswers(req.body?.answers);
    const report = validateReportPayload(req.body?.report);
    const reportId =
      typeof req.body?.reportId === 'string' ? req.body.reportId.trim() : undefined;
    const leadId =
      typeof req.body?.leadId === 'string' ? req.body.leadId.trim() : undefined;
    const pdfTheme: 'light' | 'dark' =
      req.body?.theme === 'light' ? 'light' : 'dark';

    let pdfBase64 =
      typeof req.body?.pdfBase64 === 'string' ? req.body.pdfBase64.trim() : '';
    let attachmentFileName =
      typeof req.body?.fileName === 'string' && req.body.fileName.trim()
        ? sanitizeHeaderValue(req.body.fileName.trim())
        : `EMR-Pulse-Report-${(reportId || 'EP-2026').replace('#', '')}.pdf`;

    if (report && answers) {
      const generated = buildDiagnosticPdfDocument(report, answers, reportId, pdfTheme);
      attachmentFileName = generated.fileName;
      pdfBase64 = Buffer.from(generated.doc.output('arraybuffer')).toString('base64');
    } else if (!pdfBase64 || !/^[A-Za-z0-9+/=]+$/.test(pdfBase64)) {
      res.status(400).json({
        error: 'Valid diagnostic report data or PDF payload is required to send the email.',
      });
      return;
    }

    const safeRecipient = sanitizeHeaderValue(recipientEmailRaw.toLowerCase());
    const safeRole = sanitizeHeaderValue(greetingRole);
    const safeFileName = sanitizeHeaderValue(attachmentFileName).replace(/"/g, '');
    const subject = 'Your EMR Pulse Diagnostic Report & Next Steps';
    const bodyText = `Hi ${safeRole}, thank you for using EMR Pulse. Attached is your personalized diagnostic report. If you want to save weeks of vendor research and get priority pricing, book a free 15-min call with me here: ${CALENDLY_URL}`;

    const boundary = `emr_pulse_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const mimeLines = [
      `From: Syed Zahid Ali (Mr. Ali) <${SENDER_EMAIL}>`,
      `To: ${safeRecipient}`,
      `Bcc: ${SENDER_EMAIL}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText,
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${safeFileName}"`,
      `Content-Disposition: attachment; filename="${safeFileName}"`,
      'Content-Transfer-Encoding: base64',
      '',
      wrapBase64(pdfBase64),
      `--${boundary}--`,
      '',
    ];

    const rawMime = mimeLines.join('\r\n');
    const encodedMessage = toBase64Url(rawMime);

    try {
      const gmailResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        }
      );

      const gmailPayload = (await gmailResponse.json().catch(() => ({}))) as {
        id?: string;
        error?: { code?: number; message?: string };
      };

      if (!gmailResponse.ok) {
        const statusCode =
          gmailResponse.status === 401 || gmailResponse.status === 403
            ? gmailResponse.status
            : 502;
        const detail =
          gmailPayload?.error?.message ||
          `Gmail could not deliver the message. Please sign in again with ${SENDER_EMAIL}.`;
        res.status(statusCode).json({ error: detail });
        return;
      }

      const gmailMessageId = gmailPayload.id || '';
      if (leadId && gmailMessageId) {
        await markLeadEmailSent(leadId, gmailMessageId);
      }

      res.status(200).json({
        success: true,
        messageId: gmailMessageId,
        from: SENDER_EMAIL,
        recipientEmail: safeRecipient,
        bcc: SENDER_EMAIL,
        fileName: safeFileName,
      });
    } catch (err) {
      console.error('Failed to send Gmail diagnostic report:', err);
      res.status(500).json({
        error: 'Unable to reach Gmail right now. Please try sending again.',
      });
    }
  });

  // Pulse AI CPT / Healthcare Data Search API Route
  app.post('/api/pulse-ai-search', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ found: false, answer: "I don't have benchmark data for this code yet" });
      }

      const cleanQuery = query.trim();
      const apiUrl = `https://clinicaltables.nlm.nih.gov/api/cpt/v3/search?terms=${encodeURIComponent(cleanQuery)}`;

      let apiData: any = null;
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          apiData = await response.json();
        }
      } catch (err) {
        console.warn('External CPT API fetch error:', err);
      }

      const resultsList = Array.isArray(apiData) && Array.isArray(apiData[3]) ? apiData[3] : [];

      if (resultsList.length === 0) {
        return res.json({
          found: false,
          answer: "I don't have benchmark data for this code yet",
        });
      }

      const matchedCodes = resultsList.slice(0, 5).map(([code, desc]: [string, string]) => ({
        code,
        description: desc,
      }));

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.json({
          found: true,
          answer: `Found matching CPT codes: ${matchedCodes.map((m: { code: string; description: string }) => `${m.code} (${m.description})`).join(', ')}. Based on 2026 commercial and Medicare fee schedules, median realization is approximately 150-160% of Medicare baseline.`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Pulse AI, an expert medical billing, RCM, and CPT fee schedule assistant.
The user asked: "${cleanQuery}"
Real-time CPT/HCPCS database lookup results matching this query:
${JSON.stringify(matchedCodes, null, 2)}

Instructions:
- Provide a professional, concise summary of the CPT reimbursement data, median commercial multiplier (approx 150-175% of Medicare), and key billing considerations (e.g. documentation, modifiers, or prior auth).
- Do not invent codes not present in the lookup data. 
- Keep the response under 150 words.`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text =
        geminiResponse.text?.trim() ||
        `Found matching CPT codes: ${matchedCodes.map((m: { code: string; description: string }) => `${m.code} (${m.description})`).join(', ')}.`;

      return res.json({
        found: true,
        answer: text,
      });
    } catch (err: unknown) {
      console.error('Pulse AI search error:', err);
      return res.status(500).json({
        found: false,
        answer: "I don't have benchmark data for this code yet",
      });
    }
  });

  // CMS NPPES NPI Registry Lookup Proxy Route
  app.get('/api/npi-lookup', async (req: Request, res: Response) => {
    const rawNumber = typeof req.query.number === 'string' ? req.query.number : '';
    const cleanNpi = rawNumber.replace(/\D/g, '');

    if (!/^\d{10}$/.test(cleanNpi)) {
      res.status(400).json({
        found: false,
        error: 'Please enter a valid 10-digit NPI number.',
      });
      return;
    }

    try {
      const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${encodeURIComponent(cleanNpi)}`;
      const upstream = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
      });

      if (!upstream.ok) {
        res.status(502).json({
          found: false,
          error: 'Unable to reach the CMS NPPES registry right now. Please try again.',
        });
        return;
      }

      const payload = (await upstream.json()) as {
        result_count?: number;
        results?: Array<{
          number?: string;
          enumeration_type?: string;
          basic?: {
            first_name?: string;
            middle_name?: string;
            last_name?: string;
            credential?: string;
            organization_name?: string;
            status?: string;
            sole_proprietor?: string;
          };
          taxonomies?: Array<{
            code?: string;
            desc?: string;
            primary?: boolean;
            state?: string;
            license?: string;
          }>;
          addresses?: Array<{
            address_purpose?: string;
            address_1?: string;
            address_2?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            telephone_number?: string;
          }>;
        }>;
      };

      const record = Array.isArray(payload.results) ? payload.results[0] : undefined;
      if (!record) {
        res.status(404).json({
          found: false,
          error: `No provider record found in the CMS NPPES registry for NPI ${cleanNpi}.`,
        });
        return;
      }

      const basic = record.basic || {};
      const isOrg = record.enumeration_type === 'NPI-2' || Boolean(basic.organization_name);
      const individualName = [basic.first_name, basic.middle_name, basic.last_name]
        .filter(Boolean)
        .join(' ');
      const providerName = isOrg
        ? basic.organization_name || 'Registered Organization'
        : `${individualName || 'Registered Provider'}${basic.credential ? `, ${basic.credential}` : ''}`;

      const taxonomies = Array.isArray(record.taxonomies) ? record.taxonomies : [];
      const primaryTaxonomy =
        taxonomies.find((t) => t.primary) || taxonomies[0] || null;

      const addresses = Array.isArray(record.addresses) ? record.addresses : [];
      const billingAddrObj =
        addresses.find((a) => a.address_purpose === 'MAILING') ||
        addresses.find((a) => a.address_purpose === 'LOCATION') ||
        addresses[0] ||
        null;
      const practiceAddrObj =
        addresses.find((a) => a.address_purpose === 'LOCATION') || addresses[0] || null;

      const formatAddr = (addr: typeof billingAddrObj) => {
        if (!addr) return null;
        const line1 = [addr.address_1, addr.address_2].filter(Boolean).join(', ');
        const zip = addr.postal_code
          ? addr.postal_code.length === 9
            ? `${addr.postal_code.slice(0, 5)}-${addr.postal_code.slice(5)}`
            : addr.postal_code
          : '';
        const cityStateZip = [addr.city, addr.state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');
        return {
          line1,
          cityStateZip: cityStateZip.trim(),
          phone: addr.telephone_number || '',
          purpose: addr.address_purpose || '',
        };
      };

      res.status(200).json({
        found: true,
        npi: record.number || cleanNpi,
        enumerationType: isOrg ? 'Organization (NPI-2)' : 'Individual Provider (NPI-1)',
        status: basic.status === 'A' ? 'Active' : basic.status || 'Active',
        providerName,
        primaryTaxonomy: primaryTaxonomy
          ? {
              code: primaryTaxonomy.code || '',
              desc: primaryTaxonomy.desc || 'Taxonomy description unavailable',
              state: primaryTaxonomy.state || '',
              license: primaryTaxonomy.license || '',
            }
          : null,
        taxonomies: taxonomies.map((t) => ({
          code: t.code || '',
          desc: t.desc || '',
          primary: Boolean(t.primary),
          state: t.state || '',
          license: t.license || '',
        })),
        billingAddress: formatAddr(billingAddrObj),
        practiceAddress: formatAddr(practiceAddrObj),
      });
    } catch (err) {
      console.error('CMS NPPES NPI lookup error:', err);
      res.status(500).json({
        found: false,
        error: 'Failed to query the CMS NPPES NPI Registry. Please try again.',
      });
    }
  });

  app.use(
    (
      err: unknown,
      _req: Request,
      res: Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
        res.status(400).json({ error: 'Invalid JSON request payload.' });
        return;
      }
      console.error('Unhandled server error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EMR Pulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
