/**
 * Paletas de cores da UrbanShop.
 *
 * Os nomes descrevem o PAPEL da cor no tema escuro (o tema principal da marca).
 * No tema claro os papéis se invertem:
 *   - `black`  = fundo da página (preto no escuro, off-white no claro)
 *   - `white`  = cor de máximo contraste (branco no escuro, quase preto no claro)
 *   - `text`   = texto principal
 * O dourado continua sendo o detalhe de destaque nos dois temas.
 */
export type Palette = {
  black: string;
  ink: string;
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  line: string;
  lineStrong: string;
  white: string;
  text: string;
  textMuted: string;
  textDim: string;
  gold: string;
  goldLight: string;
  goldDeep: string;
  goldSoft: string;
  goldLine: string;
  danger: string;
  success: string;
  overlay: string;
  /** Fundo translúcido de header e barra inferior (r,g,b). */
  glassRgb: string;
};

export const darkPalette: Palette = {
  black: '#000000',
  ink: '#070707',
  surface: '#0F0F0F',
  surfaceRaised: '#151515',
  surfaceHover: '#1C1C1C',
  line: 'rgba(255,255,255,0.09)',
  lineStrong: 'rgba(255,255,255,0.2)',
  white: '#FFFFFF',
  text: '#F4F3EF',
  textMuted: 'rgba(244,243,239,0.64)',
  textDim: 'rgba(244,243,239,0.42)',
  gold: '#C8A75E',
  goldLight: '#E2C98F',
  goldDeep: '#8E7339',
  goldSoft: 'rgba(200,167,94,0.12)',
  goldLine: 'rgba(200,167,94,0.42)',
  danger: '#E5484D',
  success: '#4CC38A',
  overlay: 'rgba(0,0,0,0.55)',
  glassRgb: '0,0,0',
};

export const lightPalette: Palette = {
  black: '#FAFAF7',
  ink: '#F2F1EC',
  surface: '#EAE8E2',
  surfaceRaised: '#E2E0D9',
  surfaceHover: '#D9D6CE',
  line: 'rgba(0,0,0,0.09)',
  lineStrong: 'rgba(0,0,0,0.22)',
  white: '#0B0B0B',
  text: '#111111',
  textMuted: 'rgba(17,17,17,0.68)',
  textDim: 'rgba(17,17,17,0.48)',
  gold: '#9A7631',
  goldLight: '#B48B3C',
  goldDeep: '#765A24',
  goldSoft: 'rgba(154,118,49,0.10)',
  goldLine: 'rgba(154,118,49,0.45)',
  danger: '#C9302C',
  success: '#23845A',
  overlay: 'rgba(0,0,0,0.45)',
  glassRgb: '250,250,247',
};

/** Cores fixas para conteúdo sobre fotos e sobre o cartão preto (iguais nos dois temas). */
export const onDark = darkPalette;
