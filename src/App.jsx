import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { IntroLoader } from './components/IntroLoader';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { DragonHeroSequenceSection } from './components/DragonHeroSequenceSection';
import { ProductShowcase } from './components/ProductShowcase';
import { MacroSpecSection } from './components/MacroSpecSection';
import { CategoryGrid } from './components/CategoryGrid';
import { BenchmarkSection } from './components/BenchmarkSection';
import { SocialProofStrip } from './components/SocialProofStrip';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickSearchModal } from './components/QuickSearchModal';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const lenisRef = useRef(null);

  // Smooth scroll setup (Lenis)
  useEffect(() => {
    if (!isIntroDone) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const update = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Sync native scrollTo calls to Lenis
    lenis.stop();

    // A tiny delay so intro animation completes before enabling scroll
    setTimeout(() => lenis.start(), 100);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isIntroDone]);

  // Smooth scroll for anchor clicks
  const smoothScrollTo = useCallback((target) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -80 });
    } else {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const addToCart = useCallback((product, variant) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.variant === variant);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.variant === variant
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          variant,
          modelType: product.modelType,
          qty: 1,
        },
      ];
    });
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 500);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-ink">
      {!isIntroDone && <IntroLoader onComplete={() => setIsIntroDone(true)} />}

      <CustomCursor />
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        isCartBouncing={isCartBouncing}
        smoothScrollTo={smoothScrollTo}
      />

      <main className="relative">
        <DragonHeroSequenceSection />
        {/* pulled up under the hero so the final macro-close-up crossfades into product photography (desktop pinned-stage only) */}
        <div className="relative z-0 md:-mt-[100vh]">
          <ProductShowcase onAddToCart={addToCart} />
        </div>
        <MacroSpecSection />
        <CategoryGrid />
        <BenchmarkSection />
        <SocialProofStrip />
        <Footer />
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQty={updateQty}
      />

      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
