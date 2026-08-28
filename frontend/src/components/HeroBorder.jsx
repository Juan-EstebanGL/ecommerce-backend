import { useEffect, useState } from "react";
import { PulsingBorder } from "@paper-design/shaders-react";

const borderColors = ["#5eead4", "#38bdf8", "#a78bfa"];

function HeroBorder() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mq.matches);
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <PulsingBorder
      className="hm-hero__border"
      aria-hidden="true"
      colorBack="rgba(0, 0, 0, 0)"
      colors={borderColors}
      roundness={0.32}
      thickness={0.06}
      softness={0.6}
      intensity={0.16}
      bloom={0.28}
      spots={3}
      spotSize={0.5}
      pulse={0.4}
      smoke={0.18}
      smokeSize={0.55}
      speed={reducedMotion ? 0 : 1}
      maxPixelCount={800000}
      minPixelRatio={1}
    />
  );
}

export default HeroBorder;
