import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';

const searchData = [
  { name: 'MCHOSE ACE 68 GT', cat: 'Keyboards', spec: '16K Hall-Effect' },
  { name: 'EWEADN Z7', cat: 'Mice', spec: '52g Carbon · PAW3950' },
  { name: 'Ajazz ALUX 68 Max', cat: 'Keyboards', spec: 'Aluminum Edition' },
  { name: 'Rapid Trigger', cat: 'Keyboards', spec: 'Hall Effect' },
  { name: 'Glass Mousepads', cat: 'Mousepads', spec: 'Low friction' },
  { name: 'PBT Keycap Sets', cat: 'Keycaps', spec: 'Doubleshot' },
  { name: 'Custom IEMs', cat: 'Headsets & IEMs', spec: 'FPS tuned' },
  { name: 'Coiled Aviator Cables', cat: 'Accessories', spec: 'Detachable' },
];

export function QuickSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filtered = query
    ? searchData.filter((item) =>
        `${item.name} ${item.cat} ${item.spec}`.toLowerCase().includes(query.toLowerCase())
      )
    : searchData;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="flex items-center gap-3 border-b border-line p-4">
              <Search className="h-5 w-5 shrink-0 text-violet" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the arsenal… e.g. '16k polling', 'carbon'"
                className="flex-1 bg-transparent font-body text-sm text-ink outline-none placeholder:text-dim"
              />
              <button
                onClick={onClose}
                aria-label="Close"
                className="interactive flex h-8 w-8 items-center justify-center rounded-lg border border-line text-mut transition-colors hover:border-violet/50 hover:text-violet-bright"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-tech text-xs uppercase tracking-[0.25em] text-dim">
                    No gear found for "{query}"
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.name}
                    onClick={onClose}
                    className="interactive group flex w-full items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-bg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet/25 to-violet-bright/25 font-display text-sm text-violet-bright">
                        {item.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-tech text-sm font-semibold text-ink transition-colors group-hover:text-violet-bright">
                          {item.name}
                        </p>
                        <p className="font-tech text-[10px] uppercase tracking-wider text-dim">
                          {item.cat} · {item.spec}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-dim transition-all group-hover:translate-x-1 group-hover:text-violet" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
