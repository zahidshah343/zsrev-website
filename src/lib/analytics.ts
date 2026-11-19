import { logEvent } from 'firebase/analytics';
import { initFirebaseAnalytics } from './firebase';

export type AnalyticsEventName =
  | 'page_view'
  | 'diagnostic_start'
  | 'diagnostic_complete'
  | 'pdf_export'
  | 'email_report_sent'
  | 'calendly_click'
  | 'contact_form_submit'
  | 'whatsapp_click';

type AnalyticsParamValue = string | number | boolean;

const FORBIDDEN_PII_KEYS = new Set([
  'email',
  'user_email',
  'name',
  'displayName',
  'display_name',
  'phone',
  'patient',
  'phi',
]);

function sanitizeEventParams(
  params?: Record<string, AnalyticsParamValue | undefined>
): Record<string, AnalyticsParamValue> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, AnalyticsParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (FORBIDDEN_PII_KEYS.has(key)) continue;
    cleaned[key] = value;
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * Logs non-PII product usage events to Firebase Analytics (GA4).
 * Never transmits emails, names, or Protected Health Information (PHI).
 */
export async function trackEvent(
  eventName: AnalyticsEventName,
  params?: Record<string, AnalyticsParamValue | undefined>
): Promise<void> {
  try {
    const analytics = await initFirebaseAnalytics();
    if (!analytics) return;
    const safeParams = sanitizeEventParams(params);
    if (eventName === 'page_view') {
      logEvent(analytics, 'page_view', {
        page_title:
          typeof safeParams?.page_title === 'string' ? safeParams.page_title : undefined,
      });
      return;
    }
    logEvent(analytics, eventName, safeParams);
  } catch {
    // Non-blocking: analytics errors must never disrupt user flows
  }
}
