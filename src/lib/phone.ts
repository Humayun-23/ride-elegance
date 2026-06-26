const INDIA_PREFIX = "+91";

const stripIndianCountryCode = (value: string) => {
  const raw = value.trimStart();
  if (raw.startsWith(INDIA_PREFIX)) {
    return raw.slice(INDIA_PREFIX.length).replace(/^[\s-]+/, "");
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && /^91[\s-]*/.test(raw)) {
    return raw.replace(/^91[\s-]*/, "");
  }

  return raw;
};

export const formatIndianPhone = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const stripped = stripIndianCountryCode(raw).trimStart();
  if (!stripped) return INDIA_PREFIX;
  return `${INDIA_PREFIX} ${stripped}`;
};

export const stripIndianPrefix = (value?: string | null) => {
  const raw = String(value ?? "");
  return stripIndianCountryCode(raw).trimStart();
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
