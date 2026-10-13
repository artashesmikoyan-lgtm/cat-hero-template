import { useRef, useState, type CSSProperties, type PointerEvent } from "react";

const cats = [
  { src: "/frames/frame-000.webp", name: "Up to something", note: "Ideas loading" },
  { src: "/frames/frame-006.webp", name: "Side-eye", note: "Watching the room" },
  { src: "/frames/frame-012.webp", name: "Soft focus", note: "Almost approachable" },
  { src: "/frames/frame-016.webp", name: "Locked in", note: "Nothing gets past him" },
  { src: "/frames/center.webp", name: "The boss", note: "Front and center" },
  { src: "/frames/frame-032.webp", name: "Plot twist", note: "New angle unlocked" },
  { src: "/frames/frame-040.webp", name: "Not impressed", note: "Still judging" },
  { src: "/frames/frame-052.webp", name: "Last look", note: "Already over it" },
  { src: "/frames/frame-060.webp", name: "Night watch", note: "Nothing escapes" },
];

const wrap = (value: number, length: number) => (value + length) % length;

export default function CatCarousel() {
  const [active, setActive] = useState(4);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);

  const move = (step: number) => setActive((current) => wrap(current + step, cats.length));
  const offsetFor = (index: number) => {
    let offset = index - active;
    if (offset > cats.length / 2) offset -= cats.length;
    if (offset < -cats.length / 2) offset += cats.length;
    return offset;
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    setDrag(event.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (Math.abs(drag) > 45) move(drag < 0 ? 1 : -1);
    startX.current = null;
    setDrag(0);
  };

  return (
    <section className="cat-gallery" id="work" aria-labelledby="cat-gallery-title" data-scroll-motion>
      <div className="gallery-heading">
        <p>Meet the character · 09 moods</p>
        <h2 id="cat-gallery-title">Every angle.<br /><em>Same attitude.</em></h2>
        <span>Drag the portraits or use the arrow keys.</span>
      </div>

      <div
        className="cat-rail"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Cat character portraits"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") move(-1);
          if (event.key === "ArrowRight") move(1);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="cat-rail-track" style={{ "--drag": `${drag}px` } as CSSProperties}>
          {cats.map((cat, index) => {
            const offset = offsetFor(index);
            return (
              <button
                className="cat-card"
                key={cat.name}
                style={{ "--offset": offset, "--distance": Math.abs(offset) } as CSSProperties}
                data-active={offset === 0 ? "true" : undefined}
                onClick={() => setActive(index)}
                aria-label={`Show ${cat.name}`}
                aria-current={offset === 0 ? "true" : undefined}
              >
                <img src={cat.src} alt="" draggable="false" />
                <span className="cat-index">0{index + 1}</span>
                <span className="cat-caption"><b>{cat.name}</b><small>{cat.note}</small></span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="gallery-controls">
        <button onClick={() => move(-1)} aria-label="Previous portrait">←</button>
        <span><b>0{active + 1}</b> / 0{cats.length}</span>
        <button onClick={() => move(1)} aria-label="Next portrait">→</button>
      </div>
    </section>
  );
}
