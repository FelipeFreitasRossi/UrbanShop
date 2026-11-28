import React from 'react';
import { CatalogScreen } from '../components/catalog/CatalogScreen';
import { media } from '../config/media';

export default function FemininoPage() {
  return (
    <CatalogScreen
      title="Feminino"
      eyebrow="Coleção"
      description="Conforto, presença e versatilidade em peças que vão da rua ao rolê."
      image={media.collections.feminino}
      query={{ gender: 'feminino' }}
    />
  );
}
