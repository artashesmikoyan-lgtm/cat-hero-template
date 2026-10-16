import { useEffect, useRef } from "react";
import { sound } from "./sound";

export type Mood = "grumpy" | "curious" | "playful" | "sleepy";

type ManifestFrame = {
  index: number;
  angle: number;
  src: string;
  sourceFrame: number;
};

type Manifest = {
  count: number;
  stepDegrees: number;
  angleOrigin: string;
  clockwise: boolean;
  center: string;
  frames: ManifestFrame[];
};

const MOOD_RESPONSE: Record<Mood, number> = {
  playful: 0.38,
  curious: 0.28,
  grumpy: 0.20,
  sleepy: 0.09,
};

const BASE_DEADZONE = 0.12;   // Fraction of min(w, h)
const HYSTERESIS = 1.15;     // Prevents flickering at deadzone border
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
    img.onload = () => {
      img.decode().catch(() => undefined).then(() => resolve(img));
    };
    img.onerror = () => reject(new Error("Failed loading frame: " + src));
    img.src = src;
  });
}

type Props = {
  debug: boolean;
  mood: Mood;
  isLaser: boolean;
  onProgress: (p: number) => void;
  onReady: () => void;
  onEyeContactChange?: (isEyeContact: boolean) => void;
  onPet?: (x: number, y: number) => void;
};

export default function HeadTracker({
  debug,
  mood,
  isLaser,
  onProgress,
  onReady,
  onEyeContactChange,
  onPet,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  // Keep references to props so raf loop has fresh values without re-subscribing
  const propsRef = useRef({
    mood,
    isLaser,
    onProgress,
    onReady,
    onEyeContactChange,
    onPet,
  });
  propsRef.current = {
    mood,
    isLaser,
    onProgress,
    onReady,
    onEyeContactChange,
    onPet,
  };

  useEffect(() => {
    let raf = 0;
    let alive = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const ptr = { x: 0, y: 0, active: false };
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.active = true;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") ptr.active = false;
    };
    const onOff = () => {
      ptr.active = false;
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) ptr.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onOff);
    window.addEventListener("blur", onOff);
    document.addEventListener("mouseout", onOut);

    let dirty = true;
    const ro = new ResizeObserver(() => {
      dirty = true;
    });
    ro.observe(canvas);

    (async () => {
      // 1. Fetch manifest.json from /frames/manifest.json
      let count = 64;
      try {
        const manifestRes = await fetch("frames/manifest.json", { cache: "no-store" });
        if (manifestRes.ok) {
          const manifest: Manifest = await manifestRes.json();
          if (manifest.count) count = manifest.count;
        }
      } catch (err) {
        console.warn("Using fallback frame count", err);
      }

      // 2. Generate frame paths: frames/frame-000.webp ... frame-063.webp + center.webp
      const srcs: string[] = [];
      for (let i = 0; i < count; i++) {
        srcs.push(`frames/frame-${String(i).padStart(3, "0")}.webp`);
      }
      srcs.push("frames/center.webp");

      let loadedCount = 0;
      const imgs = await Promise.all(
        srcs.map((src) =>
          loadImage(src)
            .then((img) => {
              loadedCount++;
              propsRef.current.onProgress(loadedCount / srcs.length);
              return img;
            })
            .catch((err) => {
              console.error("Frame failed:", src, err);
              // Fallback to center image if one frame fails
              return loadImage("frames/center.webp");
            })
        )
      );

      if (!alive) return;

      const frames = imgs.slice(0, count);
      const center = imgs[count] || imgs[0];

      // Native frame dimensions from first image
      const nativeWidth = frames[0]?.naturalWidth || 768;
      const nativeHeight = frames[0]?.naturalHeight || 432;
      const frameBgColor = "#c39d74"; // Warm studio sand background

      // Drawn image layout box in CSS px
      const box = { x: 0, y: 0, w: 0, h: 0, left: 0, top: 0, dpr: 1 };

      const layout = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = Math.round(rect.width * dpr);
        const ch = Math.round(rect.height * dpr);

        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
        }

        // Cover whole stage with comfortable framing
        const scale = Math.max(rect.width / nativeWidth, rect.height / nativeHeight);
        box.w = nativeWidth * scale;
        box.h = nativeHeight * scale;
        box.x = (rect.width - box.w) * 0.5;
        // Position slightly above center to give space to hero copy/dock
        box.y = (rect.height - box.h) * (rect.width > 768 ? 0.30 : 0.18);
        box.left = rect.left;
        box.top = rect.top;
        box.dpr = dpr;
      };

      const draw = (img: HTMLImageElement) => {
        ctx.setTransform(box.dpr, 0, 0, box.dpr, 0, 0);

        // Fill background with warm studio tone
        ctx.fillStyle = frameBgColor;
        ctx.fillRect(0, 0, canvas.width / box.dpr, canvas.height / box.dpr);

        ctx.globalAlpha = 1;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, box.x, box.y, box.w, box.h);
      };

      let curAngle = 0;
      let mode: "center" | "dir" = "center";
      let lastIdx = -99;
      let lastTime = performance.now();
      let fps = 60;
      let first = true;
      let eyeContactReported = false;

      const tick = (t: number) => {
        const dt = Math.min(64, t - lastTime);
        lastTime = t;
        if (dt > 0) fps = fps * 0.92 + (1000 / dt) * 0.08;

        if (dirty) {
          layout();
          dirty = false;
          lastIdx = -99;
        }

        // Face center in viewport coords (cat face is approx centered at 50% width, 52% height of image)
        const fcx = box.left + box.x + 0.50 * box.w;
        const fcy = box.top + box.y + 0.52 * box.h;

        let targetAngle = curAngle;
        let idx = -1;

        const effectiveDeadzone = propsRef.current.isLaser
          ? BASE_DEADZONE * 0.25
          : BASE_DEADZONE;

        if (ptr.active) {
          const dx = ptr.x - fcx;
          const dy = ptr.y - fcy;
          const r = Math.hypot(dx, dy);
          const minDim = Math.min(window.innerWidth, window.innerHeight);
          const R = effectiveDeadzone * minDim;

          // Clockwise angle from 12 o'clock (UP):
          // UP (0, -1) => 0
          // RIGHT (1, 0) => PI/2 (90 deg)
          // DOWN (0, 1) => PI (180 deg)
          // LEFT (-1, 0) => 3PI/2 (270 deg)
          targetAngle = wrap(Math.atan2(dx, -dy));

          if (mode === "center" && r > R * HYSTERESIS) {
            mode = "dir";
            curAngle = targetAngle;
            if (eyeContactReported) {
              eyeContactReported = false;
              propsRef.current.onEyeContactChange?.(false);
              sound.stopPurr();
            }
          } else if (mode === "dir" && r < R) {
            mode = "center";
            if (!eyeContactReported) {
              eyeContactReported = true;
              propsRef.current.onEyeContactChange?.(true);
              sound.startPurr();
            }
          }
        } else {
          mode = "center";
          if (eyeContactReported) {
            eyeContactReported = false;
            propsRef.current.onEyeContactChange?.(false);
            sound.stopPurr();
          }
        }

        if (mode === "dir") {
          const baseResp = propsRef.current.isLaser
            ? 0.45
            : MOOD_RESPONSE[propsRef.current.mood] || 0.20;
          const k = 1 - Math.pow(1 - baseResp, dt / 16.667);
          curAngle = lerpAngle(curAngle, targetAngle, k);
          idx = Math.round((wrap(curAngle) / TAU) * count) % count;
        }

        if (idx !== lastIdx) {
          draw(idx < 0 ? center : frames[idx]);
          lastIdx = idx;
          if (first) {
            first = false;
            propsRef.current.onReady();
          }
        }

        // Optional Debug HUD
        const hud = hudRef.current;
        if (hud && hud.dataset.on === "1") {
          const deg = Math.round((wrap(curAngle) * 180) / Math.PI);
          hud.textContent =
            `FRAME: ${idx < 0 ? "CENTER (EYE CONTACT)" : String(idx).padStart(2, "0")} / ${count} ` +
            `· ANGLE: ${deg}° · FPS: ${Math.round(fps)} · MOOD: ${propsRef.current.mood.toUpperCase()}`;
        }

        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    })().catch((err) => {
      console.error("HeadTracker initialization failed:", err);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      sound.stopPurr();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onOff);
      window.removeEventListener("blur", onOff);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  // Handle petting / clicking on Mochi
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    sound.playChime();
    sound.playMeow();
    propsRef.current.onPet?.(e.clientX, e.clientY);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="head-canvas"
        aria-label="Interactive 3D Mochi Cat looking and turning to follow your cursor"
      />
      <div ref={hudRef} className="hud" data-on={debug ? "1" : "0"} />
    </>
  );
}