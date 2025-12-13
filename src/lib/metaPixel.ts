// Meta Pixel tracking utilities

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq?: (
      track: 'track' | 'trackCustom',
      eventName: string,
      data?: Record<string, any>
    ) => void;
  }
}

/**
 * Track when user initiates checkout
 */
export const trackInitiateCheckout = (plan: string, value: number, currency: string = 'MXN') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: `Plan ${plan}`,
      content_category: 'Santa Video Call',
      value: value,
      currency: currency,
    });
    console.log('📊 Meta Pixel: InitiateCheckout tracked', { plan, value, currency });
  }
};

/**
 * Track successful purchase
 */
export const trackPurchase = (plan: string, value: number, currency: string = 'MXN') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: `Plan ${plan}`,
      content_type: 'product',
      value: value,
      currency: currency,
    });
    console.log('📊 Meta Pixel: Purchase tracked', { plan, value, currency });
  }
};

/**
 * Track lead generation (form submission)
 */
export const trackLead = (childName: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Santa Call Form Submitted',
      content_category: 'Lead Generation',
    });
    console.log('📊 Meta Pixel: Lead tracked', { childName });
  }
};

/**
 * Track when video call starts
 */
export const trackStartCall = (plan: string, duration: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'StartVideoCall', {
      plan: plan,
      duration_minutes: duration,
    });
    console.log('📊 Meta Pixel: StartVideoCall tracked', { plan, duration });
  }
};

/**
 * Track when video call completes
 */
export const trackCompleteCall = (plan: string, duration: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'CompleteVideoCall', {
      plan: plan,
      duration_minutes: duration,
    });
    console.log('📊 Meta Pixel: CompleteVideoCall tracked', { plan, duration });
  }
};
