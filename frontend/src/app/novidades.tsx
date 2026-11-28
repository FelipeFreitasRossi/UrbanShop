import React from 'react';
import { CatalogScreen } from '../components/catalog/CatalogScreen';
import { media } from '../config/media';

export default function NovidadesPage() {
  return (
    <CatalogScreen
      title="Novidades"
      eyebrow="Acabou de chegar"
      description="As peças mais recentes da UrbanShop, direto para o seu guarda-roupa."
      image={media.collections.novidades}
      query={{ collection: 'new', sort: 'newest' }}
    />
  );
}
