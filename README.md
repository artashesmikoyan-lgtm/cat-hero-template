# Mochi — Interactive 3D Cat 🐾
> **Premier 21st.dev Template & React Hero Component**

A lightweight, 60 FPS interactive 3D cat hero component with 360-degree cursor tracking, lifelike eye contact, and procedural Web Audio purrs.

![Mochi Preview](public/frames/center.webp)

---

## 🌟 Why Mochi? (21st.dev Quality Standards)

- **Zero Heavy 3D Engines**: No multi-megabyte Three.js / Spline bundles. Built with an optimized 64-frame pre-rendered WebP canvas stepper (~48KB gzipped).
- **Smooth 60 FPS Tracking**: Frame-rate independent lerp dampening with sub-pixel interpolation and 2x Retina DPR.
- **Eye Contact & Deadzone Physics**: Mochi tracks your pointer around the screen, but locks direct eye contact and starts softly purring when you enter his gaze radius.
- **Zero-Asset Procedural Audio**: Realistic cat purrs, cute meows, and haptic chimes generated in real-time via the browser's native **Web Audio API** — 0 external MP3 files needed.
- **Interactive Modes**:
  - 🐾 **Standard Cursor Follow**: Smooth head turns following the pointer.
  - 🔴 **Laser Pointer Mode (`[L]` key)**: Glowing crimson reticle that Mochi eagerly chases.
  - 🐟 **Petting & Treats (`[Space]` / Click)**: Blossom floating reaction hearts and playful meow audio.
  - 😼 **Personalities & Moods**: Switch between *Grumpy* (unbothered), *Curious* (attentive), *Playful* (snappy), and *Sleepy* (drowsy).
- **Template Use-Cases**: Switchable between **SaaS Hero Landing**, **Creative Developer Portfolio**, and **404 / Mascot Widget**.

---

## 🚀 Quick Start

### Installation via CLI
```bash
npx 21st add mochi-cat
```

### Component Usage
```tsx
import { MochiCat } from "@/components/MochiCat";

export default function Hero() {
  return (
    <div className="relative w-screen h-screen">
      <MochiCat
        mood="curious"
        soundEnabled={true}
        onEyeContact={(isContact) => console.log("Eye contact:", isContact)}
      />
    </div>
  );
}
```

---

## 🛠️ Props & API

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mood` | `'grumpy' \| 'curious' \| 'playful' \| 'sleepy'` | `'grumpy'` | Dictates tracking speed and personality curve. |
| `isLaser` | `boolean` | `false` | Activates agile laser-pointer tracking. |
| `soundEnabled` | `boolean` | `true` | Enables procedural Web Audio purrs & chimes. |
| `onEyeContact` | `(isContact: boolean) => void` | `undefined` | Callback fired when entering/leaving direct gaze. |
| `onPet` | `(x: number, y: number) => void` | `undefined` | Callback fired on face click or pet interaction. |

---

## ⌨️ Keyboard Shortcuts

- `[L]` — Toggle Laser Pointer Mode
- `[Space]` — Pet Mochi (Heart reactions & chime)
- `[M]` — Mute / Unmute Sound FX
- `[D]` — Toggle Debug HUD (real-time angle, frame index, FPS)

---

## 📦 Project Structure

```
├── public/
│   └── frames/              # 64 pre-rendered 360° WebP frames + center.webp
├── src/
│   ├── App.tsx              # Showcase template & use-case switcher
│   ├── HeadTracker.tsx      # High-performance canvas tracking engine
│   ├── Cursor.tsx           # Magnetic custom cursor & laser pointer
│   ├── FloatingDock.tsx     # Frosted glass interactive control center
│   ├── CopyCodeModal.tsx    # 21st.dev code drawer & installation guide
│   ├── HeartParticles.tsx   # Petting reaction particles
│   ├── sound.ts             # Pure Web Audio API synthesis engine
│   └── styles.css           # Modern tokens, studio lighting & glassmorphism
```

---

## 📄 License

MIT © Artash
