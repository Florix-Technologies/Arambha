type GtagParams = Record<string, string | number | boolean | undefined>;

/** Sends a GA4 event when GA is loaded (NEXT_PUBLIC_GA_ID set); otherwise does nothing. */
export function track(event: 'click_call' | 'click_whatsapp' | 'submit_enquiry' | 'click_enquiry', params: GtagParams = {}): void {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') gtag('event', event, params);
  } catch {
    // Tracking must never break the page.
  }
}
