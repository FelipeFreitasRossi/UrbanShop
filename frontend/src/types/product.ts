/**
 * Formato dos produtos retornados pela API Java (Spring Boot).
 * Os nomes seguem o contrato que será implementado na Etapa 5.
 */
export type ProductStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string | null;
  images: string[];
  /** Preço em reais (ex.: 189.9). */
  price: number;
  promotionalPrice?: number | null;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  sku: string;
  status: ProductStatus;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** Listas de destaque da home. */
export type ProductCollection = 'best-sellers' | 'new' | 'sale' | 'recommended';
