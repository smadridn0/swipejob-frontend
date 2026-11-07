import React, { useState } from "react";
import { MatchRing } from "./MatchRing";

export interface VacanteStudio {
  id_vacante: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  salario: string;
  modalidad: string;
  ubicacion: string;
  nombre_empresa: string;
  afinidad_estimada?: number;
}

interface Props {
  vacante: VacanteStudio;
  onSwipe: (decision: "like" | "dislike") => void;
  onVerDetalles: () => void;
}

export const SwipeCardStudio: React.FC<Props> = ({ vacante, onSwipe, onVerDetalles }) => {
  const [dragX, setDragX] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [startX, setStartX] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setStartX(e.clientX);
    setArrastrando(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!arrastrando) return;
    setDragX(e.clientX - startX);
  };

  const handlePointerUp = () => {
    if (!arrastrando) return;
    setArrastrando(false);
    if (dragX > 100) onSwipe("like");
    else if (dragX < -100) onSwipe("dislike");
    setDragX(0);
  };

  const rotation = dragX / 16;
  const stampLikeOpacity = Math.min(1, Math.max(0, dragX / 60));
  const stampDislikeOpacity = Math.min(1, Math.max(0, -dragX / 60));

  const porcentajeMostrar = typeof vacante.afinidad_estimada === "number" ? vacante.afinidad_estimada : 0;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "520px",
        margin: "0 auto",
        borderRadius: "32px",
        backgroundColor: "#ffffff",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: arrastrando ? "none" : "transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
        cursor: arrastrando ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          border: "4px solid #00c274",
          color: "#00c274",
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "6px 14px",
          borderRadius: "14px",
          fontFamily: "var(--font-display)",
          fontWeight: "900",
          fontSize: "20px",
          transform: "rotate(-12deg)",
          opacity: stampLikeOpacity,
          pointerEvents: "none",
          zIndex: 10
        }}
      >
        APLICAR
      </div>

      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          border: "4px solid #ef4444",
          color: "#ef4444",
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "6px 14px",
          borderRadius: "14px",
          fontFamily: "var(--font-display)",
          fontWeight: "900",
          fontSize: "20px",
          transform: "rotate(12deg)",
          opacity: stampDislikeOpacity,
          pointerEvents: "none",
          zIndex: 10
        }}
      >
        DESCARTAR
      </div>

      <div style={{ background: "linear-gradient(135deg, #5603ad 0%, #3b0764 100%)", padding: "26px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.85 }}>
              Vacante Destacada
            </span>
            <h2 style={{ margin: "4px 0", fontSize: "22px", fontWeight: "900", lineHeight: "1.2" }}>{vacante.titulo}</h2>
            <p style={{ margin: 0, fontSize: "15px", opacity: 0.9 }}>★ {vacante.nombre_empresa}</p>
          </div>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "50%", padding: "4px", boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}>
            <MatchRing value={porcentajeMostrar} size={72} />
          </div>
        </div>
      </div>

      <div style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ backgroundColor: "var(--color-mint-soft)", color: "var(--color-mint-text)", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
            📍 {vacante.ubicacion || "Colombia"} · {vacante.modalidad}
          </span>
          <span style={{ backgroundColor: "var(--color-mint-soft)", color: "var(--color-mint-text)", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
            💰 {vacante.salario}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: "14px", color: "var(--color-text-muted)", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {vacante.descripcion}
        </p>

        <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "16px", border: "1px solid var(--color-border)", fontSize: "13px" }}>
          <strong style={{ color: "var(--color-primary)" }}>Requisitos Clave: </strong>
          <span style={{ color: "var(--color-text-main)" }}>{vacante.requisitos}</span>
        </div>

        <button
          onClick={onVerDetalles}
          style={{
            padding: "12px",
            borderRadius: "16px",
            backgroundColor: "var(--color-mint-soft)",
            color: "var(--color-mint-text)",
            border: "none",
            fontWeight: "800",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          Ver Especificaciones Completas
        </button>

        <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
          <button
            onClick={() => onSwipe("dislike")}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: "20px",
              border: "1.5px solid #ef4444",
              backgroundColor: "#ffffff",
              color: "#ef4444",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            ✕ Descartar
          </button>
          <button
            onClick={() => onSwipe("like")}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: "var(--color-primary)",
              color: "white",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(86, 3, 173, 0.28)"
            }}
          >
            ✓ Aplicar (Swipe Like)
          </button>
        </div>
      </div>
    </div>
  );
};