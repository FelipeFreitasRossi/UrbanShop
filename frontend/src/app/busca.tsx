import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextStyle } from 'react-native';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { ProductList } from '../components/product/ProductList';
import { UText } from '../components/ui/UText';
import { CATEGORIES } from '../config/navigation';
import { Reveal } from '../motion/Reveal';
import { colors, fonts, radius, spacing } from '../theme/tokens';

const webInputReset = { outlineStyle: 'none' } as unknown as TextStyle;

/** Pesquisa de produtos. O termo fica na URL (?q=) para poder ser compartilhado. */
export default function SearchPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const initial = typeof params.q === 'string' ? params.q : '';
  const [text, setText] = useState(initial);
  const term = initial.trim();

  const submit = (value = text) => {
    const q = value.trim();
    router.setParams({ q: q || undefined });
  };

  return (
    <Screen title={term ? `Busca: ${term}` : 'Pesquisar'} noIndex={!!term}>
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Pesquisar</UText>
          </Reveal>
          <Reveal delay={80}>
            <View style={styles.field}>
              <Search size={22} color={colors.gold} strokeWidth={1.6} />
              <TextInput
                value={text}
                onChangeText={setText}
                onSubmitEditing={() => submit()}
                placeholder="O que você procura?"
                placeholderTextColor={colors.textDim}
                returnKeyType="search"
                autoFocus
                autoCorrect={false}
                accessibilityLabel="Pesquisar produtos"
                style={[styles.input, webInputReset]}
              />
              {text ? (
                <Pressable
                  onPress={() => {
                    setText('');
                    submit('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar pesquisa"
                  hitSlop={10}
                >
                  <X size={20} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
          </Reveal>

          {!term ? (
            <Reveal delay={160}>
              <UText variant="label" color={colors.textMuted} style={styles.suggestTitle}>
                Sugestões
              </UText>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.slug}
                    onPress={() => {
                      setText(c.label);
                      submit(c.label);
                    }}
                    accessibilityRole="button"
                    style={styles.chip}
                  >
                    <UText variant="small" color={colors.text}>
                      {c.label}
                    </UText>
                  </Pressable>
                ))}
              </View>
            </Reveal>
          ) : (
            <View style={styles.results}>
              <UText variant="body" style={styles.resultsTitle}>
                Resultados para <UText variant="body" color={colors.white}>“{term}”</UText>
              </UText>
              <ProductList
                key={term}
                query={{ q: term, size: 24 }}
                emptyTitle="Nada encontrado"
                emptyMessage="Tente outro termo ou navegue pelas categorias."
              />
            </View>
          )}
        </Container>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
    paddingBottom: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
    paddingVertical: 8,
  },
  suggestTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  results: { marginTop: spacing.xl },
  resultsTitle: { marginBottom: spacing.lg },
});
