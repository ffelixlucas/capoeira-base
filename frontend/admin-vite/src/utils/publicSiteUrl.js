function normalizeUrl(url) {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

function parseSiteMap(raw) {
  if (!raw || typeof raw !== "string") return {};

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function resolvePublicSiteUrl(slug) {
  const normalizedSlug = String(slug || "").trim().toLowerCase();

  const mapRaw = import.meta.env.VITE_PUBLIC_SITE_URL_MAP;
  const siteMap = parseSiteMap(mapRaw);

  if (normalizedSlug && typeof siteMap[normalizedSlug] === "string") {
    const byMap = normalizeUrl(siteMap[normalizedSlug]);
    if (byMap) return byMap;
  }

  const template = import.meta.env.VITE_PUBLIC_SITE_URL_TEMPLATE;
  if (template && normalizedSlug) {
    const byTemplate = normalizeUrl(template.replaceAll("{slug}", normalizedSlug));
    if (byTemplate) return byTemplate;
  }

  const defaultUrl = normalizeUrl(import.meta.env.VITE_PUBLIC_SITE_URL);
  if (defaultUrl) return defaultUrl;

  return "/";
}
