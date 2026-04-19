import { useEffect, useRef, useState } from "react";

const TYPED_PHRASES = [
  "DevOps Engineer",
  "Cloud Architect",
  "Kubernetes Expert",
  "CI/CD Specialist",
  "Infrastructure Coder",
];

export default function HeroSection({ onLaunchTerminal }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const current = TYPED_PHRASES[phraseIndex];

    if (!deleting && displayed.length < current.length) {
      timeoutRef.current = setTimeout(
        () => setDisplayed(current.slice(0, displayed.length + 1)),
        80
      );
    } else if (!deleting && displayed.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeoutRef.current = setTimeout(
        () => setDisplayed(displayed.slice(0, -1)),
        40
      );
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPED_PHRASES.length);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, deleting, phraseIndex]);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Top badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-terminal-border bg-terminal-surface mb-8"
        style={{ animation: "fadeIn 0.8s ease forwards" }}
      >
        <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
        <span className="text-terminal-gray font-mono text-xs tracking-wide">
          Available for hire · Open to relocation
        </span>
      </div>

      {/* Main heading */}
      <div
        className="text-center mb-6"
        style={{ animation: "slideUp 0.7s ease 0.1s both" }}
      >
        <h1
          className="font-display font-semibold leading-tight mb-4"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#cdd9e5" }}
        >
          Hi, I'm{" "}
          <span
            className="text-terminal-green"
            style={{ textShadow: "0 0 30px rgba(126,231,135,0.3)" }}
          >
            Chetan
          </span>
        </h1>

        {/* Typewriter line */}
        <div className="flex items-center justify-center gap-1 h-10">
          <span
            className="font-mono text-terminal-cyan"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
          >
            {displayed}
          </span>
          <span
            className="font-mono text-terminal-cyan"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
              opacity: showCursor ? 1 : 0,
              transition: "opacity 0.1s",
            }}
          >
            _
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-terminal-gray text-center max-w-lg leading-relaxed mb-12 font-sans"
        style={{
          fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
          animation: "slideUp 0.7s ease 0.25s both",
        }}
      >
        1+ years shipping production infrastructure. I live in terminals,
        breathe Docker, and dream in YAML. Explore my work the way I do it —
        through a real shell.
      </p>

      {/* CTA buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 items-center mb-20"
        style={{ animation: "slideUp 0.7s ease 0.4s both" }}
      >
        <button
          onClick={onLaunchTerminal}
          className="group relative flex items-center gap-3 px-7 py-3.5 rounded-lg font-mono text-sm font-medium transition-all duration-300"
          style={{
            background: "rgba(126, 231, 135, 0.1)",
            border: "1px solid rgba(126, 231, 135, 0.4)",
            color: "#7ee787",
            boxShadow: "0 0 20px rgba(126, 231, 135, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(126, 231, 135, 0.18)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(126, 231, 135, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(126, 231, 135, 0.1)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(126, 231, 135, 0.1)";
          }}
        >
          <span className="text-lg">⌨</span>
          Launch Terminal
          <span className="text-terminal-gray group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        <a
          href="/api/terminal/resume"
          className="flex items-center gap-2 px-7 py-3.5 rounded-lg font-sans text-sm font-medium transition-all duration-200"
          style={{
            border: "1px solid #1e2630",
            color: "#8b949e",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#8b949e44";
            e.currentTarget.style.color = "#cdd9e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1e2630";
            e.currentTarget.style.color = "#8b949e";
          }}
        >
          <span>↓</span> Download Resume
        </a>
      </div>

      {/* Stats row */}
      <div
        className="flex flex-wrap gap-6 sm:gap-10 justify-center"
        style={{ animation: "slideUp 0.7s ease 0.55s both" }}
      >
        {[
          { label: "Years Experience", value: "1+" },
          { label: "Cloud Certs",      value: "1+"  },
          { label: "Projects Shipped", value: "3+"},
          { label: "Uptime Achieved",  value: "99.9%"},
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="font-display font-semibold text-terminal-green"
                 style={{ fontSize: "clamp(1.3rem,4vw,1.75rem)" }}>
              {value}
            </div>
            <div className="text-terminal-gray font-sans text-xs tracking-wide mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "fadeIn 1s ease 1.2s both" }}
      >
        <span className="text-terminal-gray font-mono text-xs">
          scroll to terminal
        </span>
        <div
          className="w-px h-8 bg-gradient-to-b from-transparent to-terminal-green"
          style={{ animation: "fadeIn 1s ease 1.5s both" }}
        />
      </div>
    </section>
  );
}
