import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { CatalogScreen } from '../../components/catalog/CatalogScreen';
import { CATEGORIES, getCategory } from '../../config/navigation';
import { NotFoundView } from '../../components/layout/NotFoundView';

/** Gera uma página estática para cada categoria na exportação web. */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default function CategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = getCategory(slug);

  if (!category) return <NotFoundView />;

  return (
    <CatalogScreen
      title={category.title}
      eyebrow="Categoria"
      description={category.description}
      image={category.image}
      query={{ category: category.slug }}
    />
  );
}
