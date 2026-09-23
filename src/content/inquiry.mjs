// A configured address must be approved for public inquiries and open to them.
/** @param {string | null} contactEmail */
export function getInquiryState(contactEmail) {
  const open = Boolean(contactEmail);
  return {
    open,
    primary: open
      ? { label: 'Discuss your case', href: '/support/#early-access' }
      : { label: 'Explore applications', href: '/showcases/' },
    status: open
      ? 'In development. Discuss suitability for your application.'
      : 'In development. Explore the initial application focus below.',
  };
}

export const inquiryOutline =
  'My design question:\n\nWhat I want to compare:\n\nThe decision this would inform:\n\nOperating system and GPU (optional):';

/** @param {string} address @param {string} outline @param {string} subject */
export function inquiryHref(
  address,
  outline,
  subject = 'Prelimina — discuss my case',
) {
  // The content check validates the address; encode reserved local-part characters too.
  const [local, domain] = address.split('@');
  return `mailto:${encodeURIComponent(local)}@${domain}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(outline)}`;
}
