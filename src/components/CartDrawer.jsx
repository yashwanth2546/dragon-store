import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';

export function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQty }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold-bright">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-tech text-sm font-semibold uppercase tracking-widest text-ink">
                    Your loadout
                  </h3>
                  <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-dim">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · demo cart
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="interactive flex h-11 w-11 items-center justify-center rounded-lg border border-line text-mut transition-colors hover:border-gold/50 hover:text-gold-bright"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-bg">
                    <ShoppingBag className="h-6 w-6 text-dim" />
                  </div>
                  <div>
                    <p className="font-tech text-sm uppercase tracking-widest text-mut">Loadout empty</p>
                    <p className="mt-1 font-body text-xs text-dim">Deploy some gear to continue.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex gap-4 rounded-xl border border-line bg-bg/50 p-4"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-gold-bright/20 font-display text-xl text-gold-bright">
                          {item.name[0]}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-tech text-sm font-semibold leading-tight text-ink">{item.name}</h4>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                aria-label="Remove"
                                className="interactive -m-1.5 rounded-md p-1.5 text-dim transition-colors hover:text-rose"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="mt-0.5 font-tech text-[10px] uppercase tracking-wider text-dim">
                              {item.variant} · {item.modelType}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateQty(item.id, -1)}
                                aria-label="Decrease"
                                className="interactive flex h-9 w-9 items-center justify-center rounded-lg border border-line text-mut transition-colors hover:border-gold/50 hover:text-gold-bright"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center font-tech text-sm text-ink">{item.qty}</span>
                              <button
                                onClick={() => onUpdateQty(item.id, 1)}
                                aria-label="Increase"
                                className="interactive flex h-9 w-9 items-center justify-center rounded-lg border border-line text-mut transition-colors hover:border-gold/50 hover:text-gold-bright"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-display text-lg font-semibold text-gold-bright">
                              ₹{(item.price * item.qty).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-line bg-bg/60 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-tech text-xs uppercase tracking-[0.25em] text-gold-muted">Total</span>
                <span className="font-display text-2xl font-semibold text-gold-bright">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <button className="w-full rounded-lg bg-gold py-3.5 font-tech text-sm font-semibold uppercase tracking-widest text-bg transition-colors hover:bg-gold-bright">
                Checkout · demo
              </button>
              <p className="mt-3 text-center font-tech text-[10px] uppercase tracking-[0.2em] text-dim">
                Demo build — checkout is not functional
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
