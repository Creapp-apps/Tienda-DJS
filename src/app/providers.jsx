"use client";

import { SiteDataProvider } from '../context/SiteDataContext';
import { CartProvider } from '../context/CartContext';

export function Providers({ children }) {
  return (
    <SiteDataProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SiteDataProvider>
  );
}
