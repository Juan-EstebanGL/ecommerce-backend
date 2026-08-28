import { useEffect, useRef } from "react";

function buildAccentSet(accent) {
  const words = Array.isArray(accent) ? accent : accent ? [accent] : [];
  return new Set(words.map((word) => word.toLowerCase()));
}

function RollingLetters({
  text = "",
  accent = "",
  tag = "h1",
  className = "",
  startFrom = "bottom",
  staggerFrom = "center",
  duration = 0.6,
  delay = 0,
  staggerChildren = 0.035,
  ease = "power4.out",
  ...rest
}) {
  const containerRef = useRef(null);
  const Tag = tag;

  const accentSet = buildAccentSet(accent);
  const words = text.split(" ");

  useEffect(() => {
    const container = containerRef.current;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!container || prefersReduced) return;

    let cancelled = false;
    let gsapLib = null;

    import("gsap").then((mod) => {
      if (cancelled) return;
      gsapLib = mod.default || mod;

      const chars = container.querySelectorAll(".rl-char");
      gsapLib.killTweensOf(chars);
      gsapLib.set(chars, { clearProps: "transform" });
      gsapLib.from(chars, {
        yPercent: startFrom === "top" ? -120 : 120,
        duration,
        delay,
        stagger: { each: staggerChildren, from: staggerFrom },
        ease,
      });
    });

    return () => {
      cancelled = true;
      if (gsapLib && container) {
        gsapLib.killTweensOf(container.querySelectorAll(".rl-char"));
      }
    };
  }, [text, accent, startFrom, staggerFrom, duration, delay, staggerChildren, ease]);

  return (
    <Tag ref={containerRef} className={className} {...rest}>
      <span className="rl-visually-hidden">{text}</span>
      <span className="rl-line" aria-hidden="true">
        {words.map((word, wordIndex) => {
          const isAccent = accentSet.has(word.toLowerCase());
          const chars = word.split("").map((char, charIndex) => (
            <span key={charIndex} className="rl-char-viewport">
              <span
                className={
                  isAccent ? "rl-char rl-char--accent" : "rl-char"
                }
              >
                {char}
              </span>
            </span>
          ));
          return [
            <span
              key={`w${wordIndex}`}
              className={isAccent ? "rl-word rl-word--accent" : "rl-word"}
            >
              {chars}
            </span>,
            wordIndex < words.length - 1 ? " " : null,
          ];
        })}
      </span>
    </Tag>
  );
}

export default RollingLetters;
