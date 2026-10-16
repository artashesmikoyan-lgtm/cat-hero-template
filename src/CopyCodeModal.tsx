import { useState } from "react";
import { Check, Copy, X, Terminal, Code2, Sparkles, BookOpen } from "lucide-react";
import { sound } from "./sound";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const INSTALL_CMD = "npx 21st add mochi-cat";

const COMPONENT_SNIPPET = `import { useState, useRef, useEffect } from "react";

// Mochi — Interactive 3D Cat Component
// https://21st.dev/mochi-cat
export interface MochiCatProps {
  mood?: "grumpy" | "curious" | "playful" | "sleepy";
  isLaser?: boolean;
  soundEnabled?: boolean;
  className?: string;
  onEyeContact?: (isContact: boolean) => void;
  onPet?: () => void;
}

export function MochiCat({
  mood = "grumpy",
  isLaser = false,
  soundEnabled = true,
  className = "",
  onEyeContact,
  onPet,
}: MochiCatProps) {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-performance 60fps canvas engine
  // Tracks pointer with 64 pre-rendered smooth 360° frames
  return (
    <div className={\`relative w-full h-full overflow-hidden select-none \${className}\`}>
      <canvas
        ref={canvasRef}
        onClick={onPet}
        className="w-full h-full object-cover cursor-pointer"
        aria-label="Interactive 3D Mochi Cat"
      />
    </div>
  );
}`;

const PROPS_DATA = [
  { name: "mood", type: '"grumpy" | "curious" | "playful" | "sleepy"', default: '"grumpy"', desc: "Adjusts tracking responsiveness and personality." },
  { name: "isLaser", type: "boolean", default: "false", desc: "Activates playful high-speed laser chasing mode." },
  { name: "soundEnabled", type: "boolean", default: "true", desc: "Enables procedural Web Audio purrs, meows, and chimes." },
  { name: "onEyeContact", type: "(isContact: boolean) => void", default: "undefined", desc: "Fires when user cursor enters Mochi's direct gaze zone." },
  { name: "onPet", type: "() => void", default: "undefined", desc: "Fires when user clicks/taps Mochi's face." },
];

export default function CopyCodeModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<"cli" | "code" | "props">("cli");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    sound.playClick(1.2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-badge">
              <Sparkles className="w-3.5 h-3.5" />
              <span>21st.dev Component</span>
            </div>
            <h3 className="modal-title">Use Mochi in Your Project</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick(0.9);
              onClose();
            }}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button
            onClick={() => {
              sound.playClick();
              setTab("cli");
            }}
            className={`modal-tab ${tab === "cli" ? "is-active" : ""}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CLI Install</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab("code");
            }}
            className={`modal-tab ${tab === "code" ? "is-active" : ""}`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>React Code</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab("props");
            }}
            className={`modal-tab ${tab === "props" ? "is-active" : ""}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>API & Props</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {tab === "cli" && (
            <div className="tab-pane">
              <p className="tab-desc">
                Install directly using the 21st.dev CLI or shadcn registry into your Next.js / Vite project:
              </p>
              <div className="code-box">
                <code>{INSTALL_CMD}</code>
                <button
                  onClick={() => handleCopy(INSTALL_CMD)}
                  className="copy-btn"
                  title="Copy command"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-dot" />
                  <div>
                    <strong className="block text-white text-xs font-semibold">Zero Three.js Overhead</strong>
                    <span className="text-white/60 text-xs">Lightweight frame-stepping canvas (~48KB runtime)</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-dot" />
                  <div>
                    <strong className="block text-white text-xs font-semibold">Native Audio Synthesis</strong>
                    <span className="text-white/60 text-xs">Web Audio API purrs & meows with 0 external sound files</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-dot" />
                  <div>
                    <strong className="block text-white text-xs font-semibold">Fluid 60 FPS Tracking</strong>
                    <span className="text-white/60 text-xs">Retina-ready 2x DPR with smooth spring damping</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "code" && (
            <div className="tab-pane">
              <div className="code-box-header">
                <span className="text-xs text-white/60 font-mono">components/MochiCat.tsx</span>
                <button
                  onClick={() => handleCopy(COMPONENT_SNIPPET)}
                  className="copy-btn"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="code-pre">
                <code>{COMPONENT_SNIPPET}</code>
              </pre>
            </div>
          )}

          {tab === "props" && (
            <div className="tab-pane">
              <table className="props-table">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPS_DATA.map((p) => (
                    <tr key={p.name}>
                      <td className="font-mono text-amber-200">{p.name}</td>
                      <td className="font-mono text-white/70">{p.type}</td>
                      <td className="font-mono text-white/50">{p.default}</td>
                      <td className="text-white/80">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
