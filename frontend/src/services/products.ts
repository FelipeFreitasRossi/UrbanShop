import type { Page, Product, ProductCollection } from '../types/product';
import { apiRequest } from './api';

export type ProductQuery = {
  category?: string;
  gender?: 'masculino' | 'feminino';
  collection?: ProductCollection;
  q?: string;
  sort?: 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
  page?: number;
  size?: number;
};

function toQueryString(query: ProductQuery) {
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `?${params.join('&')}` : '';
}

/** Lista produtos publicados (GET /api/products). */
export function listProducts(query: ProductQuery = {}) {
  return apiRequest<Page<Product>>(`/api/products${toQueryString({ size: 12, ...query })}`);
}

/** Produto pela URL amigável (GET /api/products/slug/{slug}). */
export function getProductBySlug(slug: string) {
  return apiRequest<Product>(`/api/products/slug/${encodeURIComponent(slug)}`);
}
