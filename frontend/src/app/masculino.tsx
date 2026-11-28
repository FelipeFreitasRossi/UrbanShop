import React from 'react';
import { CatalogScreen } from '../components/catalog/CatalogScreen';
import { media } from '../config/media';

export default function MasculinoPage() {
  return (
    <CatalogScreen
      title="Masculino"
      eyebrow="Coleção"
      description="Modelagens amplas, tons sóbrios e peças que constroem um guarda-roupa urbano completo."
      image={media.collections.masculino}
      query={{ gender: 'masculino' }}
    />
  );
}
