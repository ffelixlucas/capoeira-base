import { useEffect, useMemo, useState } from "react";
import { buscarOrganizacaoPorSlug } from "../../../services/shared/organizacaoService";
import { resolvePublicSiteUrl } from "../../../utils/publicSiteUrl";

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

export function usePublicSiteUrl(slug) {
  const fallbackUrl = useMemo(() => resolvePublicSiteUrl(slug), [slug]);
  const [siteUrl, setSiteUrl] = useState(fallbackUrl);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!slug) {
        setSiteUrl(fallbackUrl);
        return;
      }

      try {
        const org = await buscarOrganizacaoPorSlug(slug);
        const fromApi = normalizeUrl(org?.site_url);

        if (ativo) {
          setSiteUrl(fromApi || fallbackUrl);
        }
      } catch {
        if (ativo) {
          setSiteUrl(fallbackUrl);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [slug, fallbackUrl]);

  return siteUrl;
}
