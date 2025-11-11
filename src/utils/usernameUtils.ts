import crypto from 'crypto';

const sanitize = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'user';

export const usernameFromEmail = (email: string) => {
  const sanitized = sanitize(email);
  const hash = crypto
    .createHash('sha1')
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 10);
  return `usr_${sanitized}_${hash}`;
};
