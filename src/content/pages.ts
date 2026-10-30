import site from './site.json';

export const pages = {
  showcases: {
    title: 'Applications',
    description:
      'Check sloshing wall pressure against measurements, then explore prescribed tank roll, tank drainage, gated spillways, and reduced-gravity sloshing with GPU-native CFD. Each application states the question, inputs, and what to compare.',
  },
  capabilities: {
    title: 'Capabilities',
    description:
      'Explore Prelimina’s features and where each stands today. Have a feature in mind? We welcome your suggestions—tell us what would help in your work.',
  },
  legal: {
    title: 'Legal',
    description:
      'Every legal document for Prelimina in one place, and which one applies to you.',
  },
  confirmed: {
    title: 'You’re on the list.',
    description:
      'Thanks for confirming. We’ll email you when new Prelimina releases ship, and nothing else.',
  },
  changelog: {
    title: 'The story starts here.',
    description:
      'There are no public releases to announce yet. This page will record approved release notes when the first public build is available.',
  },
} as const;

// Documents under /legal/. The summary says on the hub page when each applies.
export const legalPages = {
  licence: {
    title: 'Prelimina Licence Agreement',
    description:
      'How you may use the Prelimina software: free for noncommercial use, with a paid licence or subscription required for commercial use.',
    summary:
      'How you may use the Prelimina software. Applies to everyone who installs or runs it: free for noncommercial use, a paid licence or subscription for commercial use.',
  },
  terms: {
    title: 'Terms of Service',
    description:
      'The terms for using this website and for buying Prelimina commercial licences and subscriptions from PLASMICA d.o.o.',
    summary:
      'Using this website and buying a commercial licence or subscription through our reseller Paddle: orders, renewal, cancellation.',
  },
  refunds: {
    title: 'Refund Policy',
    description:
      'How refunds work for Prelimina commercial licences and subscriptions.',
    summary: `Full refund within ${site.policies.refundDays} days of any payment, and how to request one.`,
  },
  privacy: {
    title: 'Privacy Notice',
    description:
      'What personal data PLASMICA d.o.o. collects through this website, release updates, correspondence, and purchases, and the rights you have over it.',
    summary:
      'What personal data we collect through the website, release updates, emails, and purchases, and your rights over it.',
  },
} as const;
