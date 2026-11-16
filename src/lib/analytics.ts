export type AnalyticsEvent =
  | "call_click"
  | "whatsapp_click"
  | "form_start"
  | "form_submit"
  | "service_selected";

declare global {
  interface Window {
    dataLayer?: Array<unknown>;
  }
}

// Google Ads: конверсия «Обращение (звонок, WhatsApp, заявка)»
const GOOGLE_ADS_CONVERSION = "AW-18541154440/FI2aCLua2rkdEIihjolF";

const CONVERSION_EVENTS: AnalyticsEvent[] = [
  "call_click",
  "whatsapp_click",
  "form_submit",
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  // gtag ожидает именно объект arguments
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export function trackEvent(
  event: AnalyticsEvent,
  details: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...details });

  if (CONVERSION_EVENTS.includes(event)) {
    gtag("event", "conversion", { send_to: GOOGLE_ADS_CONVERSION });
  }
}
