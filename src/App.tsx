import { useEffect, useState, type CSSProperties } from "react";
import HeadTracker, { Mood } from "./HeadTracker";
import Cursor from "./Cursor";
import FloatingDock, { Theme } from "./FloatingDock";
import CopyCodeModal from "./CopyCodeModal";
import HeartParticles, { HeartItem } from "./HeartParticles";
import { sound } from "./sound";
import {
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  Flame,
  Heart,
  Github,
  ArrowUpRight,
  Code2,
  CheckCircle2,
  Cpu,
} from "lucide-react";

type UseCase = "showcase" | "saas" | "portfolio";

const d = (s: string) => ({ "--d": s } as CSSProperties);

export default function App() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [debug, setDebug] = useState(false);
  const [mood, setMood] = useState<Mood>("grumpy");
  const [isLaser, setIsLaser] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<Theme>("warm");
  const [useCase, setUseCase] = useState<UseCase>("showcase");
  const [isEyeContact, setIsEyeContact] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  // Sound toggle helper
  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playClick(1.2);
  };

  // Petting interaction
  const triggerPet = (customX?: number, customY?: number) => {
    sound.playChime();
    sound.playMeow();

    const x = customX ?? window.innerWidth * 0.5;
    const y = customY ?? window.innerHeight * 0.42;

    const emojis = ["❤️", "✨", "🐾", "💖", "🐟"];
    const newHearts: HeartItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 120,
      y: y + (Math.random() - 0.5) * 80,
      size: Math.floor(Math.random() * 18) + 22,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      rotation: (Math.random() - 0.5) * 40,
    }));

    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.includes(h)));
    }, 1200);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if modal is open or user is typing in an input
      if (isCodeModalOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "d" || e.key === "D") {
        setDebug((v) => !v);
      } else if (e.key === "l" || e.key === "L") {
        setIsLaser((v) => {
          const next = !v;
          if (next) sound.playLaserBlip();
          else sound.playClick(0.8);
          return next;
        });
      } else if (e.key === "m" || e.key === "M") {
        handleSoundToggle();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        triggerPet();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCodeModalOpen, soundEnabled]);

  return (
    <main className={`hero theme-${theme} ${ready ? "is-ready" : ""}`}>
      {/* Background Lighting & Grid Ambience */}
      <div className="ambient-glow" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      {/* Cat Canvas Stage */}
      <div className="stage">
        <HeadTracker
          debug={debug}
          mood={mood}
          isLaser={isLaser}
          onProgress={setProgress}
          onReady={() => setReady(true)}
          onEyeContactChange={setIsEyeContact}
          onPet={(x, y) => triggerPet(x, y)}
        />
      </div>

      {/* Floating Heart & Reaction Particles */}
      <HeartParticles hearts={hearts} />

      {/* Eye Contact Purr Banner */}
      <div className={`eye-contact-pill ${isEyeContact ? "is-active" : ""}`} aria-live="polite">
        <span className="eye-pulse" />
        <span className="font-medium">Direct Eye Contact · Purring softly</span>
        <span className="text-xs opacity-75">({soundEnabled ? "Audio On" : "Muted"})</span>
      </div>

      {/* Top Navigation Bar */}
      <header className="nav-bar reveal" style={d("0.1s")}>
        {/* Logo / Badge */}
        <div className="nav-left">
          <div className="logo-group">
            <span className="logo-badge">MOCHI</span>
            <span className="logo-sub">3D Cat Template</span>
          </div>
          <div className="status-pill hidden md:inline-flex">
            <span className="status-dot animate-pulse" />
            <span>60 FPS TRACKING</span>
          </div>
        </div>

        {/* Use-Case Persona Switcher */}
        <nav className="nav-pill" aria-label="Template Presets">
          <button
            onClick={() => {
              sound.playClick();
              setUseCase("showcase");
            }}
            className={`preset-btn ${useCase === "showcase" ? "is-active" : ""}`}
            title="Component Showcase Preview"
            aria-pressed={useCase === "showcase"}
            data-hover
          >
            Showcase
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setUseCase("saas");
            }}
            className={`preset-btn ${useCase === "saas" ? "is-active" : ""}`}
            title="SaaS Hero Landing Page Preset"
            aria-pressed={useCase === "saas"}
            data-hover
          >
            SaaS Hero
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setUseCase("portfolio");
            }}
            className={`preset-btn ${useCase === "portfolio" ? "is-active" : ""}`}
            title="Creative Portfolio Preset"
            aria-pressed={useCase === "portfolio"}
            data-hover
          >
            Portfolio
          </button>
        </nav>

        {/* Right CTA */}
        <div className="nav-right">
          <button
            onClick={() => {
              sound.playClick(1.2);
              setIsCodeModalOpen(true);
            }}
            className="btn btn-sm btn-accent"
            data-magnetic
            title="Copy Code for 21st.dev"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Get Component</span>
          </button>
        </div>
      </header>

      {/* Hero Content Overlay based on current Use-Case */}
      <section className="intro">
        {useCase === "showcase" && (
          <>
            <div className="badge-pill reveal" style={d("0.25s")}>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive 3D Hero · 21st.dev Template</span>
            </div>

            <h1 className="hero-title reveal" style={d("0.38s")}>
              Meet <span className="title-gradient">Mochi</span>.
              <span className="block text-2xl md:text-3xl font-medium tracking-tight text-white/90 mt-1">
                The 3D cat with actual attitude.
              </span>
            </h1>

            <p className="hero-desc reveal" style={d("0.5s")}>
              A buttery 60 FPS interactive hero component. 64 pre-rendered smooth
              angles, zero Three.js bundle weight, procedural Web Audio purrs, and
              lifelike eye contact.
            </p>

            <div className="ctas reveal" style={d("0.65s")}>
              <span className="mag" data-magnetic>
                <button
                  className="btn btn-solid"
                  onClick={() => {
                    sound.playClick(1.2);
                    setIsCodeModalOpen(true);
                  }}
                  data-hover
                >
                  <Terminal className="w-4 h-4 text-zinc-900" />
                  <span>npx 21st add mochi-cat</span>
                  <span className="arrow">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </span>

              <span className="mag" data-magnetic>
                <button
                  className="btn btn-glass"
                  onClick={() => {
                    setIsLaser((v) => {
                      const next = !v;
                      if (next) sound.playLaserBlip();
                      else sound.playClick(0.8);
                      return next;
                    });
                  }}
                  aria-pressed={isLaser}
                  data-hover
                >
                  <Flame className={`w-4 h-4 ${isLaser ? "text-red-400" : "text-amber-300"}`} />
                  <span>{isLaser ? "Disable Laser" : "Try Laser Mode [L]"}</span>
                </button>
              </span>
            </div>

            {/* Spec Highlights */}
            <div className="spec-row reveal" style={d("0.8s")}>
              <div className="spec-item">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>&lt; 50 KB runtime</span>
              </div>
              <div className="spec-item">
                <Cpu className="w-3.5 h-3.5 text-amber-300" />
                <span>Zero GPU bloat</span>
              </div>
              <div className="spec-item">
                <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>Web Audio Purr</span>
              </div>
            </div>
          </>
        )}

        {useCase === "saas" && (
          <>
            <div className="badge-pill reveal" style={d("0.25s")}>
              <span className="badge-tag">AI Agent Mascot</span>
              <span>Available for Next.js & React</span>
            </div>

            <h1 className="hero-title reveal" style={d("0.38s")}>
              The AI companion that <span className="title-gradient">never sleeps</span>.
              <span className="block text-xl md:text-2xl font-light text-white/80 mt-1">
                (Well, maybe takes a short 16-hour nap).
              </span>
            </h1>

            <p className="hero-desc reveal" style={d("0.5s")}>
              Drop interactive personality into your SaaS landing page, documentation,
              or 404 screen. Delight users with fluid cursor-tracking physics.
            </p>

            <div className="ctas reveal" style={d("0.65s")}>
              <span className="mag" data-magnetic>
                <button
                  className="btn btn-solid"
                  onClick={() => setIsCodeModalOpen(true)}
                  data-hover
                >
                  <span>Start with Template</span>
                  <span className="arrow">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </span>

              <span className="mag" data-magnetic>
                <button
                  className="btn btn-glass"
                  onClick={() => triggerPet()}
                  data-hover
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Pet Mochi</span>
                </button>
              </span>
            </div>
          </>
        )}

        {useCase === "portfolio" && (
          <>
            <div className="badge-pill reveal" style={d("0.25s")}>
              <span className="status-dot" />
              <span>Full Stack Developer & Design Engineer</span>
            </div>

            <h1 className="hero-title reveal" style={d("0.38s")}>
              Hi, I'm <span className="title-gradient">Artash</span>.
              <span className="block text-2xl md:text-3xl font-medium text-white/90 mt-1">
                Crafting interfaces with motion & depth.
              </span>
            </h1>

            <p className="hero-desc reveal" style={d("0.5s")}>
              Building fast, thoughtful digital products from reactive front-ends
              to scalable cloud APIs. Pair-programming with Mochi since day one.
            </p>

            <div className="ctas reveal" style={d("0.65s")}>
              <span className="mag" data-magnetic>
                <a className="btn btn-solid" href="#projects" data-hover>
                  <span>View Projects</span>
                  <span className="arrow">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              </span>

              <span className="mag" data-magnetic>
                <a className="btn btn-glass" href="#contact" data-hover>
                  <span>Let's Connect</span>
                </a>
              </span>
            </div>
          </>
        )}
      </section>

      {/* Hint Micro-copy */}
      <footer className="footer-hint reveal" style={d("1.0s")}>
        <div className="hint-keys hidden lg:flex items-center gap-3">
          <span><kbd className="kbd">L</kbd> Laser</span>
          <span><kbd className="kbd">Space</kbd> Pet</span>
          <span><kbd className="kbd">M</kbd> Mute</span>
          <span><kbd className="kbd">D</kbd> Debug</span>
        </div>
        <p className="hint-text">
          Move your cursor · Hover face for eye contact · Click to pet
        </p>
      </footer>

      {/* Floating Bottom Control Dock */}
      <FloatingDock
        mood={mood}
        onMoodChange={setMood}
        isLaser={isLaser}
        onLaserToggle={() => {
          setIsLaser((v) => !v);
        }}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        theme={theme}
        onThemeChange={setTheme}
        onPet={() => triggerPet()}
        onOpenCode={() => setIsCodeModalOpen(true)}
      />

      {/* Top Loading Progress Line */}
      <div
        className="loader-bar"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />

      {/* Custom Spring/Laser Cursor */}
      <Cursor isLaser={isLaser} />

      {/* 21st.dev Code & API Modal */}
      <CopyCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </main>
  );
}