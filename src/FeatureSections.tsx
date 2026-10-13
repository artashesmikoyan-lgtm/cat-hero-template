import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import CatCheckIn from "./CatCheckIn";

const bento = [
  { title: "Night vision", copy: "Sees every snack after dark.", art: "eyes", stat: "02:14" },
  { title: "Soft landing", copy: "Gravity is more of a suggestion.", art: "orbit", stat: "9 / 9" },
  { title: "Purr engine", copy: "A tiny motor tuned to calm.", art: "wave", stat: "44 Hz" },
  { title: "Mood radar", copy: "Reads the room. Judges it gently.", art: "radar", stat: "LIVE" },
];

function MagicBento() {
  const moveLight = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  };
  const wave = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ring = document.createElement("i");
    ring.className = "bento-wave";
    ring.style.left = `${event.clientX - box.left}px`;
    ring.style.top = `${event.clientY - box.top}px`;
    event.currentTarget.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove());
  };
  return (
    <section className="feature-shell magic-section" id="magic" data-scroll-motion>
      <header className="feature-heading"><span>01 / Magic Bento</span><h2>Built different.<br /><em>Soft by default.</em></h2><p>Move across the cards. Their edges catch your light; tap one and it answers.</p></header>
      <div className="magic-grid">
        {bento.map((card, index) => (
          <article className={`magic-card magic-${card.art}`} key={card.title} onPointerMove={moveLight} onPointerDown={wave}>
            <div className="card-copy"><span>0{index + 1}</span><h3>{card.title}</h3><p>{card.copy}</p></div>
            <b>{card.stat}</b><div className="live-art" aria-hidden="true"><i /><i /><i /></div>
          </article>
        ))}
      </div>
    </section>
  );
}

const stack = [
  { name: "Midnight Mochi", note: "Unbothered since 2021", src: "/frames/frame-010.webp" },
  { name: "Golden Hour", note: "Light collector", src: "/frames/center.webp" },
  { name: "Side Quest", note: "Probably snack related", src: "/frames/frame-041.webp" },
];

function CardSwap() {
  const [front, setFront] = useState(0);
  const start = useRef<number | null>(null);
  const next = () => setFront((value) => (value + 1) % stack.length);
  useEffect(() => { const timer = window.setInterval(next, 3600); return () => window.clearInterval(timer); }, []);
  return (
    <section className="swap-section" id="cards" data-scroll-motion>
      <div className="swap-copy"><span>02 / Card Swap</span><h2>Fling the front.<br />Meet another <em>Mochi.</em></h2><p>The stack reshuffles itself, or you can grab the top card and send it flying.</p><button onClick={next}>Swap the stack <span>→</span></button></div>
      <div className="swap-stage" onPointerDown={(event) => { start.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={(event) => { if (start.current !== null && Math.abs(event.clientX - start.current) > 45) next(); start.current = null; }}>
        {stack.map((card, index) => {
          const position = (index - front + stack.length) % stack.length;
          return <article className={`swap-card swap-pos-${position}`} key={card.name} style={{ "--card-tone": `${210 + index * 22}` } as CSSProperties}>
            <img src={card.src} alt="" draggable="false" /><span>MOCHI FILE · 0{index + 1}</span><div><h3>{card.name}</h3><p>{card.note}</p></div>
          </article>;
        })}
      </div>
    </section>
  );
}

function FoldText() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: .3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} className={`fold-section${visible ? " is-open" : ""}`} data-scroll-motion>
    <span className="effect-label">03 / Fold Text</span>
    <h2><span style={{ "--fold": 0 } as CSSProperties}>COOL CATS</span><span style={{ "--fold": 1 } as CSSProperties}>DON’T CHASE</span><span style={{ "--fold": 2 } as CSSProperties}>ATTENTION.</span></h2>
    <p>They let it find them.</p>
  </section>;
}

function TechText() {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--tx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--ty", `${event.clientY - box.top}px`);
  };
  return <section className="tech-section" data-scroll-motion><span className="effect-label">04 / Tech Text</span><div className="tech-word" onPointerMove={move}>
    <span>MOCHI</span>
    <svg viewBox="0 0 1000 260" role="img" aria-label="Mochi"><text x="500" y="210" textAnchor="middle">MOCHI</text></svg>
  </div><p>Move your light through the wordmark.</p></section>;
}

function LaserFlow() {
  const move = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--lx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--ly", `${event.clientY - box.top}px`);
  };
  return <section className="laser-section" onPointerMove={move} data-scroll-motion>
    <span className="effect-label">05 / Laser Flow</span><div className="laser-beam" aria-hidden="true" />
    <div className="laser-panel"><small>ACTIVE SIGNAL</small><h2>Follow the glow.</h2><p>Mochi’s light spills over every edge it touches.</p><a href="#contact">Enter his orbit <span>↗</span></a></div>
    <div className="laser-coordinate"><span>BEAM / 05</span><b>NOCTURNAL<br />FREQUENCY</b></div>
  </section>;
}

export default function FeatureSections() {
  return <><MagicBento /><CardSwap /><CatCheckIn /><div id="effects" className="effects-suite"><FoldText /><TechText /><LaserFlow /></div><footer id="contact" className="contact-section" data-scroll-motion><span>Need more Mochi?</span><h2>Let’s make<br /><em>something cool.</em></h2><a href="mailto:hello@mochi.cat">hello@mochi.cat <span>↗</span></a><p>© 2026 MOCHI STUDIO · NINE LIVES, ONE GOOD WEBSITE</p></footer></>;
}
