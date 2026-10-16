import { Mood } from "./HeadTracker";
import { Volume2, VolumeX, Flame, Heart, Moon, Sun, Sparkles, Compass } from "lucide-react";
import { sound } from "./sound";

export type Theme = "warm" | "midnight" | "sage";

type Props = {
  mood: Mood;
  onMoodChange: (m: Mood) => void;
  isLaser: boolean;
  onLaserToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  onPet: () => void;
  onOpenCode: () => void;
};

const MOODS: { id: Mood; label: string; icon: string; desc: string }[] = [
  { id: "grumpy", label: "Grumpy", icon: "😼", desc: "Unbothered & skeptical" },
  { id: "curious", label: "Curious", icon: "😺", desc: "Attentive & focused" },
  { id: "playful", label: "Playful", icon: "😸", desc: "Fast & reactive" },
  { id: "sleepy", label: "Sleepy", icon: "😴", desc: "Drowsy & slow" },
];

export default function FloatingDock({
  mood,
  onMoodChange,
  isLaser,
  onLaserToggle,
  soundEnabled,
  onSoundToggle,
  theme,
  onThemeChange,
  onPet,
  onOpenCode,
}: Props) {
  return (
    <aside className="dock-container reveal" aria-label="Interactive Controls">
      <div className="dock-inner">
        {/* Mood Selector Segment */}
        <div className="dock-segment" role="radiogroup" aria-label="Cat Mood">
          {MOODS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={mood === m.id}
              onClick={() => {
                sound.playClick(1.1);
                onMoodChange(m.id);
              }}
              className={`dock-btn ${mood === m.id ? "is-active" : ""}`}
              title={`${m.label} Mood: ${m.desc}`}
              data-hover
            >
              <span className="dock-emoji">{m.icon}</span>
              <span className="dock-label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="dock-divider" />

        {/* Action Buttons: Laser, Pet, Sound */}
        <div className="dock-segment">
          {/* Laser Pointer Mode */}
          <button
            onClick={() => {
              sound.playLaserBlip();
              onLaserToggle();
            }}
            className={`dock-btn dock-btn-laser ${isLaser ? "is-active" : ""}`}
            title="Toggle Laser Pointer [L]"
            data-hover
          >
            <Flame className={`w-3.5 h-3.5 ${isLaser ? "text-red-400 animate-pulse" : ""}`} />
            <span className="dock-label">Laser [L]</span>
          </button>

          {/* Pet Mochi Button */}
          <button
            onClick={() => {
              onPet();
            }}
            className="dock-btn dock-btn-pet"
            title="Pet Mochi [Space]"
            data-hover
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 group-hover:scale-125 transition-transform" />
            <span className="dock-label">Pet</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onSoundToggle();
            }}
            className={`dock-btn ${soundEnabled ? "is-active" : ""}`}
            title={soundEnabled ? "Mute audio [M]" : "Unmute audio [M]"}
            data-hover
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-50" />
            )}
            <span className="dock-label">{soundEnabled ? "FX On" : "Muted"}</span>
          </button>
        </div>

        <div className="dock-divider" />

        {/* Theme & Code */}
        <div className="dock-segment">
          {/* Theme switcher */}
          <button
            onClick={() => {
              sound.playClick(1.0);
              const next: Theme = theme === "warm" ? "midnight" : theme === "midnight" ? "sage" : "warm";
              onThemeChange(next);
            }}
            className="dock-btn"
            title="Cycle Lighting Theme"
            data-hover
          >
            {theme === "warm" && <Sun className="w-3.5 h-3.5 text-amber-300" />}
            {theme === "midnight" && <Moon className="w-3.5 h-3.5 text-indigo-300" />}
            {theme === "sage" && <Sparkles className="w-3.5 h-3.5 text-emerald-300" />}
            <span className="dock-label capitalize">{theme}</span>
          </button>

          {/* Code Drawer Trigger */}
          <button
            onClick={() => {
              sound.playClick(1.2);
              onOpenCode();
            }}
            className="dock-btn dock-btn-code"
            title="Get Component Code & Docs"
            data-hover
          >
            <Compass className="w-3.5 h-3.5 text-amber-200" />
            <span className="dock-label font-medium text-amber-100">Get Code</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
