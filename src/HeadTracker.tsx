import { useEffect, useRef } from "react";

type Meta = {
  count: number;
  bg: string;
};

const RESPONSE = 0.26;   // lerp factor per 60fps frame (frame-rate independent below)
const DEADZONE = 0.12;   // eye-contact radius, fraction of min(viewport w, h)
const HYSTERESIS = 1.12; // exit radius multiplier, prevents flicker at the deadzone edge
const TAU = Math.PI * 2;

const wrap = (a: number) => ((a % TAU) + TAU) % TAU;
export function lerpAngle(a: number, b: number, t: number) {
  const d = wrap(b - a + Math.PI) - Math.PI; // shortest signed arc
  return a + d * t;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => { img.decode().catch(() => undefined).then(() => resolve(img)); };
    img.onerror = () => reject(new Error("failed " + src));
    img.src = src;
  });
}

type Props = { onProgress: (progress: number) => void; onReady: () => void };

export default function HeadTracker({ onProgress, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onProgress, onReady });
  cb.current = { onProgress, onReady };

  useEffect(() => {
    let raf = 0, alive = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const ptr = { x: 0, y: 0, active: false };
    const onMove = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.active = true; };
    const onUp = (e: PointerEvent) => { if (e.pointerType === "touch") ptr.active = false; };
    const onOff = () => { ptr.active = false; };
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget) ptr.active = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onOff);
    window.addEventListener("blur", onOff);
    document.addEventListener("mouseout", onOut);

    let dirty = true;
    const ro = new ResizeObserver(() => { dirty = true; });
    ro.observe(canvas);

    (async () => {
      const meta: Meta = await fetch("frames/manifest.json", { cache: "no-store" }).then((r) => r.json());
      const srcs = [
        ...Array.from({ length: meta.count }, (_, i) => `frames/frame-${String(i).padStart(3, "0")}.webp`),
        "frames/center.webp",
      ];
      let loaded = 0;
      const imgs = await Promise.all(
        srcs.map((s) => loadImage(s).then((im) => { loaded++; cb.current.onProgress(loaded / srcs.length); return im; }))
      );
      if (!alive) return;
      const frames = imgs.slice(0, meta.count);
      const center = imgs[meta.count];
      const imageWidth = center.naturalWidth;
      const imageHeight = center.naturalHeight;

      // drawn-image box in CSS px, relative to canvas
      const box = { x: 0, y: 0, w: 0, h: 0, left: 0, top: 0, dpr: 1 };
      const layout = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = Math.round(r.width * dpr), ch = Math.round(r.height * dpr);
        if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
        // object-fit: cover — fill the whole viewport and crop overflow; vertical crop biased upward to protect the hair
        const s = Math.max(r.width / imageWidth, r.height / imageHeight);
        box.w = imageWidth * s; box.h = imageHeight * s;
        box.x = (r.width - box.w) * 0.5; box.y = (r.height - box.h) * 0.2;
        box.left = r.left; box.top = r.top; box.dpr = dpr;
      };

      const draw = (img: HTMLImageElement) => {
        ctx.setTransform(box.dpr, 0, 0, box.dpr, 0, 0);
        ctx.fillStyle = meta.bg;
        ctx.fillRect(0, 0, canvas.width / box.dpr, canvas.height / box.dpr);
        ctx.globalAlpha = 1;                  // exactly one frame, fully opaque — never blended
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, box.x, box.y, box.w, box.h);
      };

      let cur = 0, mode: "center" | "dir" = "center", lastIdx = -99, lastT = performance.now();
      let first = true;

      const tick = (t: number) => {
        const dt = Math.min(64, t - lastT); lastT = t;
        if (dirty) { layout(); dirty = false; lastIdx = -99; }

        const fcx = box.left + box.x + 0.5 * box.w;
        const fcy = box.top + box.y + 0.43 * box.h;
        let idx = -1, target = cur;
        if (ptr.active) {
          const dx = ptr.x - fcx, dy = ptr.y - fcy;
          const r = Math.hypot(dx, dy);
          const R = DEADZONE * Math.min(window.innerWidth, window.innerHeight);
          // The bundled sequence starts at 12 o'clock and advances clockwise.
          // atan2 starts at 3 o'clock, so rotate the pointer angle by +90°.
          target = wrap(Math.atan2(dy, dx) + Math.PI / 2);
          if (mode === "center" && r > R * HYSTERESIS) { mode = "dir"; cur = target; } // snap: no sweep out of center
          else if (mode === "dir" && r < R) mode = "center";
        } else mode = "center";

        if (mode === "dir") {
          const k = 1 - Math.pow(1 - RESPONSE, dt / (1000 / 60));
          cur = lerpAngle(cur, target, k);
          idx = Math.round((wrap(cur) / TAU) * meta.count) % meta.count;
        }

        if (idx !== lastIdx) {
          draw(idx < 0 ? center : frames[idx]);
          lastIdx = idx;
          if (first) { first = false; cb.current.onReady(); }
        }

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })().catch((e) => console.error(e));

    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onOff);
      window.removeEventListener("blur", onOff);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="head-canvas" aria-label="Portrait that turns to follow your cursor" />
  );
}
