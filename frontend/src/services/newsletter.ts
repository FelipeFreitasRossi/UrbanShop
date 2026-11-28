import { apiRequest } from './api';

export type NewsletterSubscription = {
  email: string;
  /** Consentimento explícito (LGPD) para receber comunicações. */
  consent: true;
  source: string;
};

/** Inscreve um e-mail na newsletter (POST /api/newsletter). */
export function subscribeNewsletter(data: NewsletterSubscription) {
  return apiRequest<void>('/api/newsletter', { method: 'POST', body: data });
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
