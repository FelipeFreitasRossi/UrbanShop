import React from 'react';
import { CatalogScreen } from '../components/catalog/CatalogScreen';
import { media } from '../config/media';

export default function OfertasPage() {
  return (
    <CatalogScreen
      title="Ofertas"
      eyebrow="Por tempo limitado"
      description="Peças selecionadas com preço especial enquanto durarem os estoques."
      image={media.collections.ofertas}
      query={{ collection: 'sale' }}
      emptyMessage="Nenhuma oferta ativa no momento. Cadastre-se na newsletter para saber das próximas."
    />
  );
}
