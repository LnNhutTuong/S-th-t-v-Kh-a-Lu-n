//tranh truong hop nap ko kip 
export const getAllowedDomains = () =>
  (process.env.ALLOWED_EMAIL_DOMAINS ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);