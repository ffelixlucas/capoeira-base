const TZ_SAO_PAULO = "America/Sao_Paulo";

function isIsoWithTimezone(value) {
  return /[zZ]|[+\-]\d{2}:\d{2}$/.test(value);
}

export function parseDateTime(value, assume = "sao_paulo") {
  if (!value) return null;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00-03:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (raw.includes("T")) {
    const iso = isIsoWithTimezone(raw)
      ? raw
      : assume === "utc"
      ? `${raw}Z`
      : `${raw}-03:00`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(raw)) {
    const base = raw.replace(" ", "T");
    const iso =
      assume === "utc" ? `${base}Z` : `${base}-03:00`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value, options = {}, assume = "sao_paulo") {
  const d = parseDateTime(value, assume);
  if (!d) return "";
  return d.toLocaleDateString("pt-BR", {
    timeZone: TZ_SAO_PAULO,
    ...options,
  });
}

export function formatDateTime(value, options = {}, assume = "sao_paulo") {
  const d = parseDateTime(value, assume);
  if (!d) return "";
  return d.toLocaleString("pt-BR", {
    timeZone: TZ_SAO_PAULO,
    ...options,
  });
}

export function toTimestamp(value, assume = "sao_paulo") {
  const d = parseDateTime(value, assume);
  return d ? d.getTime() : Number.NaN;
}

export { TZ_SAO_PAULO };
