import React from 'react';
import { Collections } from '../components/home/Collections';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { Hero } from '../components/home/Hero';
import { LoyaltyTeaser } from '../components/home/LoyaltyTeaser';
import { Newsletter } from '../components/home/Newsletter';
import { Screen } from '../components/layout/Screen';

export default function HomePage() {
  return (
    <Screen overlayHeader>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <Collections />
      <LoyaltyTeaser />
      <Newsletter />
    </Screen>
  );
}
