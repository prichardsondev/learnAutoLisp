import { nanoid } from "nanoid";

type MagicLink = {
  token: string;
  email: string;
  expiresAt: number;
};

const MAGIC_LINKS = new Map<string, MagicLink>();

export const createMagicToken = (email: string): string => {
  const token = nanoid(24);
  MAGIC_LINKS.set(token, {
    token,
    email,
    expiresAt: Date.now() + 1000 * 60 * 15
  });
  return token;
};

export const consumeMagicToken = (token: string): string | null => {
  const record = MAGIC_LINKS.get(token);
  if (!record) return null;
  MAGIC_LINKS.delete(token);
  if (record.expiresAt < Date.now()) return null;
  return record.email;
};
