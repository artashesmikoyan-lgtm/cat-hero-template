import { useEffect, useRef } from "react";

// Glowing dot (zero-lag, exactly on the pointer) + trailing aura ring that grows on interactive hover.
// Elements wrapped in [data-magnetic] pull their child toward the pointer and capture the ring.
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const dot = dotRef.current!, ring = ringRef.current!;

    let x = -100, y = -100, rx = -100, ry = -100, rs = 1, ds = 1;
    let on = false, down = false, raf = 0, last = performance.now(), lastEmit = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hover: HTMLElement | null = null;
    let mag: HTMLElement | null = null;
    let magC = { cx: 0, cy: 0 };

    const release = (el: HTMLElement | null) => {
      const inner = el?.firstElementChild as HTMLElement | null;
      if (inner) inner.style.transform = "";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX; y = e.clientY;
      const now = performance.now();
      if (!reduceMotion && now - lastEmit > 22 && trailRef.current) {
        lastEmit = now;
        const mote = document.createElement("i");
        const size = 7 + Math.random() * 14;
        mote.className = "cursor-mote";
        mote.style.setProperty("--x", `${x - size / 2}px`);
        mote.style.setProperty("--y", `${y - size / 2}px`);
        mote.style.setProperty("--dx", `${-18 + Math.random() * 36}px`);
        mote.style.setProperty("--dy", `${-26 - Math.random() * 42}px`);
        mote.style.setProperty("--size", `${size}px`);
        mote.style.setProperty("--life", `${720 + Math.random() * 520}ms`);
        trailRef.current.appendChild(mote);
        mote.addEventListener("animationend", () => mote.remove(), { once: true });
      }
      if (!on) { on = true; rx = x; ry = y; root.classList.add("cursor-on"); }
      const t = e.target instanceof Element ? (e.target.closest("a, button, [data-hover]") as HTMLElement | null) : null;
      if (t !== hover) { hover = t; root.classList.toggle("cursor-hover", !!t); }
      const m = e.target instanceof Element ? (e.target.closest("[data-magnetic]") as HTMLElement | null) : null;
      if (m !== mag) { release(mag); mag = m; }
      if (mag) {
        const b = mag.getBoundingClientRect(); // wrapper never moves, so no feedback loop
        magC = { cx: b.left + b.width / 2, cy: b.top + b.height / 2 };
        const inner = mag.firstElementChild as HTMLElement | null;
        if (inner) inner.style.transform = `translate(${(x - magC.cx) * 0.3}px, ${(y - magC.cy) * 0.4}px)`;
      }
    };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) { on = false; root.classList.remove("cursor-on"); release(mag); mag = null; }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseout", onOut);

    const tick = (t: number) => {
      const f = Math.min(64, t - last) / (1000 / 60); last = t;
      const k = 1 - Math.pow(1 - 0.2, f);
      const ks = 1 - Math.pow(1 - 0.18, f);
      let tx = x, ty = y;
      if (mag) { tx = magC.cx + (x - magC.cx) * 0.45; ty = magC.cy + (y - magC.cy) * 0.45; }
      rx += (tx - rx) * k; ry += (ty - ry) * k;
      const trs = (hover ? (mag ? 2.1 : 1.7) : 1) * (down ? 0.82 : 1);
      const tds = (hover ? 0.5 : 1) * (down ? 0.7 : 1);
      rs += (trs - rs) * ks; ds += (tds - ds) * ks;
      dot.style.transform = `translate(${x}px, ${y}px) scale(${ds})`;
      ring.style.transform = `translate(${rx}px, ${ry}px) scale(${rs})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); release(mag);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("has-cursor", "cursor-on", "cursor-hover");
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
