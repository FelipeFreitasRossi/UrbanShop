import { Link } from 'expo-router';
import { ArrowUp } from 'lucide-react-native';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { CATEGORIES, INSTITUTIONAL } from '../../config/navigation';
import { site } from '../../config/site';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { usePageScroll } from '../../motion/PageScroll';
import { Reveal } from '../../motion/Reveal';
import { useInteraction } from '../../motion/useInteraction';
import { fonts, spacing } from '../../theme/tokens';
import { Logo } from '../brand/Logo';
import { UText } from '../ui/UText';
import { Container } from './Container';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type FooterLink = { label: string; href?: string; external?: string };

/** Rodapé com links institucionais, atendimento, redes sociais e informações comerciais. */
export function Footer() {
  const colors = useColors();
  const styles = useStyles();
  const { isMobile, pick } = useBreakpoint();
  const { scrollToTop } = usePageScroll();

  const social: FooterLink[] = [
    { label: 'Instagram', external: site.social.instagram },
    { label: 'TikTok', external: site.social.tiktok },
    { label: 'YouTube', external: site.social.youtube },
  ].filter((s) => !!s.external);

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Loja',
      links: [
        { label: 'Todos os produtos', href: '/produtos' },
        { label: 'Novidades', href: '/novidades' },
        { label: 'Masculino', href: '/masculino' },
        { label: 'Feminino', href: '/feminino' },
        ...CATEGORIES.map((c) => ({ label: c.label, href: `/categoria/${c.slug}` })),
        { label: 'Ofertas', href: '/ofertas' },
      ],
    },
    {
      title: 'Minha conta',
      links: [
        { label: 'Entrar ou cadastrar', href: '/entrar' },
        { label: 'Configurações', href: '/configuracoes' },
        { label: 'Favoritos', href: '/favoritos' },
        { label: 'Sacola', href: '/carrinho' },
      ],
    },
    {
      title: 'Institucional',
      links: INSTITUTIONAL.map((i) => ({ label: i.label, href: `/institucional/${i.slug}` })),
    },
  ];

  return (
    <View style={styles.footer}>
      <Container>
        <View style={[styles.top, { flexDirection: isMobile ? 'column' : 'row', gap: pick(40, 48, 64) }]}>
          <Reveal style={styles.brand}>
            <Logo size={pick(24, 26, 28)} />
            <UText variant="body" style={styles.tagline}>
              Streetwear com identidade própria. Design urbano, acabamento premium e um programa de fidelidade
              que valoriza cada compra.
            </UText>
            {social.length > 0 ? (
              <View style={styles.socialRow}>
                {social.map((s) => (
                  <FooterAnchor key={s.label} link={s} />
                ))}
              </View>
            ) : null}
          </Reveal>

          <View style={[styles.columns, { gap: pick(32, 40, 64) }]}>
            {columns.map((col, i) => (
              <Reveal key={col.title} delay={i * 90} style={styles.column}>
                <UText variant="eyebrow" style={styles.colTitle}>
                  {col.title}
                </UText>
                {col.links.map((l) => (
                  <FooterAnchor key={l.label} link={l} />
                ))}
              </Reveal>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={[styles.bottom, isMobile && styles.bottomMobile]}>
          <View style={styles.legal}>
            <UText variant="caption">
              © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
            </UText>
            {site.cnpj ? <UText variant="caption">CNPJ {site.cnpj}</UText> : null}
            {site.supportEmail ? (
              <UText variant="caption">
                Atendimento: {site.supportEmail}
                {site.supportHours ? ` · ${site.supportHours}` : ''}
              </UText>
            ) : null}
          </View>
          <Pressable
            onPress={scrollToTop}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao topo"
            style={styles.toTop}
          >
            <UText variant="label" color={colors.textMuted}>
              Voltar ao topo
            </UText>
            <ArrowUp size={14} color={colors.gold} />
          </Pressable>
        </View>
      </Container>
    </View>
  );
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const colors = useColors();
  const styles = useStyles();
  const { hover, handlers } = useInteraction();
  const color = useAnimatedStyle(() => ({
    color: interpolateColor(hover.value, [0, 1], [colors.textMuted, colors.white]),
  }));

  const text = <Animated.Text style={[styles.link, color]}>{link.label}</Animated.Text>;

  if (link.external) {
    const url = link.external;
    return (
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(url)}
        {...handlers}
        style={styles.linkHit}
      >
        {text}
      </Pressable>
    );
  }

  return (
    <Link href={link.href ?? '/'} asChild>
      <Pressable accessibilityRole="link" {...handlers} style={styles.linkHit}>
        {text}
      </Pressable>
    </Link>
  );
}

const useStyles = makeStyles((colors) => ({
  footer: {
    backgroundColor: colors.ink,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
  },
  top: { justifyContent: 'space-between' },
  brand: { maxWidth: 360, gap: spacing.md },
  tagline: { marginTop: spacing.sm },
  socialRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  columns: { flexDirection: 'row', flexWrap: 'wrap' },
  column: { minWidth: 150, gap: 2 },
  colTitle: { marginBottom: spacing.sm },
  linkHit: { paddingVertical: 6, alignSelf: 'flex-start' },
  link: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginTop: spacing.xxxl,
    marginBottom: spacing.lg,
  },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.lg },
  legal: { gap: 4 },
  toTop: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
}));
