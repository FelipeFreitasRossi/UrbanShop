/**
 * Imagens editoriais (campanha, categorias e coleções).
 *
 * As URLs abaixo são fotos do Unsplash (licença gratuita) usadas como
 * imagens de campanha provisórias. Troque pelas fotos oficiais da UrbanShop
 * quando estiverem prontas — basta alterar as URLs aqui.
 *
 * Imagens de PRODUTOS não ficam aqui: elas vêm do banco de dados.
 */
const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;

/**
 * Pede ao Unsplash a imagem na largura certa para a tela
 * (no celular baixa um arquivo bem menor).
 */
export function sized(url: string, width: number) {
  return url.includes('images.unsplash.com') ? url.replace(/([?&])w=\d+/, `$1w=${Math.round(width)}`) : url;
}

export const media = {
  hero: unsplash('photo-1523398002811-999ca8dec234', 2000),
  /** Foto em moldura exibida ao lado do título "Vista a cidade". */
  heroFeature: unsplash('photo-1635650804263-1a1941e14df5', 900),

  categories: {
    camisetas: unsplash('photo-1627225924765-552d49cf47ad', 800),
    shorts: unsplash('photo-1591195853828-11db59a44f6b', 800),
    tenis: unsplash('photo-1595950653106-6c9ebd614d3a', 800),
    bones: unsplash('photo-1588850561407-ed78c282e89b', 800),
    'corta-vento': unsplash('photo-1578964046312-69d266a3e739', 800),
    calcas: unsplash('photo-1584302052177-2e90841dad6a', 800),
  } as Record<string, string>,

  collections: {
    masculino: unsplash('photo-1611955874253-78c6c3959c41', 2000),
    feminino: unsplash('photo-1508216310976-c518daae0cdc', 1400),
    novidades: unsplash('photo-1578854955076-970394ef2512', 1400),
    ofertas: unsplash('photo-1559406041-c7d2b2e98690', 1600),
  },
} as const;
