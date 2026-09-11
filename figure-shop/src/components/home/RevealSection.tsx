"use client";

import { useEffect, useRef } from "react";

export function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches || !("IntersectionObserver" in window)) return;
    // Content stays visible without JavaScript; only prepare below-fold sections.
    const tiles = element.querySelectorAll<HTMLElement>(".product-card");
    tiles.forEach((tile, index) => tile.style.setProperty("--reveal-delay", `${(index % 5) * 65}ms`));
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.dataset.reveal = "visible";
      return () => {
        delete element.dataset.reveal;
        tiles.forEach(tile => tile.style.removeProperty("--reveal-delay"));
      };
    }
    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.reveal = "visible";
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    const show = () => { if (preference.matches) { delete element.dataset.reveal; observer.disconnect(); } };
    observer.observe(element);
    preference.addEventListener("change", show);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", show);
      delete element.dataset.reveal;
      tiles.forEach(tile => tile.style.removeProperty("--reveal-delay"));
    };
  }, []);

  return <section ref={ref} className={`reveal-section ${className}`}>{children}</section>;
}
