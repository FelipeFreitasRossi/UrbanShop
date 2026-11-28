import { media } from './media';

export type CategorySlug = 'camisetas' | 'shorts' | 'tenis' | 'bones' | 'corta-vento' | 'calcas';

export type Category = {
  slug: CategorySlug;
  /** Nome curto usado no menu. */
  label: string;
  /** Nome completo usado em títulos. */
  title: string;
  description: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: 'camisetas',
    label: 'Camisetas',
    title: 'Camisetas Oversized',
    description: 'Modelagem ampla, malha encorpada e caimento preciso.',
    image: media.categories.camisetas,
  },
  {
    slug: 'shorts',
    label: 'Shorts',
    title: 'Shorts',
    description: 'Leveza para o calor da cidade, sem abrir mão do estilo.',
    image: media.categories.shorts,
  },
  {
    slug: 'tenis',
    label: 'Tênis',
    title: 'Tênis',
    description: 'Conforto para o dia inteiro e design que fecha o visual.',
    image: media.categories.tenis,
  },
  {
    slug: 'bones',
    label: 'Bonés',
    title: 'Bonés',
    description: 'O detalhe que define a identidade do look.',
    image: media.categories.bones,
  },
  {
    slug: 'corta-vento',
    label: 'Corta-vento',
    title: 'Corta-vento',
    description: 'Proteção leve com presença urbana.',
    image: media.categories['corta-vento'],
  },
  {
    slug: 'calcas',
    label: 'Calças',
    title: 'Calças',
    description: 'Cargo, wide e jogger com construção pensada para o movimento.',
    image: media.categories.calcas,
  },
];

export const getCategory = (slug?: string) => CATEGORIES.find((c) => c.slug === slug);

export type NavItem = { label: string; href: string; highlight?: boolean };

/** Links do header desktop, na ordem pedida. */
export const MAIN_NAV: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Masculino', href: '/masculino' },
  { label: 'Feminino', href: '/feminino' },
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/categoria/${c.slug}` })),
  { label: 'Ofertas', href: '/ofertas', highlight: true },
];

/** Páginas institucionais (links do rodapé). */
export const INSTITUTIONAL = [
  { slug: 'sobre', label: 'Sobre a UrbanShop' },
  { slug: 'trocas-e-devolucoes', label: 'Trocas e devoluções' },
  { slug: 'entregas', label: 'Prazos e entregas' },
  { slug: 'privacidade', label: 'Política de privacidade' },
  { slug: 'termos', label: 'Termos de uso' },
  { slug: 'atendimento', label: 'Atendimento' },
] as const;
