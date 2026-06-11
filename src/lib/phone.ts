const INDIA_PREFIX = "+91";
const INDIA_PREFIX_PATTERN = /^\s*\+?91[\s-]*/;

export const formatIndianPhone = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const stripped = raw.replace(INDIA_PREFIX_PATTERN, "").trimStart();
  if (!stripped) return INDIA_PREFIX;
  return `${INDIA_PREFIX} ${stripped}`;
};

export const stripIndianPrefix = (value?: string | null) => {
  const raw = String(value ?? "");
  return raw.replace(INDIA_PREFIX_PATTERN, "").trimStart();
};

export const cleanWhatsAppPhone = (value?: string | null) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

export const buildWhatsAppUrl = (phone: string | null | undefined, message: string) => {
  const cleanPhone = cleanWhatsAppPhone(phone);
  if (!cleanPhone) return "";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
