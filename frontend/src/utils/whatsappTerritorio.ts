import type { Territorio } from "../types/territorio";
import type { Publicador } from "../types/publicador";

export const gerarLinkWhatsAppTerritorio = (
  territorio: Territorio,
  publicador?: Publicador,
): string => {
  let linkGps = "";

  if (territorio.poligonoGeojson) {
    try {
      const coords: [number, number][] = JSON.parse(territorio.poligonoGeojson);

      if (coords.length > 0) {
        const [lat, lng] = coords[0];

        linkGps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    } catch {
      linkGps = "";
    }
  }

  const urlBase = import.meta.env.VITE_APP_URL || window.location.origin;

  const urlCartaoWeb = `${urlBase}/mapa/${territorio.id}`;

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

  const telefoneLimpo = publicador?.telefone
    ? publicador.telefone.replace(/\D/g, "")
    : "";

  const numeroFormatado =
    telefoneLimpo.length >= 10 && !telefoneLimpo.startsWith("55")
      ? `55${telefoneLimpo}`
      : telefoneLimpo;

  return numeroFormatado
    ? `https://api.whatsapp.com/send?phone=${numeroFormatado}&text=${textoCodificado}`
    : `https://api.whatsapp.com/send?text=${textoCodificado}`;
};
