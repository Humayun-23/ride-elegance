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
