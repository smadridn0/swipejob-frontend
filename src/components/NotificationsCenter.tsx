import React from "react";

export interface NotificacionItem {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  enlace: string;
  fecha_creacion: string;
}

interface Props {
  notificaciones: NotificacionItem[];
  onMarcarLeida: (id: number) => void;
  onMarcarTodas: () => void;
  onNavegar: (seccion: any) => void;
}

export const NotificationsCenter: React.FC<Props> = ({
  notificaciones,
  onMarcarLeida,
  onMarcarTodas,
  onNavegar
}) => {
  return (
    <div style={{ maxWidth: "660px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "28px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)" }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", color: "var(--color-text-main)", fontWeight: "900" }}>Centro de Avisos</h2>
          <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Novedades en tus postulaciones y agenda</span>
        </div>
        {notificaciones.some(n => !n.leida) && (
          <button
            onClick={onMarcarTodas}
            style={{ padding: "8px 14px", borderRadius: "14px", backgroundColor: "var(--color-mint-soft)", color: "var(--color-mint-text)", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 10px", color: "var(--color-text-muted)" }}>
          <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🔔</span>
          No tienes notificaciones en este momento.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notificaciones.map(n => (
            <div
              key={n.id_notificacion}
              onClick={() => {
                if (!n.leida) onMarcarLeida(n.id_notificacion);
                if (n.enlace) onNavegar(n.enlace);
              }}
              style={{
                padding: "16px 20px",
                borderRadius: "20px",
                backgroundColor: n.leida ? "#ffffff" : "#faf5ff",
                border: n.leida ? "1px solid var(--color-border)" : "1px solid #d8b4fe",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  {!n.leida && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />}
                  <strong style={{ fontSize: "15px", color: "var(--color-text-main)" }}>{n.titulo}</strong>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)" }}>{n.mensaje}</p>
                <small style={{ fontSize: "11px", color: "#94a3b8" }}>{new Date(n.fecha_creacion).toLocaleString()}</small>
              </div>
              <span style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "800", marginLeft: "14px" }}>Ver →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};