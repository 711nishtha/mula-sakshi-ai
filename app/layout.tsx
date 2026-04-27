"use client";

import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cursorDot  = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ringX = 0, ringY = 0;
    let dotX  = 0, dotY  = 0;
    let raf: number;

    const onMouseMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
    };

    const animate = () => {
      // Dot follows instantly
      if (cursorDot.current) {
        cursorDot.current.style.left = `${dotX}px`;
        cursorDot.current.style.top  = `${dotY}px`;
      }
      // Ring lerps for smooth lag
      ringX += (dotX - ringX) * 0.14;
      ringY += (dotY - ringY) * 0.14;
      if (cursorRing.current) {
        cursorRing.current.style.left = `${ringX}px`;
        cursorRing.current.style.top  = `${ringY}px`;
      }
      raf = requestAnimationFrame(animate);
    };

    const onMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, a, [data-hover]")) {
        cursorRing.current?.classList.add("hover");
      }
    };
    const onMouseOut = () => cursorRing.current?.classList.remove("hover");

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Mūla Śākṣī — Zero-Trust AI Audit System</title>
        <meta name="description" content="AI-powered contradiction detection — cross-referencing citizen evidence against government records with legal-grade precision." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚖️</text></svg>" />
      </head>
      <body>
        {/* Grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />

        {/* Custom cursor */}
        <div ref={cursorDot}  className="cursor-dot"  aria-hidden="true" />
        <div ref={cursorRing} className="cursor-ring" aria-hidden="true" />

        {/* Grid background */}
        <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden="true" />

        {/* Ambient radial glows */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 15% 20%, rgba(108, 99, 255, 0.05) 0%, transparent 70%), " +
              "radial-gradient(ellipse 40% 30% at 85% 80%, rgba(212, 168, 83, 0.05) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <main className="relative z-10">{children}</main>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#12121f",
              color: "#F5F5F5",
              border: "1px solid #1e1e38",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#D4A853", secondary: "#07070f" } },
            error:   { iconTheme: { primary: "#e8445a", secondary: "#07070f" } },
          }}
        />
      </body>
    </html>
  );
}
