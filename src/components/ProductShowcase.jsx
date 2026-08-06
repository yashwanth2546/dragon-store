import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { CloudMotif } from './CloudMotif';

const products = [
  {
    id: 'ryugear-z7',
    name: 'RyuGear Z7',
    type: 'Signature · Carbon-Marbled Wireless Mouse',
    modelType: 'mouse',
    image: '/product/sig-mouse.png',
    price: 6999,
    oldPrice: 8999,
    discount: 22,
    rating: '5.0',
    badges: ['Carbon', '52g'],
    specs: ['PAW3950', 'Dual 8K Polling', 'Nordic 54L15', 'Brushed Gold'],
    variants: [
      { label: 'Carbon', value: 'carbon' },
      { label: 'White', value: 'white' },
    ],
  },
  {
    id: 'ace68',
    name: 'MCHOSE ACE 68 GT',
    type: '16K Hall-Effect Gaming Keyboard',
    modelType: 'keyboard',
    visual: 'keyboard-art',
    artVariant: 'ace',
    price: 7999,
    oldPrice: null,
    discount: null,
    rating: '4.9',
    badges: ['Hall Effect', '16K Polling'],
    specs: ['Rapid Trigger', '0.1mm Actuation', 'Tri-Mode', 'Hot-Swap'],
    variants: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
      { label: 'Gold', value: 'gold' },
    ],
  },
  {
    id: 'ajazz-alux68',
    name: 'Ajazz ALUX 68 Max',
    type: 'Aluminum Edition · Hot-Swap',
    modelType: 'aluminumKeyboard',
    visual: 'keyboard-art',
    artVariant: 'alu',
    price: 7499,
    oldPrice: 12999,
    discount: 42,
    rating: '4.8',
    badges: ['CNC Aluminum', 'Deal'],
    specs: ['Gasket Mount', 'RGB Backlit', 'Rotary Knob', 'Wired/2.4G'],
    variants: [
      { label: 'Space Gray', value: 'spacegray' },
      { label: 'Silver', value: 'silver' },
    ],
  },
];

export function ProductShowcase({ onAddToCart }) {
  return (
    <section id="product-showcase" className="relative overflow-hidden bg-bg py-24 sm:py-36">
      <CloudMotif />
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-4 font-tech text-xs uppercase tracking-[0.35em] text-gold"
            >
              / 01 — The Loadout
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2.6rem,6.5vw,5.5rem)] text-ink"
            >
              Championship
              <br />
              <span className="text-gradient-gold glow-text">ready loadout</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xs border-l border-gold/40 pl-5"
          >
            <p className="font-body text-sm leading-relaxed text-mut">
              Three flagship builds, bench-tested in our Hyderabad lab. Hover to
              inspect — every component chosen to win the round.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}
