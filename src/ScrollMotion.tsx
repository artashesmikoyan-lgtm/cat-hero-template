import { useEffect } from "react";

export default function ScrollMotion() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-motion]"));
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-inview");
      });
    }, { threshold: .12, rootMargin: "0px 0px -8%" });

    sections.forEach((section) => {
      section.classList.add("scroll-motion");
      reveal.observe(section);
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
        section.style.setProperty("--scroll-progress", progress.toFixed(3));
        section.style.setProperty("--scroll-shift", `${(progress - .5) * 60}px`);
        section.style.setProperty("--scroll-drift", `${(progress - .5) * -18}px`);
      });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      reveal.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
