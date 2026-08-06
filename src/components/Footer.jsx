import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Camera, MonitorPlay, AtSign, MessageSquare, ArrowUpRight } from 'lucide-react';
import { CloudMotif } from './CloudMotif';

export function Footer() {
  const shop = ['Keyboards', 'Mice', 'MousePads', 'Headsets & IEMs', 'Keycaps', 'Accessories'];
  const support = ['Track order', 'Shipping & returns', 'Warranty', 'Build guides', 'FAQ'];
  const social = [
    { icon: Camera, label: 'Instagram' },
    { icon: MonitorPlay, label: 'YouTube' },
    { icon: AtSign, label: 'Twitter / X' },
    { icon: MessageSquare, label: 'Discord' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-2 pt-20">
      <CloudMotif />
      {/* Watermark */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-4%] flex justify-center overflow-hidden select-none">
        <span className="font-display text-[clamp(7rem,20vw,20rem)] leading-none text-white/[0.03]">
          RYUGEAR
        </span>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-20 overflow-hidden rounded-2xl border border-gold/25 bg-surface p-8 sm:p-14"
        >
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/25 blur-[90px]" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="mb-3 font-tech text-xs uppercase tracking-[0.35em] text-gold">Final call</p>
              <h3 className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2rem,4.5vw,3.6rem)] text-ink">
                Your aim <span className="text-gradient-gold">deserves</span>
                <br />
                the best gear.
              </h3>
            </div>
            <button
              onClick={() => document.getElementById('product-showcase')?.scrollIntoView({ behavior: 'smooth' })}
              className="interactive group inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-8 py-4 font-tech text-sm font-semibold uppercase tracking-widest text-bg transition-colors hover:bg-gold-bright glow-gold"
            >
              Shop now
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 pb-16 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-deep to-gold-bright blur-[6px]" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface font-display text-lg text-gold-bright">
                  R
                </div>
              </div>
              <span className="font-display text-xl text-ink">RYUGEAR</span>
            </div>
            <p className="mb-6 max-w-sm font-body text-sm leading-relaxed text-mut">
              Dedicated to bringing the world's best esports peripherals to Indian
              gamers — premium gear, made accessible.
            </p>
            <div className="flex flex-col gap-2.5 font-body text-sm text-dim">
              <span className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-gold" /> Hyderabad, Telangana, India
              </span>
              <a href="mailto:hello@ryugear.in" className="flex items-center gap-2.5 transition-colors hover:text-gold-bright">
                <Mail className="h-3.5 w-3.5 text-gold" /> hello@ryugear.in
              </a>
              <span className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-gold" /> +91 90000 00000
              </span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-5 font-tech text-xs uppercase tracking-[0.3em] text-ink">Shop</h4>
            <ul className="flex flex-col gap-2.5">
              {shop.map((item) => (
                <li key={item}>
                  <a href="#product-showcase" className="font-body text-sm text-mut transition-colors hover:text-gold-bright">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-5 font-tech text-xs uppercase tracking-[0.3em] text-ink">Support</h4>
            <ul className="flex flex-col gap-2.5">
              {support.map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-mut transition-colors hover:text-gold-bright">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-5 font-tech text-xs uppercase tracking-[0.3em] text-ink">Connect</h4>
            <ul className="flex flex-col gap-2.5">
              {social.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a href="#" className="interactive flex items-center gap-2.5 font-body text-sm text-mut transition-colors hover:text-gold-bright">
                    <Icon className="h-3.5 w-3.5 text-gold" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-6 font-tech text-[10px] uppercase tracking-[0.25em] text-gold-muted sm:flex-row">
          <span>© {new Date().getFullYear()} RyuGear · Hyderabad, India</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-ping-soft rounded-full bg-gold" />
            Level up your game — always online
          </span>
        </div>
      </div>
    </footer>
  );
}
