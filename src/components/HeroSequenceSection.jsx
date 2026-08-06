import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 128;
const FRAME_W = 1280;
const FRAME_H = 720;

const framePath = (index) =>
  `/hero-sequence/frame_${String(index + 1).padStart(4, '0')}.webp`;

/* Fade a value across an in-window [in0,in1] and an out-window [out0,out1]. */
function windowFade(p, in0, in1, out0, out1) {
  if (p >= in1 && p < out0) return 1;
  if (p >= in0 && p < in1) return (p - in0) / (in1 - in0);
  if (p >= out0 && p < out1) return 1 - (p - out0) / (out1 - out0);
  return 0;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

export function HeroSequenceSection() {
  const desktop = useIsDesktop();
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4;
  const useSequence = desktop && !reduceMotion && !lowEnd;

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const brandRef = useRef(null);
  const taglineRef = useRef(null);
  const hudRef = useRef(null);
  const scrimRef = useRef(null);

  const framesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  const progressRef = useRef(0);
  const lastFrameRef = useRef(-1);

  /* ---------- frame preload ---------- */
  useEffect(() => {
    if (!useSequence) return;
    let cancelled = false;
    const imgs = [];
    let loaded = 0;

    const track = () => {
      if (cancelled) return;
      loaded += 1;
      setLoadedCount(loaded);
      if (loaded === TOTAL_FRAMES) {
        readyRef.current = true;
        setReady(true);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = track;
      img.onerror = track;
      img.src = framePath(i);
      imgs.push(img);
    }
    framesRef.current = imgs;

    return () => {
      cancelled = true;
      framesRef.current = [];
    };
  }, [useSequence]);

  /* ---------- cover-fit draw ---------- */
  const draw = (frame) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[frame];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;
    const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
    const sw = cw / scale;
    const sh = ch / scale;
    const sx = (FRAME_W - sw) / 2;
    const sy = (FRAME_H - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  };

  /* ---------- resize canvas backing store ---------- */
  useEffect(() => {
    if (!useSequence) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (readyRef.current && lastFrameRef.current >= 0) {
        draw(lastFrameRef.current);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [useSequence]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- scrub-driven hero ---------- */
  useEffect(() => {
    if (!useSequence) return;
    const section = sectionRef.current;

    const updateHero = (rawProgress) => {
      const p = clamp01(rawProgress);
      progressRef.current = p;
      if (window.__ryuHero) window.__ryuHero.progress = p;

      /* Frame redraw (index-change gated) */
      if (readyRef.current) {
        const frame = Math.round(p * (TOTAL_FRAMES - 1));
        if (frame !== lastFrameRef.current) {
          lastFrameRef.current = frame;
          draw(frame);
          if (window.__ryuHero) window.__ryuHero.frame = frame;
        }
      }

      /* RYUGEAR wordmark: in 0 → 0.035, hold, parallax out by 0.15 */
      const bO = windowFade(p, 0.005, 0.035, 0.08, 0.15);
      const bY = p >= 0.08 && p < 0.15 ? -((p - 0.08) / 0.07) * 160 : 0;
      if (brandRef.current) {
        brandRef.current.style.opacity = bO;
        brandRef.current.style.transform = `translate3d(0, ${bY.toFixed(1)}px, 0) scale(${(0.94 + 0.06 * bO).toFixed(4)})`;
        brandRef.current.dataset.opacity = bO.toFixed(3);
      }

      /* Tagline: stagger in after wordmark, gone by 0.2 */
      const tO = windowFade(p, 0.055, 0.105, 0.15, 0.2);
      const tY = p < 0.105 ? (1 - clamp01((p - 0.055) / 0.05)) * 70 : p >= 0.15 ? -((p - 0.15) / 0.05) * 110 : 0;
      if (taglineRef.current) {
        taglineRef.current.style.opacity = tO;
        taglineRef.current.style.transform = `translate3d(0, ${tY.toFixed(1)}px, 0)`;
        taglineRef.current.dataset.opacity = tO.toFixed(3);
      }

      /* Scrim (readability behind type): fades once product settles */
      const sO = windowFade(p, -1, 0.16, 0.16, 0.42) * 0.72;
      if (scrimRef.current) scrimRef.current.style.opacity = sO.toFixed(3);

      /* HUD: slide away just before release */
      const hO = windowFade(p, -1, 0.82, 0.86, 0.96);
      if (hudRef.current) {
        hudRef.current.style.opacity = hO;
        hudRef.current.style.transform = `translate3d(0, ${(1 - hO) * 48}px, 0)`;
        hudRef.current.dataset.opacity = hO.toFixed(3);
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => updateHero(self.progress),
    });

    /* First paint once frames arrive */
    const iv = setInterval(() => {
      if (readyRef.current) {
        clearInterval(iv);
        updateHero(progressRef.current);
      }
    }, 120);

    return () => {
      clearInterval(iv);
      st.kill();
    };
  }, [useSequence]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- expose state for verification ---------- */
  useEffect(() => {
    window.__ryuHero = { loaded: loadedCount, total: TOTAL_FRAMES, ready };
  }, [loadedCount, ready]);

  /* ================================================================
     MOBILE / LOW-END / REDUCED-MOTION FALLBACK
     ================================================================ */
  if (!useSequence) {
    return (
      <section id="hero" className="relative flex min-h-[100svh] overflow-hidden bg-bg">
        <div className="absolute inset-0 bg-grid bg-grid-fade" />
        <div className="absolute -top-40 right-[-15%] h-[70%] w-[70%] rounded-full bg-gold/25 blur-[140px] opacity-60" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[55%] w-[55%] rounded-full bg-gold-deep/25 blur-[160px] opacity-50" />

        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="/hero_mouse_clean.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col justify-center px-5 sm:px-10 lg:px-16">
          <div className="max-w-[70ch]">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-line bg-surface/60 px-4 py-2 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-gold" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-bright" />
              </span>
              <span className="font-tech text-[11px] uppercase tracking-[0.3em] text-mut">
                Hyderabad · India · Esports Hardware
              </span>
            </div>

            <h1 className="font-display uppercase leading-[0.9] tracking-[-0.01em]">
              <div className="text-[clamp(3.2rem,11vw,10rem)] text-ink">Level</div>
              <div className="flex items-end gap-3 sm:gap-6">
                <div className="text-[clamp(3.2rem,11vw,10rem)] text-gradient glow-text">Up</div>
                <div className="mb-3 hidden h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent sm:block" />
              </div>
              <div className="text-[clamp(3.2rem,11vw,10rem)] text-mut">
                Your <span className="text-ink">Game.</span>
              </div>
            </h1>

            <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-mut sm:text-lg">
              India's flagship esports peripherals — 16K polling hall-effect keyboards,
              <span className="text-ink"> 52g carbon-fibre mice</span>, and sensors that track
              a flick faster than you can blink.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => document.getElementById('product-showcase')?.scrollIntoView({ behavior: 'smooth' })}
                className="interactive inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 font-tech text-sm font-semibold uppercase tracking-widest text-bg transition-all hover:bg-gold-bright glow-gold"
              >
                Shop the loadout
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-bg/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 py-4 sm:px-10 lg:px-16">
            <div className="flex items-center gap-3 font-tech text-[11px] uppercase tracking-[0.2em] text-dim">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-gold" />
              <span className="hidden sm:inline">Scroll to explore</span>
            </div>
            <div className="hidden items-center gap-8 font-tech text-[11px] uppercase tracking-[0.2em] text-dim md:flex">
              <span><span className="text-ink">16K</span> polling</span>
              <span className="h-3 w-px bg-line" />
              <span><span className="text-ink">52g</span> carbon</span>
              <span className="h-3 w-px bg-line" />
              <span><span className="text-ink">0.1mm</span> actuation</span>
              <span className="h-3 w-px bg-line" />
              <span><span className="text-ink">5.0★</span> 130+ reviews</span>
            </div>
            <div className="font-tech text-[11px] uppercase tracking-[0.2em] text-dim">
              RyuGear <span className="text-ink">Z7</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ================================================================
     DESKTOP — 128-FRAME SCROLL-SCRUB CANVAS
     ================================================================ */
  return (
    <section id="hero" ref={sectionRef} className="relative h-[300vh] bg-bg">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* ambient gold field */}
        <div className="pointer-events-none absolute -top-40 right-[-15%] h-[70%] w-[70%] rounded-full bg-gold/20 blur-[150px]" />
        <div className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-[55%] w-[55%] rounded-full bg-gold-deep/20 blur-[170px]" />

        {/* readability scrim behind the type */}
        <div
          ref={scrimRef}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_46%,rgba(6,6,10,0.85),transparent_75%)]"
        />

        {/* ===== RYUGEAR wordmark ===== */}
        <div
          data-overlay="brand"
          ref={brandRef}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
        >
          <h1 className="font-display uppercase leading-[0.85] tracking-[0.02em]">
            <span className="block text-center text-[clamp(4.5rem,17vw,17rem)] text-ink">Ryu</span>
            <span className="block text-center text-[clamp(4.5rem,17vw,17rem)] text-gradient glow-text">Gear</span>
          </h1>
          <p className="mt-4 font-tech text-[11px] uppercase tracking-[0.5em] text-mut">
            Esports Peripherals · Hyderabad
          </p>
        </div>

        {/* ===== LEVEL UP YOUR GAME tagline ===== */}
        <div
          data-overlay="tagline"
          ref={taglineRef}
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
        >
          <p className="mb-5 font-tech text-[11px] uppercase tracking-[0.5em] text-gold-bright">
            Level up your game
          </p>
          <h2 className="font-display uppercase leading-[0.92] tracking-[-0.01em]">
            <span className="block text-[clamp(3.2rem,11vw,10rem)] text-ink">Level</span>
            <span className="block text-[clamp(3.2rem,11vw,10rem)] text-gradient glow-text">Up</span>
            <span className="block text-[clamp(3.2rem,11vw,10rem)] text-mut">
              Your <span className="text-ink">Game.</span>
            </span>
          </h2>
          <p className="mt-6 max-w-md font-body text-base text-mut">
            India's flagship esports peripherals — bench-tested in Hyderabad, built to win rounds.
          </p>
        </div>

        {/* ===== HUD strip ===== */}
        <div
          data-overlay="hud"
          ref={hudRef}
          className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-bg/40 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 py-4 sm:px-10 lg:px-16">
            <div className="flex items-center gap-3 font-tech text-[11px] uppercase tracking-[0.2em] text-dim">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-gold" />
              <span className="hidden sm:inline">Scroll to explore</span>
            </div>
            <div className="hidden items-center gap-8 font-tech text-[11px] uppercase tracking-[0.2em] text-dim md:flex">
              <span><span className="text-ink">16K</span> polling</span>
              <span className="h-3 w-px bg-line" />
              <span><span className="text-ink">52g</span> carbon</span>
              <span className="h-3 w-px bg-line" />
              <span><span className="text-ink">0.1mm</span> actuation</span>
              <span className="h-3 w-px bg-line" />
              <span><span className="text-ink">5.0★</span> 130+ reviews</span>
            </div>
            <div className="font-tech text-[11px] uppercase tracking-[0.2em] text-dim">
              RyuGear <span className="text-ink">Z7</span>
            </div>
          </div>
        </div>

        {/* ===== loading bar ===== */}
        {!ready && (
          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="h-px w-full bg-line">
              <div
                className="h-px bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-[width] duration-200"
                style={{ width: `${(loadedCount / TOTAL_FRAMES) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 pt-2 font-tech text-[10px] uppercase tracking-[0.3em] text-dim sm:px-10 lg:px-16">
              <span>Rendering sequence</span>
              <span>{String(loadedCount).padStart(3, '0')} / {TOTAL_FRAMES}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
