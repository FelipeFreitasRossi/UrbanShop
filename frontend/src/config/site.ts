/**
 * Informações institucionais da UrbanShop.
 * Preencha os campos vazios com os dados reais da empresa.
 * Campos vazios simplesmente não aparecem no site.
 */
export const site = {
  name: 'UrbanShop',
  url: 'https://urbanshop.com',
  defaultTitle: 'UrbanShop — Streetwear premium',
  defaultDescription:
    'Camisetas oversized, tênis, bonés, corta-ventos e calças com design urbano e acabamento premium. Compre online e acumule pontos no programa de fidelidade UrbanShop.',
  locale: 'pt_BR',

  /** Ex.: '00.000.000/0001-00'. Deixe vazio até ter o CNPJ definitivo. */
  cnpj: '',
  /** Ex.: 'atendimento@urbanshop.com' */
  supportEmail: '',
  /** Ex.: 'Seg. a sex., 9h às 18h' */
  supportHours: '',

  /** URLs completas das redes sociais. Vazio = não exibido. */
  social: {
    instagram: '',
    tiktok: '',
    youtube: '',
  },
} as const;
