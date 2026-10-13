import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

const items = [
  { label: "Home", href: "#top", icon: "⌂" },
  { label: "Moods", href: "#work", icon: "◉", badge: "9" },
  { label: "Magic", href: "#magic", icon: "✦", badge: "4" },
  { label: "Cards", href: "#cards", icon: "▱", badge: "3" },
  { label: "Check-in", href: "#check-in", icon: "✓", badge: "4" },
  { label: "Effects", href: "#effects", icon: "⌁", badge: "3" },
  { label: "Treats", href: "#contact", icon: "♡" },
];

const goTo = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function FloatingDock() {
  const [compact, setCompact] = useState(false);
  const [launching, setLaunching] = useState("");
  const [pinned, setPinned] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ x: number; y: number; label: string; href: string } | null>(null);
  const dock = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120);
    const close = () => setMenu(null);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", close);
    };
  }, []);

  const magnify = (event: PointerEvent<HTMLElement>) => {
    dock.current?.querySelectorAll<HTMLElement>(".dock-item").forEach((item) => {
      const box = item.getBoundingClientRect();
      const distance = Math.abs(event.clientX - (box.left + box.width / 2));
      const influence = Math.max(0, 1 - distance / 120);
      item.style.setProperty("--dock-scale", `${1 + influence * 0.48}`);
      item.style.setProperty("--dock-lift", `${-influence * 10}px`);
    });
  };

  const reset = () => dock.current?.querySelectorAll<HTMLElement>(".dock-item").forEach((item) => {
    item.style.removeProperty("--dock-scale");
    item.style.removeProperty("--dock-lift");
  });

  const launch = (label: string, href: string) => {
    setLaunching(label);
    goTo(href);
    window.setTimeout(() => setLaunching(""), 650);
  };

  const openMenu = (event: MouseEvent, label: string, href: string) => {
    event.preventDefault();
    setMenu({ x: Math.max(8, Math.min(event.clientX, window.innerWidth - 190)), y: Math.max(8, Math.min(event.clientY + 8, window.innerHeight - 128)), label, href });
  };

  return (
    <>
      <nav
        ref={dock}
        className={`mochi-dock${compact ? " is-compact" : ""}`}
        aria-label="Explore Mochi"
        onPointerMove={magnify}
        onPointerLeave={reset}
      >
        <span className="dock-brand" aria-hidden="true">MOCHI</span>
        <div className="dock-items">
          {items.map((item) => (
            <a
              className={`dock-item${launching === item.label ? " is-launching" : ""}`}
              key={item.label}
              href={item.href}
              onClick={(event) => { event.preventDefault(); launch(item.label, item.href); }}
              onContextMenu={(event) => openMenu(event, item.label, item.href)}
              aria-label={`Go to ${item.label}`}
            >
              <span className="dock-icon" aria-hidden="true">{item.icon}</span>
              <span className="dock-label">{item.label}</span>
              {item.badge && <span className="dock-badge">{item.badge}</span>}
              {pinned.includes(item.label) && <span className="dock-pin" aria-hidden="true" />}
            </a>
          ))}
        </div>
        <span className="dock-status"><i /> ONLINE</span>
      </nav>
      {menu && (
        <div className="dock-menu" style={{ left: menu.x, top: menu.y }} onPointerDown={(event) => event.stopPropagation()}>
          <strong>{menu.label}</strong>
          <button onClick={() => { launch(menu.label, menu.href); setMenu(null); }}>Open section <span>↗</span></button>
          <button onClick={() => {
            setPinned((current) => current.includes(menu.label) ? current.filter((name) => name !== menu.label) : [...current, menu.label]);
            setMenu(null);
          }}>{pinned.includes(menu.label) ? "Unpin from dock" : "Pin to dock"} <span>⌘</span></button>
        </div>
      )}
    </>
  );
}
