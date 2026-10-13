import { useState, type CSSProperties } from "react";
import HeadTracker from "./HeadTracker";
import Cursor from "./Cursor";
import CatCarousel from "./CatCarousel";
import FloatingDock from "./FloatingDock";
import FeatureSections from "./FeatureSections";
import ScrollMotion from "./ScrollMotion";

// ——— content (edit here) ———
const NAME = "Mochi";
const BIO = "A tiny storm cloud in a hoodie. Cool under pressure, suspicious of everything, and always ready to steal the spotlight.";
const PRIMARY_URL = "#work";
const CONTACT_URL = "#contact";

const d = (s: string) => ({ "--d": s } as CSSProperties);

export default function App() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  return (
    <main>
      <FloatingDock />
      <section className={`hero${ready ? " is-ready" : ""}`} id="top">
        <div className="stage">
          <HeadTracker onProgress={setProgress} onReady={() => setReady(true)} />
        </div>

        <section className="intro" id="about">
          <p className="hello reveal" style={d("0.3s")}>Meet</p>
          <h1 className="name reveal" style={d("0.42s")}>{NAME}</h1>
          <p className="bio reveal" style={d("0.58s")}>{BIO}</p>
          <div className="ctas reveal" style={d("0.72s")}>
            <span className="mag" data-magnetic>
              <a className="btn btn-solid" href={PRIMARY_URL}>
                Meet every mood
                <span className="arrow">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 9L9 3M9 3H4.2M9 3V7.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </span>
            <span className="mag" data-magnetic>
              <a className="btn btn-glass" href={CONTACT_URL}>Join Mochi’s orbit</a>
            </span>
          </div>
        </section>

        <p className="hint reveal" style={d("1s")}>Move your light, Mochi follows · Hover his face for eye contact</p>

        <div className="loader" style={{ transform: `scaleX(${progress})` }} />
      </section>
      <CatCarousel />
      <FeatureSections />
      <ScrollMotion />
      <Cursor />
    </main>
  );
}
