import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CloudMotif } from './CloudMotif';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;
const BATCH_1 = 40;
const FRAME_W = 1200;
const FRAME_H = 675;

const framePath = (index) =>
  `/dragon-hero-sequence/frame_${String(index + 1).padStart(4, '0')}.webp`;

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/* Drifting ember particles — sprite-based for cheap glow; intensity scales
   with scrub progress so the fire "breathes" as the dragon emerges. */
function EmberField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let width = 0;
    let height = 0;
    let particles = [];
    let visible = true;
    const intensity = { current: 0.5 };

    const makeSprite = (r, g, b) => {
      const s = document.createElement('canvas');
      s.width = s.height = 64;
      const c = s.getContext('2d');
      const grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.45)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      c.fillStyle = grad;
      c.fillRect(0, 0, 64, 64);
      return s;
    };
    const sprites = [
      makeSprite(242, 204, 87),  // gold-bright
      makeSprite(217, 168, 60),  // gold
      makeSprite(255, 170, 90),  // ember amber
      makeSprite(255, 240, 230), // hot white
    ];

    const spawn = (anywhere) => {
      const size = 5 + Math.random() * 15;
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : height + size,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.1 + Math.random() * 0.35),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.012,
        size,
        sprite: sprites[(Math.random() * sprites.length) | 0],
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const seed = () => {
      const count = Math.round(Math.min(70, (width * height) / 26000));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || !visible) return;
      ctx.clearRect(0, 0, width, height);
      const target = 0.5 + (window.__dragonHero?.progress ?? 0) * 0.5;
      intensity.current += (target - intensity.current) * 0.08;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.phase += 0.015 + Math.random() * 0.01;
        pt.sway += pt.swaySpeed;
        pt.x += pt.vx + Math.sin(pt.sway) * 0.15;
        pt.y += pt.vy;
        if (pt.y < -40 || pt.x < -40 || pt.x > width + 40) {
          particles[i] = spawn(false);
          continue;
        }
        const twinkle = 0.55 + 0.45 * Math.sin(pt.phase);
        ctx.globalAlpha = pt.alpha * twinkle * intensity.current;
        ctx.drawImage(pt.sprite, pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      }
      ctx.globalAlpha = 1;
    };

    resize();
    tick();
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(canvas);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      data-role="embers"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full mix-blend-screen"
    />
  );
}

export function DragonHeroSequenceSection() {
  const releaseRef = useRef(null);
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4;
  const useSequence = !reduceMotion && !lowEnd;

  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const canvasRef = useRef(null);
  const wordmarkRef = useRef(null);

  const framesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadedFirst, setLoadedFirst] = useState(0);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  const progressRef = useRef(0);
  const lastFrameRef = useRef(-1);

  /* ---------- batched frame preload ---------- */
  useEffect(() => {
    if (!useSequence) return;
    let cancelled = false;
    const imgs = new Array(TOTAL_FRAMES);
    let totalLoaded = 0;
    let firstLoaded = 0;

    const markLoaded = (i) => {
      if (cancelled) return;
      if (imgs[i] && imgs[i].__loaded) return;
      if (imgs[i]) imgs[i].__loaded = true;
      totalLoaded += 1;
      setLoadedCount(totalLoaded);
      if (i < BATCH_1) {
        firstLoaded += 1;
        setLoadedFirst(firstLoaded);
        if (firstLoaded === BATCH_1) {
          readyRef.current = true;
          setReady(true);
        }
      }
    };

    const create = (i) => {
      if (imgs[i]) return;
      const img = new Image();
      img.onload = () => markLoaded(i);
      img.onerror = () => markLoaded(i);
      img.src = framePath(i);
      imgs[i] = img;
    };

    /* Batch 1 — the coiled-hold + early zoom beats. Block scrub on these. */
    for (let i = 0; i < BATCH_1; i++) create(i);
    framesRef.current = imgs;

    /* Remaining frames — background, in small chunks so early scroll stays fluid. */
    const startRest = BATCH_1;
    const CHUNK = 16;
    let next = startRest;
    let timeout;
    const chunk = () => {
      if (cancelled || next >= TOTAL_FRAMES) return;
      const end = Math.min(next + CHUNK, TOTAL_FRAMES);
      for (; next < end; next++) create(next);
      timeout = setTimeout(chunk, 40);
    };
    timeout = setTimeout(chunk, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      framesRef.current = [];
    };
  }, [useSequence]);

  /* ---------- cover-fit draw ---------- */
  const draw = (frame) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[frame];
    if (!canvas || !img || !img.complete || !img.__loaded) return;
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

  /* ---------- canvas backing store + cover resize ---------- */
  useEffect(() => {
    if (!useSequence) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (lastFrameRef.current >= 0) draw(lastFrameRef.current);
      else draw(0);
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

  /* ---------- throttled rAF redraw loop ---------- */
  useEffect(() => {
    if (!useSequence) return;
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = clamp01(progressRef.current);
      const target = readyRef.current ? Math.round(p * (TOTAL_FRAMES - 1)) : 0;
      if (target !== lastFrameRef.current) {
        lastFrameRef.current = target;
        draw(target);
        if (window.__dragonHero) window.__dragonHero.frame = target;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [useSequence]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- scroll-scrub + pin ---------- */
  useEffect(() => {
    if (!useSequence) return;
    const section = sectionRef.current;
    if (!section) return;

    const updateHero = (self) => {
      const p = clamp01(self.progress);
      progressRef.current = p;
      if (window.__dragonHero) window.__dragonHero.progress = p;

      /* Wordmark: full → dim to 45% by p=0.15, hold there (never 0) */
      const wO = p < 0.15 ? 1 - (p / 0.15) * 0.55 : 0.45;
      if (wordmarkRef.current) {
        wordmarkRef.current.style.opacity = wO.toFixed(3);
        wordmarkRef.current.dataset.opacity = wO.toFixed(3);
      }

      /* Exit crossfade: macro close-up fades into product showcase by p=1.0 */
      const cO = p < 0.94 ? 1 : 1 - (p - 0.94) / 0.06;
      if (pinRef.current) {
        pinRef.current.style.opacity = cO.toFixed(3);
        pinRef.current.dataset.opacity = cO.toFixed(3);
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: pinRef.current,
      scrub: true,
      anticipatePin: 1,
      onUpdate: updateHero,
    });
    updateHero({ progress: 0 });

    releaseRef.current = () => st.kill();

    return () => {
      if (releaseRef.current) releaseRef.current();
      releaseRef.current = null;
    };
  }, [useSequence]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- expose state for verification ---------- */
  useEffect(() => {
    window.__dragonHero = {
      total: TOTAL_FRAMES,
      first: BATCH_1,
      loaded: loadedCount,
      loadedFirst,
      ready,
      frame: lastFrameRef.current,
      progress: progressRef.current,
    };
  }, [loadedCount, loadedFirst, ready]);

  /* ================================================================
     SINGLE SECTION — canvas scrub stage stays mounted (never torn down
     by React while pinned); video fallback toggled via CSS instead.
     ================================================================ */
  return (
    <section
      id="hero"
      ref={sectionRef}
      className={useSequence ? 'relative h-[400vh] bg-bg' : 'relative flex min-h-[100svh] overflow-hidden bg-bg'}
    >
      <CloudMotif />
      {/* video fallback: low-end devices / reduced-motion */}
      {!useSequence && (
        <>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/dragon_final_render_clean.mp4"
            poster="/dragon-hero-sequence/frame_0001.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="pointer-events-none absolute inset-0 bg-bg/20" />
          <div className="absolute left-5 top-28 z-10 flex flex-col sm:left-10 lg:left-16">
            <span className="font-display text-[22px] uppercase tracking-wide text-gold-bright">RYUGEAR</span>
            <span className="mt-1.5 font-tech text-[10px] uppercase tracking-[0.3em] text-gold-muted">
              Level up your game
            </span>
          </div>
        </>
      )}

      {/* pinned scrub stage — kept mounted to avoid ScrollTrigger pin/React teardown errors */}
      <div
        ref={pinRef}
        data-overlay="stage"
        className={`absolute left-0 top-0 z-10 h-screen w-full overflow-hidden ${useSequence ? '' : 'hidden'}`}
      >
        <canvas
          ref={canvasRef}
          data-role="stage"
          className="stage-grade absolute inset-0 h-full w-full"
        />

        {/* cinematic atmosphere: gold glow behind dragon, embers, vignette, grain */}
        <div data-overlay="glow" className="stage-glow pointer-events-none absolute inset-0 z-[1]" />
        {useSequence && <EmberField />}
        <div data-overlay="vignette" className="stage-vignette pointer-events-none absolute inset-0 z-[3]" />
        <div data-overlay="grain" className="grain pointer-events-none absolute inset-0 z-[4]" />

        {/* ===== top-left wordmark lockup ===== */}
        <div
          data-overlay="brand"
          ref={wordmarkRef}
          className="pointer-events-none absolute left-5 top-28 z-10 flex flex-col sm:left-10 lg:left-16"
        >
          <span className="font-display text-[22px] uppercase tracking-wide text-gold-bright">RYUGEAR</span>
          <span className="mt-1.5 font-tech text-[10px] uppercase tracking-[0.3em] text-gold-muted">
            Level up your game
          </span>
        </div>

        {/* ===== loading bar — first batch only ===== */}
        {!ready && (
          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="h-px w-full bg-line">
              <div
                className="h-px bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-[width] duration-200"
                style={{ width: `${(loadedFirst / BATCH_1) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 pt-2 font-tech text-[10px] uppercase tracking-[0.3em] text-dim sm:px-10 lg:px-16">
              <span>Loading dragon sequence</span>
              <span>{String(loadedFirst).padStart(3, '0')} / {BATCH_1}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
