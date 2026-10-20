import type { Publicador } from "../types/publicador";
import type { Territorio } from "../types/territorio";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

function obterLinkGoogleMaps(territorio: Territorio): string {
  if (!territorio.poligonoGeojson) {
    return "";
  }

  try {
    const parsed = JSON.parse(territorio.poligonoGeojson) as GeoJsonPolygon;

    if (
      parsed.type !== "Polygon" ||
      !Array.isArray(parsed.coordinates) ||
      parsed.coordinates.length === 0 ||
      !Array.isArray(parsed.coordinates[0]) ||
      parsed.coordinates[0].length < 4
    ) {
      return "";
    }

    const primeiroPonto = parsed.coordinates[0][0];

    if (
      !Array.isArray(primeiroPonto) ||
      primeiroPonto.length < 2 ||
      !Number.isFinite(primeiroPonto[0]) ||
      !Number.isFinite(primeiroPonto[1])
    ) {
      return "";
    }

    const [longitude, latitude] = primeiroPonto;

    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  } catch {
    return "";
  }
}

function obterUrlCartaoWeb(territorio: Territorio): string {
  const urlBase = import.meta.env.VITE_APP_URL || window.location.origin;

  return `${urlBase.replace(/\/$/, "")}/mapa/${territorio.id}`;
}

function obterNumeroWhatsApp(publicador?: Publicador): string {
  const telefoneLimpo = publicador?.telefone?.replace(/\D/g, "") ?? "";

  if (!telefoneLimpo) {
    return "";
  }

  if (telefoneLimpo.startsWith("55")) {
    return telefoneLimpo;
  }

  return telefoneLimpo.length >= 10 ? `55${telefoneLimpo}` : telefoneLimpo;
}

export const gerarLinkWhatsAppTerritorio = (
  territorio: Territorio,
  publicador?: Publicador,
): string => {
  const linkGps = obterLinkGoogleMaps(territorio);
  const urlCartaoWeb = obterUrlCartaoWeb(territorio);

  const nomePublicador = publicador
    ? `Olá, irmão(ã) *${publicador.nome}*!`
    : "Olá!";

  const congregacao = territorio.congregacaoNome
    ? `\n🏢 *Congregação:* ${territorio.congregacaoNome}`
    : "";

  const descricao = territorio.descricao
    ? `\n📝 *Observações:* ${territorio.descricao}`
    : "";

  const mensagem = `${nomePublicador}

Segue a sua designação de território:

🗺️ *Território Nº ${territorio.numero}* - ${territorio.nome}${congregacao}${descricao}

📱 *Cartão Digital da Quadra:*

${urlCartaoWeb}

📍 *GPS / Google Maps:*

${linkGps}

Bom trabalho no ministério!`;

  const textoCodificado = encodeURIComponent(mensagem);
  const numeroFormatado = obterNumeroWhatsApp(publicador);

  if (numeroFormatado) {
    return `https://api.whatsapp.com/send?phone=${numeroFormatado}&text=${textoCodificado}`;
  }

  return `https://api.whatsapp.com/send?text=${textoCodificado}`;
};
