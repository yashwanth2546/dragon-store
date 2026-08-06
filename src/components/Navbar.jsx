import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar({ cartCount, onOpenCart, onOpenSearch, isCartBouncing, smoothScrollTo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = ['Keyboards', 'Mice', 'MousePads', 'Headsets & IEMs', 'Keycaps', 'Accessories'];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    setMobileOpen(false);
    if (smoothScrollTo) smoothScrollTo(id);
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'border-b border-line bg-bg/85 backdrop-blur-xl py-3'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] sm:px-10 lg:px-16">
        {/* Brand */}
        <button onClick={() => go('hero')} className="interactive group flex min-w-0 flex-1 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-deep to-gold-bright opacity-90 blur-[6px] transition-opacity group-hover:opacity-100" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface font-display text-lg text-gold-bright">
              R
            </div>
          </div>
          <div className="min-w-0 text-left leading-none">
            <span className="block truncate font-display text-lg tracking-wide text-gold-bright sm:text-xl">RYUGEAR</span>
            <span className="mt-0.5 hidden truncate font-tech text-[9px] uppercase tracking-[0.35em] text-dim sm:block">
              Esports peripherals
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => go('product-showcase')}
              className="interactive relative font-tech text-[13px] uppercase tracking-[0.15em] text-mut transition-colors hover:text-gold-bright after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {c}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="interactive flex h-11 w-11 items-center justify-center rounded-lg border border-line text-mut transition-colors hover:border-gold/50 hover:text-gold-bright"
          >
            <Search className="h-4 w-4" />
          </button>

          <motion.button
            onClick={onOpenCart}
            aria-label="Open cart"
            animate={isCartBouncing ? { scale: [1, 1.2, 0.95, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
            className="interactive relative flex h-11 items-center gap-2 rounded-lg bg-gold px-4 font-tech text-xs font-semibold uppercase tracking-widest text-bg transition-colors hover:bg-gold-bright"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bg px-1 font-tech text-[11px] font-bold text-gold-bright">
              {cartCount}
            </span>
          </motion.button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="interactive flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => go('product-showcase')}
                  className="interactive rounded-lg px-3 py-3 text-left font-tech text-sm uppercase tracking-[0.15em] text-mut transition-colors hover:bg-surface hover:text-ink"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
