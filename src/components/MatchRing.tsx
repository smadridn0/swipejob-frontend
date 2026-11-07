import React from "react";

interface Props {
  value: number | null | undefined;
  size?: number;
}

export const MatchRing: React.FC<Props> = ({ value, size = 76 }) => {
  const numero = typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : null;

  const strokeWidth = 6;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = numero === null ? circumference : circumference - (numero / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#d1fae5" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7c3aed"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span style={{ position: "absolute", fontFamily: "var(--font-display)", fontWeight: "800", fontSize: size > 70 ? "16px" : "13px", color: "#5603ad" }}>
        {numero === null ? "—" : `${numero}%`}
      </span>
    </div>
  );
};