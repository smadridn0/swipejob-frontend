import React, { useState } from "react";

export interface EntrevistaItem {
  id_entrevista: number;
  titulo: string;
  empresa_nombre?: string;
  candidato_nombre?: string;
  fecha_hora: string;
  duracion_minutos: number;
  modalidad: string;
  enlace_reunion?: string;
  ubicacion?: string;
  notas?: string;
  estado: string;
}

interface Props {
  entrevistas: EntrevistaItem[];
  onConfirmar?: (id: number) => void;
  esEmpresa?: boolean;
}

export const CalendarView: React.FC<Props> = ({ entrevistas, onConfirmar, esEmpresa = false }) => {
  const [modoVista, setModoVista] = useState<"mes" | "semana" | "lista">("lista");
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EntrevistaItem | null>(null);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "28px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)" }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px", marginBottom: "22px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", color: "var(--color-text-main)", fontWeight: "900" }}>Agenda de Entrevistas</h2>
          <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
            {esEmpresa ? "Reuniones técnicas programadas con candidatos" : "Encuentros programados por las empresas"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "16px" }}>
          {(["lista", "semana", "mes"] as const).map(vista => (
            <button
              key={vista}
              onClick={() => setModoVista(vista)}
              style={{
                padding: "6px 14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: modoVista === vista ? "var(--color-primary)" : "transparent",
                color: modoVista === vista ? "#ffffff" : "var(--color-text-muted)",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {vista}
            </button>
          ))}
        </div>
      </div>

      {modoVista === "lista" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {entrevistas.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "26px" }}>No hay entrevistas programadas en esta agenda.</p>
          ) : (
            entrevistas.map(e => (
              <div
                key={e.id_entrevista}
                onClick={() => setEventoSeleccionado(e)}
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "18px 22px",
                  borderRadius: "20px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px" }}>📅</span>
                    <div>
                      <strong style={{ fontSize: "16px", color: "var(--color-text-main)" }}>{e.titulo}</strong>
                      <span style={{ display: "block", fontSize: "13px", color: "var(--color-primary)", fontWeight: "800" }}>
                        {esEmpresa ? `👤 Candidato: ${e.candidato_nombre || "Candidato registrado"}` : `★ Empresa: ${e.empresa_nombre || "Empresa convocante"}`}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--color-text-muted)" }}>
                    🕒 {new Date(e.fecha_hora).toLocaleString()} · 📍 {e.modalidad}
                  </p>
                </div>
                <span style={{
                  backgroundColor: e.estado === "confirmada" ? "var(--color-mint-soft)" : "#fed7aa",
                  color: e.estado === "confirmada" ? "var(--color-mint-text)" : "#9a3412",
                  padding: "4px 12px",
                  borderRadius: "14px",
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase"
                }}>
                  {e.estado}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {modoVista === "semana" && (
        <div style={{ backgroundColor: "#f8fafc", padding: "22px", borderRadius: "20px", textAlign: "center", border: "1px solid var(--color-border)" }}>
          <h4 style={{ margin: "0 0 14px", color: "var(--color-text-main)" }}>Vista Semanal</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
            {["Lun", "Mar", "Mié", "Jue", "Vie"].map((dia, idx) => (
              <div key={dia} style={{ backgroundColor: "#ffffff", padding: "12px 6px", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                <strong style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{dia}</strong>
                <div style={{ marginTop: "10px", minHeight: "45px" }}>
                  {entrevistas.filter((_, i) => i % 5 === idx).map(e => (
                    <span key={e.id_entrevista} onClick={() => setEventoSeleccionado(e)} style={{ display: "block", backgroundColor: "#f3e8ff", color: "#6b21a8", fontSize: "11px", padding: "4px 6px", borderRadius: "8px", marginBottom: "4px", cursor: "pointer", fontWeight: "800" }}>
                      {e.titulo.substring(0, 14)}...
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modoVista === "mes" && (
        <div style={{ backgroundColor: "#f8fafc", padding: "22px", borderRadius: "20px", textAlign: "center", border: "1px solid var(--color-border)" }}>
          <h4 style={{ margin: "0 0 14px", color: "var(--color-text-main)" }}>Calendario del Mes</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => {
              const tieneCita = entrevistas.some(e => new Date(e.fecha_hora).getDate() === dia);
              return (
                <div
                  key={dia}
                  onClick={() => {
                    const cita = entrevistas.find(e => new Date(e.fecha_hora).getDate() === dia);
                    if (cita) setEventoSeleccionado(cita);
                  }}
                  style={{
                    padding: "10px 4px",
                    borderRadius: "12px",
                    backgroundColor: tieneCita ? "var(--color-primary)" : "#ffffff",
                    color: tieneCita ? "#ffffff" : "var(--color-text-main)",
                    fontWeight: tieneCita ? "800" : "500",
                    fontSize: "12px",
                    cursor: tieneCita ? "pointer" : "default",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  {dia}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {eventoSeleccionado && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,41,72,0.45)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 110 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "28px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--color-text-main)", fontWeight: "900" }}>Detalle de la Entrevista</h3>
              <button onClick={() => setEventoSeleccionado(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: "var(--color-text-muted)" }}>✕</button>
            </div>
            <div style={{ margin: "16px 0", fontSize: "13px", lineHeight: "1.7", color: "#334155" }}>
              <p style={{ margin: "4px 0" }}>• <strong>Reunión:</strong> {eventoSeleccionado.titulo}</p>
              {esEmpresa ? (
                <p style={{ margin: "4px 0" }}>• <strong>Candidato:</strong> {eventoSeleccionado.candidato_nombre || "Candidato registrado"}</p>
              ) : (
                <p style={{ margin: "4px 0" }}>• <strong>Empresa:</strong> {eventoSeleccionado.empresa_nombre || "Empresa convocante"}</p>
              )}
              <p style={{ margin: "4px 0" }}>• <strong>Fecha y Hora:</strong> {new Date(eventoSeleccionado.fecha_hora).toLocaleString()}</p>
              <p style={{ margin: "4px 0" }}>• <strong>Modalidad:</strong> {eventoSeleccionado.modalidad}</p>
              {eventoSeleccionado.enlace_reunion && (
                <p style={{ margin: "4px 0" }}>• <strong>Enlace:</strong> <a href={eventoSeleccionado.enlace_reunion} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", fontWeight: "800" }}>Abrir sala virtual</a></p>
              )}
              <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--color-mint-soft)", borderRadius: "10px", fontSize: "12px", fontWeight: "700", color: "var(--color-mint-text)" }}>
                Estado: {eventoSeleccionado.estado.toUpperCase()}
              </div>
            </div>
            {!esEmpresa && onConfirmar && eventoSeleccionado.estado !== "confirmada" && (
              <button
                onClick={() => {
                  onConfirmar(eventoSeleccionado.id_entrevista);
                  setEventoSeleccionado({ ...eventoSeleccionado, estado: "confirmada" });
                }}
                style={{ width: "100%", padding: "12px", borderRadius: "20px", backgroundColor: "var(--color-mint)", color: "white", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "13px" }}
              >
                Confirmar Asistencia
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};