import { useEffect, useRef } from "react";

type Props = {
  isLaser?: boolean;
};

// Glowing interactive cursor with magnetic snapping and laser pointer mode
export default function Cursor({ isLaser = false }: Props) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isLaserRef = useRef(isLaser);
  isLaserRef.current = isLaser;

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let x = -100, y = -100, rx = -100, ry = -100, rs = 1, ds = 1;
    let on = false, down = false, raf = 0, last = performance.now();
    let hover: HTMLElement | null = null;
    let mag: HTMLElement | null = null;
    let magC = { cx: 0, cy: 0 };

    const release = (el: HTMLElement | null) => {
      const inner = el?.firstElementChild as HTMLElement | null;
      if (inner) inner.style.transform = "";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      if (!on) {
        on = true;
        rx = x;
        ry = y;
        root.classList.add("cursor-on");
      }
      const t = e.target instanceof Element ? (e.target.closest("a, button, [data-hover]") as HTMLElement | null) : null;
      if (t !== hover) {
        hover = t;
        root.classList.toggle("cursor-hover", !!t);
      }
      const m = e.target instanceof Element ? (e.target.closest("[data-magnetic]") as HTMLElement | null) : null;
      if (m !== mag) {
        release(mag);
        mag = m;
      }
      if (mag) {
        const b = mag.getBoundingClientRect();
        magC = { cx: b.left + b.width / 2, cy: b.top + b.height / 2 };
        const inner = mag.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.transform = `translate(${(x - magC.cx) * 0.3}px, ${(y - magC.cy) * 0.4}px)`;
        }
      }
    };

    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        on = false;
        root.classList.remove("cursor-on");
        release(mag);
        mag = null;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseout", onOut);

    const tick = (t: number) => {
      const dt = Math.min(64, t - last) / 16.667;
      last = t;

      // Higher stiffness for laser mode, smooth spring for standard mode
      const laser = isLaserRef.current;
      const kPos = laser ? 0.38 : 0.20;
      const kScale = laser ? 0.35 : 0.18;

      let tx = x, ty = y;
      if (mag && !laser) {
        tx = magC.cx + (x - magC.cx) * 0.45;
        ty = magC.cy + (y - magC.cy) * 0.45;
      }

      rx += (tx - rx) * (1 - Math.pow(1 - kPos, dt));
      ry += (ty - ry) * (1 - Math.pow(1 - kPos, dt));

      const targetScale = laser
        ? (down ? 0.8 : 1.2)
        : (hover ? (mag ? 2.1 : 1.7) : 1) * (down ? 0.82 : 1);
      const dotTargetScale = (hover ? 0.5 : 1) * (down ? 0.7 : 1);

      rs += (targetScale - rs) * (1 - Math.pow(1 - kScale, dt));
      ds += (dotTargetScale - ds) * (1 - Math.pow(1 - kScale, dt));

      dot.style.transform = `translate(${x}px, ${y}px) scale(${ds})`;
      ring.style.transform = `translate(${rx}px, ${ry}px) scale(${rs})`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      release(mag);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("has-cursor", "cursor-on", "cursor-hover");
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className={`cursor-ring ${isLaser ? "is-laser" : ""}`}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className={`cursor-dot ${isLaser ? "is-laser" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}