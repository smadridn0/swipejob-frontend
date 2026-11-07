import React, { useState, useEffect, useRef } from "react";
import { SwipeCardStudio, type VacanteStudio } from "./components/SwipeCardStudio";
import { NotificationsCenter, type NotificacionItem } from "./components/NotificationsCenter";
import { CalendarView, type EntrevistaItem } from "./components/CalendarView";

const API_URL = import.meta.env.VITE_API_URL || "https://swipejob-backend.onrender.com";

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: "candidato" | "empresa";
  id_candidato?: number;
  id_empresa?: number;
  foto_perfil?: string;
}

interface PerfilCandidato {
  nombre: string;
  correo: string;
  telefono: string;
  estudios: string;
  proyeccion: string;
  perfil_profesional: string;
  cv_nombre?: string;
  foto_perfil?: string;
}

interface PostulacionHistorial {
  id_postulacion: number;
  titulo: string;
  empresa: string;
  estado: string;
  afinidad: number;
  fecha_postulacion: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [vistaAuth, setVistaAuth] = useState<"login" | "registro">("login");
  const [seccionActiva, setSeccionActiva] = useState<
    "inicio" | "match" | "agenda" | "notificaciones" | "perfil" | "portafolio" | "intereses" | "empresa_ofertas" | "empresa_agenda"
  >("inicio");

  // Barra lateral retráctil
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const sesionInicializadaRef = useRef<number | null>(null);

  // Autenticación
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rolRegistro, setRolRegistro] = useState<"candidato" | "empresa">("candidato");

  // Perfil Candidato
  const [perfil, setPerfil] = useState<PerfilCandidato>({
    nombre: "",
    correo: "",
    telefono: "",
    estudios: "Estudiante de Ingeniería de Sistemas",
    proyeccion: "Desarrollador enfocado en soluciones cloud y backend.",
    perfil_profesional: ""
  });
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [archivoCV, setArchivoCV] = useState<File | null>(null);
  const [mensajeCV, setMensajeCV] = useState("");

  // Feed y Vacantes
  const [vacantes, setVacantes] = useState<VacanteStudio[]>([]);
  const [indiceVacante, setIndiceVacante] = useState(0);
  const [modalEspecificaciones, setModalEspecificaciones] = useState<any | null>(null);
  const [requiereCV, setRequiereCV] = useState(false);

  // Historial
  const [historial, setHistorial] = useState<PostulacionHistorial[]>([]);

  // Preferencias Laborales
  const [cargoInteres, setCargoInteres] = useState("Desarrollador Backend");
  const [ubicacionInteres, setUbicacionInteres] = useState("Medellín");
  const [empresaInteres, setEmpresaInteres] = useState("");
  const [rangoSalarial, setRangoSalarial] = useState("5.000.000 - 8.000.000 COP");
  const [modalidadInteres, setModalidadInteres] = useState("Remoto");
  const [tipoContrato, setTipoContrato] = useState("Término indefinido");

  // Notificaciones y Agenda
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [entrevistas, setEntrevistas] = useState<EntrevistaItem[]>([]);

  // Ofertas Empresa
  const [tituloVac, setTituloVac] = useState("");
  const [descVac, setDescVac] = useState("");
  const [reqVac, setReqVac] = useState("");
  const [salarioVac, setSalarioVac] = useState("");
  const [modalidadVac, setModalidadVac] = useState("Remoto");
  const [tipoContratoVac, setTipoContratoVac] = useState("Término indefinido");
  const [postulacionesEmpresa, setPostulacionesEmpresa] = useState<any[]>([]);

  // Modal Agendar Cita
  const [modalAgendar, setModalAgendar] = useState<{ id_candidato: number; id_postulacion: number; candidato_nombre: string } | null>(null);
  const [fechaHoraCita, setFechaHoraCita] = useState("");
  const [enlaceCita, setEnlaceCita] = useState("https://meet.google.com/swj-demo");

  useEffect(() => {
    if (!usuario) {
      sesionInicializadaRef.current = null;
      return;
    }

    const esPrimeraVez = sesionInicializadaRef.current !== usuario.id_usuario;

    if (usuario.rol === "candidato" && usuario.id_candidato) {
      if (esPrimeraVez) {
        setSeccionActiva("inicio");
        sesionInicializadaRef.current = usuario.id_usuario;
      }
      cargarPerfil(usuario.id_candidato);
      cargarFeed(usuario.id_candidato);
      cargarHistorial(usuario.id_candidato);
      cargarNotificaciones(usuario.id_usuario);
      cargarEntrevistas(usuario.id_candidato);
    } else if (usuario.rol === "empresa" && usuario.id_empresa) {
      if (esPrimeraVez) {
        setSeccionActiva("empresa_ofertas");
        sesionInicializadaRef.current = usuario.id_usuario;
      }
      cargarPostulacionesEmpresa(usuario.id_empresa);
      cargarEntrevistasEmpresa(usuario.id_empresa);
    }
  }, [usuario?.id_usuario, usuario?.id_candidato, usuario?.id_empresa, usuario?.rol]);

  const cargarPerfil = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/candidato/perfil/${id}`);
      const data = await res.json();
      if (data) {
        setPerfil(data);
        if (data.foto_perfil) {
          setUsuario(prev => (prev && prev.foto_perfil !== data.foto_perfil ? { ...prev, foto_perfil: data.foto_perfil } : prev));
        }
      }
    } catch {}
  };

  const cargarFeed = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/vacantes/feed/${id}`);
      const data = await res.json();
      if (data.requiere_cv) {
        setRequiereCV(true);
        setVacantes([]);
      } else {
        setRequiereCV(false);
        setVacantes(data.vacantes || []);
        setIndiceVacante(0);
      }
    } catch (err) {
      console.error("Error cargando ofertas:", err);
    }
  };

  const cargarHistorial = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/candidato/postulaciones/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) setHistorial(data);
    } catch {}
  };

  const cargarNotificaciones = async (id_usuario: number) => {
    try {
      const res = await fetch(`${API_URL}/api/candidato/notificaciones/${id_usuario}`);
      const data = await res.json();
      setNotificaciones(data || []);
    } catch {}
  };

  const cargarEntrevistas = async (id_candidato: number) => {
    try {
      const res = await fetch(`${API_URL}/api/candidato/entrevistas/${id_candidato}`);
      const data = await res.json();
      setEntrevistas(data || []);
    } catch {}
  };

  const cargarEntrevistasEmpresa = async (id_empresa: number) => {
    try {
      const res = await fetch(`${API_URL}/api/empresa/entrevistas/${id_empresa}`);
      const data = await res.json();
      if (Array.isArray(data)) setEntrevistas(data);
    } catch {}
  };

  const cargarPostulacionesEmpresa = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/empresa/postulaciones/${id}`);
      const data = await res.json();
      setPostulacionesEmpresa(data || []);
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsuario(data);
    } catch {
      alert("Credenciales incorrectas. Verifica tu correo y contraseña.");
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, rol: rolRegistro, telefono })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error en el registro");
      }
      const data = await res.json();
      alert("Cuenta creada con éxito.");
      setUsuario(data);
    } catch (err: any) {
      alert(err.message || "Error al registrar cuenta.");
    }
  };

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !usuario) return;
    const archivo = e.target.files[0];

    const formData = new FormData();
    formData.append("id_usuario", usuario.id_usuario.toString());
    formData.append("foto", archivo);

    try {
      const res = await fetch(`${API_URL}/api/usuario/foto`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsuario(prev => (prev ? { ...prev, foto_perfil: data.foto_perfil } : null));
      setPerfil(prev => ({ ...prev, foto_perfil: data.foto_perfil }));
      alert("Foto de perfil actualizada correctamente.");
    } catch {
      alert("Error al cargar imagen. Intenta con una imagen JPG o PNG de menor tamaño.");
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id_candidato) return;
    try {
      await fetch(`${API_URL}/api/candidato/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_candidato: usuario.id_candidato,
          nombre: perfil.nombre,
          telefono: perfil.telefono,
          estudios: perfil.estudios,
          proyeccion: perfil.proyeccion,
          perfil_profesional: perfil.perfil_profesional
        })
      });
      alert("Perfil actualizado correctamente.");
      setEditandoPerfil(false);
      cargarPerfil(usuario.id_candidato);
    } catch {
      alert("Error al guardar perfil.");
    }
  };

  const handleSubirCV = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivoCV) {
      alert("Por favor selecciona un archivo PDF o TXT antes de presionar Guardar Archivo.");
      return;
    }

    if (!usuario || !usuario.id_candidato) {
      alert("Error de sesión: No se identificó el candidato. Cierra sesión y vuelve a entrar.");
      return;
    }

    const formData = new FormData();
    formData.append("id_candidato", usuario.id_candidato.toString());
    formData.append("archivo", archivoCV);

    try {
      const res = await fetch(`${API_URL}/api/candidato/cv`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Error en servidor (${res.status})`);
      }

      const data = await res.json();
      alert(data.mensaje || "¡Archivo cargado exitosamente!");
      setMensajeCV(data.mensaje);
      cargarPerfil(usuario.id_candidato);
      cargarFeed(usuario.id_candidato);
    } catch (err: any) {
      console.error("Error al subir CV:", err);
      alert(`No se pudo subir el archivo: ${err.message || "Error de red"}`);
    }
  };

  const handleGuardarIntereses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id_candidato) return;
    try {
      await fetch(`${API_URL}/api/candidato/preferencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_candidato: usuario.id_candidato,
          cargo_deseado: cargoInteres,
          ubicacion_deseada: ubicacionInteres,
          empresas_interes: empresaInteres,
          rango_salarial: rangoSalarial,
          modalidad: modalidadInteres,
          tipo_contrato: tipoContrato
        })
      });
      alert("Preferencias guardadas. Se actualizarán tus recomendaciones.");
      cargarFeed(usuario.id_candidato);
      setSeccionActiva("match");
    } catch {
      alert("Error al guardar preferencias.");
    }
  };

  const handleSwipe = async (decision: "like" | "dislike") => {
    if (!vacantes[indiceVacante] || !usuario?.id_candidato) return;
    const v = vacantes[indiceVacante];
    const afinidadCalculada = v.afinidad_estimada ?? 0;

    if (decision === "like") {
      const nuevaPostulacion: PostulacionHistorial = {
        id_postulacion: Date.now(),
        titulo: v.titulo,
        empresa: v.nombre_empresa,
        estado: "Postulado (Enviada)",
        afinidad: afinidadCalculada,
        fecha_postulacion: new Date().toISOString()
      };
      setHistorial(prev => [nuevaPostulacion, ...prev]);
    }

    try {
      await fetch(`${API_URL}/api/swipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_candidato: usuario.id_candidato,
          id_vacante: v.id_vacante,
          decision,
          afinidad: afinidadCalculada
        })
      });
      cargarHistorial(usuario.id_candidato);
      if (usuario.id_usuario) cargarNotificaciones(usuario.id_usuario);
    } catch (err) {
      console.warn("Postulación guardada:", err);
    }

    setIndiceVacante(prev => prev + 1);
    setModalEspecificaciones(null);
  };

  const handleMarcarNotifLeida = async (id_notif: number) => {
    try {
      await fetch(`${API_URL}/api/notificaciones/${id_notif}/leer`, { method: "PUT" });
      setNotificaciones(prev => prev.map(n => (n.id_notificacion === id_notif ? { ...n, leida: true } : n)));
    } catch {}
  };

  const handleMarcarTodasNotif = async () => {
    if (!usuario?.id_usuario) return;
    try {
      await fetch(`${API_URL}/api/notificaciones/usuario/${usuario.id_usuario}/leer-todas`, { method: "PUT" });
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch {}
  };

  const handleConfirmarEntrevista = async (id_entrevista: number) => {
    try {
      await fetch(`${API_URL}/api/entrevistas/${id_entrevista}/confirmar`, { method: "PUT" });
      if (usuario?.id_candidato) cargarEntrevistas(usuario.id_candidato);
      alert("Asistencia confirmada a la entrevista.");
    } catch {}
  };

  const handleCrearVacante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id_empresa) return;
    try {
      await fetch(`${API_URL}/api/vacantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa: usuario.id_empresa,
          titulo: tituloVac,
          descripcion: descVac,
          requisitos: reqVac,
          salario: salarioVac,
          modalidad: modalidadVac,
          ubicacion: "Colombia",
          tipo_contrato: tipoContratoVac
        })
      });
      alert("Vacante publicada exitosamente.");
      setTituloVac("");
      setDescVac("");
      setReqVac("");
      setSalarioVac("");
      setTipoContratoVac("Término indefinido");
      cargarPostulacionesEmpresa(usuario.id_empresa);
    } catch {
      alert("Error al publicar vacante.");
    }
  };

  const handleAgendarDesdeEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAgendar || !usuario?.id_empresa) return;

    const nuevaCita: EntrevistaItem = {
      id_entrevista: Date.now(),
      titulo: `Entrevista con ${modalAgendar.candidato_nombre}`,
      candidato_nombre: modalAgendar.candidato_nombre,
      empresa_nombre: usuario.nombre,
      fecha_hora: fechaHoraCita,
      duracion_minutos: 45,
      modalidad: "Remoto",
      enlace_reunion: enlaceCita,
      estado: "programada"
    };
    setEntrevistas(prev => [nuevaCita, ...prev]);

    try {
      await fetch(`${API_URL}/api/empresa/entrevistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_candidato: modalAgendar.id_candidato,
          id_empresa: usuario.id_empresa,
          id_postulacion: modalAgendar.id_postulacion,
          titulo: `Entrevista con ${modalAgendar.candidato_nombre}`,
          fecha_hora: fechaHoraCita,
          modalidad: "Remoto",
          enlace_reunion: enlaceCita,
          notas: "Revisión técnica y entrevista inicial."
        })
      });
      alert("Entrevista programada y notificación despachada.");
    } catch {}
    setModalAgendar(null);
  };

  const noLeidasCount = notificaciones.filter(n => !n.leida).length;
  const fontDisplayFamily = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";

  const bgMeshStyle: React.CSSProperties = {
    background: "radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(59, 130, 246, 0.06) 0px, transparent 50%), #f8fafc",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    color: "#0f172a",
    fontFamily: fontDisplayFamily,
    position: "relative",
    overflowX: "hidden"
  };

  const glassCardStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
    fontFamily: fontDisplayFamily
  };

  const inputStyle: React.CSSProperties = {
    padding: "13px 18px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    fontFamily: fontDisplayFamily,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)"
  };

  if (!usuario) {
    return (
      <div style={{ ...bgMeshStyle, justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ ...glassCardStyle, padding: "44px 36px", width: "100%", maxWidth: "440px", textAlign: "center" }} className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                boxShadow: "0 14px 32px -8px rgba(124, 58, 237, 0.22), 0 6px 14px -3px rgba(5, 150, 105, 0.12)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                boxSizing: "border-box"
              }}
            >
              <img
                src="/logo.png"
                alt="SwipeJob Logo"
                onError={e => { (e.target as HTMLElement).style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px", justifyContent: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "900", color: "#7c3aed", letterSpacing: "-1.5px" }}>Swipe</span>
            <span style={{ fontSize: "36px", fontWeight: "900", color: "#059669", letterSpacing: "-1.5px" }}>Job</span>
          </div>

          <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "14px", fontWeight: "500", lineHeight: "1.5" }}>
            Conexión directa entre talento calificado y las mejores ofertas laborales
          </p>

          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px", margin: "0 0 20px" }}>
            {vistaAuth === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          {vistaAuth === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <input type="email" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required style={inputStyle} />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              <button type="submit" style={{ padding: "14px", borderRadius: "18px", background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "15px", letterSpacing: "-0.2px", marginTop: "6px", boxShadow: "0 6px 20px rgba(124, 58, 237, 0.25)" }}>
                Iniciar Sesión
              </button>
              <button type="button" onClick={() => setVistaAuth("registro")} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: "800", cursor: "pointer", fontSize: "13px", marginTop: "10px" }}>
                ¿No tienes cuenta? Regístrate aquí
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistro} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <select value={rolRegistro} onChange={(e: any) => setRolRegistro(e.target.value)} style={{ ...inputStyle, cursor: "pointer", fontWeight: "600" }}>
                <option value="candidato">Soy Candidato</option>
                <option value="empresa">Soy Empresa</option>
              </select>
              <input type="text" placeholder="Nombre completo o Empresa" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
              <input type="email" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required style={inputStyle} />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              <input type="text" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} />
              <button type="submit" style={{ padding: "14px", borderRadius: "18px", background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "white", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "15px", letterSpacing: "-0.2px", marginTop: "6px", boxShadow: "0 6px 20px rgba(5, 150, 105, 0.25)" }}>
                Crear Cuenta
              </button>
              <button type="button" onClick={() => setVistaAuth("login")} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: "800", cursor: "pointer", fontSize: "13px" }}>
                Ya tengo cuenta, iniciar sesión
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={bgMeshStyle}>
      {/* Botón Flotante Menú */}
      <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 80, display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => setSidebarAbierto(!sidebarAbierto)}
          style={{
            padding: "10px 18px",
            borderRadius: "18px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid #e2e8f0",
            color: "#0f172a",
            fontWeight: "900",
            fontFamily: fontDisplayFamily,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
            transition: "all 0.2s ease"
          }}
        >
          <span style={{ fontSize: "18px" }}>{sidebarAbierto ? "✕" : "☰"}</span>
          <span>{sidebarAbierto ? "Cerrar" : "Menú"}</span>
        </button>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo.png" alt="SwipeJob" onError={e => { (e.target as HTMLElement).style.display = "none"; }} style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "6px" }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#7c3aed", letterSpacing: "-0.5px" }}>Swipe</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#059669", letterSpacing: "-0.5px" }}>Job</span>
          </div>
        </div>
      </div>

      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(4px)",
            zIndex: 90
          }}
        />
      )}

      {/* Menú Lateral Desplegable */}
      <aside
        style={{
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          width: "290px",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(226, 232, 240, 0.9)",
          display: "flex",
          flexDirection: "column",
          padding: "30px 22px",
          zIndex: 100,
          transform: sidebarAbierto ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: sidebarAbierto ? "12px 0 35px rgba(0, 0, 0, 0.12)" : "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="SwipeJob" onError={e => { (e.target as HTMLElement).style.display = "none"; }} style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "8px" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "26px", fontWeight: "900", color: "#7c3aed", letterSpacing: "-1px" }}>Swipe</span>
              <span style={{ fontSize: "26px", fontWeight: "900", color: "#059669", letterSpacing: "-1px" }}>Job</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarAbierto(false)}
            style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "#64748b", padding: "4px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div style={{ position: "relative", width: "76px", height: "76px", margin: "0 auto 12px" }}>
            {usuario.foto_perfil ? (
              <img
                src={usuario.foto_perfil}
                alt="Perfil"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.2)" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: usuario.rol === "candidato" ? "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" : "linear-gradient(135deg, #059669 0%, #065f46 100%)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "28px", boxShadow: "0 8px 18px rgba(0,0,0,0.12)" }}>
                {usuario.rol === "candidato" ? "👤" : "🏢"}
              </div>
            )}
            
            <label title="Cambiar foto de perfil" style={{ position: "absolute", bottom: "-2px", right: "-2px", backgroundColor: "#ffffff", borderRadius: "50%", width: "26px", height: "26px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", border: "1px solid #cbd5e1", fontSize: "13px" }}>
              📷
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleSubirFoto} style={{ display: "none" }} />
            </label>
          </div>
          
          <strong style={{ fontSize: "16px", display: "block", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.3px" }}>
            {usuario.nombre}
          </strong>
          <span style={{ display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "3px 10px", borderRadius: "12px", letterSpacing: "0.5px", backgroundColor: usuario.rol === "candidato" ? "#f5f3ff" : "#ecfdf5", color: usuario.rol === "candidato" ? "#7c3aed" : "#059669" }}>
            {usuario.rol}
          </span>
        </div>

        {usuario.rol === "candidato" ? (
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto" }}>
            {[
              { id: "inicio", label: "🏠 Inicio" },
              { id: "match", label: "★ Explorar Vacantes" },
              { id: "agenda", label: "📅 Mi Agenda" },
              { id: "notificaciones", label: `🔔 Avisos ${noLeidasCount > 0 ? `(${noLeidasCount})` : ""}` },
              { id: "perfil", label: "👤 Perfil & CV" },
              { id: "portafolio", label: `💼 Postulaciones ${historial.length > 0 ? `(${historial.length})` : ""}` },
              { id: "intereses", label: "🎯 Mis Preferencias" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSeccionActiva(tab.id as any);
                  setSidebarAbierto(false);
                }}
                style={{
                  padding: "13px 18px",
                  borderRadius: "16px",
                  border: "none",
                  backgroundColor: seccionActiva === tab.id ? "#7c3aed" : "transparent",
                  color: seccionActiva === tab.id ? "#ffffff" : "#0f172a",
                  textAlign: "left",
                  fontWeight: "900",
                  fontFamily: fontDisplayFamily,
                  letterSpacing: "-0.2px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.15s ease",
                  boxShadow: seccionActiva === tab.id ? "0 4px 14px rgba(124, 58, 237, 0.25)" : "none"
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        ) : (
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto" }}>
            {[
              { id: "empresa_ofertas", label: "🏢 Gestión de Vacantes" },
              { id: "empresa_agenda", label: `📅 Agenda de Entrevistas ${entrevistas.length > 0 ? `(${entrevistas.length})` : ""}` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSeccionActiva(tab.id as any);
                  setSidebarAbierto(false);
                }}
                style={{
                  padding: "13px 18px",
                  borderRadius: "16px",
                  border: "none",
                  backgroundColor: seccionActiva === tab.id ? "#059669" : "transparent",
                  color: seccionActiva === tab.id ? "#ffffff" : "#0f172a",
                  textAlign: "left",
                  fontWeight: "900",
                  fontFamily: fontDisplayFamily,
                  letterSpacing: "-0.2px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.15s ease",
                  boxShadow: seccionActiva === tab.id ? "0 4px 14px rgba(5, 150, 105, 0.25)" : "none"
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        <button
          onClick={() => {
            sesionInicializadaRef.current = null;
            setUsuario(null);
          }}
          style={{ padding: "12px", borderRadius: "16px", backgroundColor: "rgba(255, 241, 242, 0.9)", color: "#e11d48", border: "1px solid #fecdd3", fontWeight: "900", fontFamily: fontDisplayFamily, cursor: "pointer", fontSize: "13px", marginTop: "12px" }}
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: "80px 30px 40px", overflowY: "auto", width: "100%", boxSizing: "border-box" }}>
        {usuario.rol === "candidato" ? (
          <>
            {seccionActiva === "inicio" && (
              <div style={{ maxWidth: "860px", margin: "0 auto" }} className="animate-fade-in">
                <div style={{ ...glassCardStyle, padding: "40px", marginBottom: "26px", background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,243,255,0.85) 100%)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "-40px", right: "-30px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", borderRadius: "50%" }}></div>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px" }}>Panel Principal</span>
                  <h2 style={{ fontSize: "30px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.6px", margin: "6px 0 10px" }}>
                    ¡Hola de nuevo, {usuario.nombre}!
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px", maxWidth: "600px", fontWeight: "500" }}>
                    Las vacantes recomendadas están personalizadas según tu perfil, tus habilidades y tus preferencias laborales.
                  </p>
                  
                  <div style={{ display: "flex", gap: "14px" }}>
                    <button onClick={() => setSeccionActiva("match")} style={{ padding: "14px 28px", borderRadius: "18px", background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "14px", letterSpacing: "-0.2px", boxShadow: "0 6px 18px rgba(124, 58, 237, 0.25)" }}>
                      Explorar Vacantes ★
                    </button>
                    <button onClick={() => setSeccionActiva("agenda")} style={{ padding: "14px 26px", borderRadius: "18px", backgroundColor: "#ffffff", color: "#0f172a", fontWeight: "900", fontFamily: fontDisplayFamily, border: "1px solid #cbd5e1", cursor: "pointer", fontSize: "14px" }}>
                      Revisar Agenda
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
                  <div style={{ ...glassCardStyle, padding: "22px 26px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>POSTULACIONES</span>
                    <strong style={{ display: "block", fontSize: "28px", color: "#0f172a", fontWeight: "900", marginTop: "4px" }}>{historial.length}</strong>
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800" }}>Enviadas</span>
                  </div>
                  <div style={{ ...glassCardStyle, padding: "22px 26px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>CITAS PROGRAMADAS</span>
                    <strong style={{ display: "block", fontSize: "28px", color: "#7c3aed", fontWeight: "900", marginTop: "4px" }}>{entrevistas.length}</strong>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>En tu calendario</span>
                  </div>
                  <div style={{ ...glassCardStyle, padding: "22px 26px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>HOJA DE VIDA</span>
                    <strong style={{ display: "block", fontSize: "18px", color: perfil.cv_nombre ? "#059669" : "#d97706", fontWeight: "900", marginTop: "8px" }}>
                      {perfil.cv_nombre ? "Cargada ✓" : "Pendiente"}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Lista para postulaciones</span>
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === "match" && (
              <div className="animate-fade-in">
                {requiereCV ? (
                  <div style={{ ...glassCardStyle, maxWidth: "520px", margin: "40px auto", padding: "40px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
                    <h3 style={{ margin: 0, color: "#d97706", fontSize: "20px", fontWeight: "900" }}>Hoja de Vida Requerida</h3>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: "12px 0 24px", fontWeight: "500" }}>Sube tu CV en tu perfil para comenzar a recibir recomendaciones de empleo.</p>
                    <button onClick={() => setSeccionActiva("perfil")} style={{ padding: "13px 26px", borderRadius: "18px", backgroundColor: "#7c3aed", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer" }}>
                      Subir CV Ahora
                    </button>
                  </div>
                ) : vacantes.length > 0 && indiceVacante < vacantes.length ? (
                  <SwipeCardStudio
                    vacante={vacantes[indiceVacante]}
                    onSwipe={handleSwipe}
                    onVerDetalles={() => setModalEspecificaciones(vacantes[indiceVacante])}
                  />
                ) : (
                  <div style={{ ...glassCardStyle, maxWidth: "520px", margin: "40px auto", padding: "40px", textAlign: "center" }}>
                    <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>✨</span>
                    <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#0f172a", fontWeight: "900" }}>¡Estás al día!</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Has evaluado todas las ofertas disponibles por ahora.</p>
                  </div>
                )}
              </div>
            )}

            {seccionActiva === "agenda" && (
              <CalendarView
                entrevistas={entrevistas}
                onConfirmar={handleConfirmarEntrevista}
                esEmpresa={false}
              />
            )}

            {seccionActiva === "notificaciones" && (
              <NotificationsCenter
                notificaciones={notificaciones}
                onMarcarLeida={handleMarcarNotifLeida}
                onMarcarTodas={handleMarcarTodasNotif}
                onNavegar={sec => setSeccionActiva(sec)}
              />
            )}

            {seccionActiva === "perfil" && (
              <div style={{ ...glassCardStyle, maxWidth: "720px", margin: "0 auto", padding: "36px" }} className="animate-fade-in">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ position: "relative", width: "74px", height: "74px" }}>
                      {perfil.foto_perfil || usuario.foto_perfil ? (
                        <img
                          src={perfil.foto_perfil || usuario.foto_perfil}
                          alt="Perfil"
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "28px" }}>
                          👤
                        </div>
                      )}
                      <label title="Cambiar foto" style={{ position: "absolute", bottom: "0", right: "0", backgroundColor: "#7c3aed", color: "white", borderRadius: "50%", width: "24px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", fontSize: "11px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                        ✎
                        <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleSubirFoto} style={{ display: "none" }} />
                      </label>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.4px" }}>{perfil.nombre || usuario.nombre}</h2>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>{perfil.correo || usuario.correo}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditandoPerfil(!editandoPerfil)}
                    style={{ padding: "10px 18px", borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: editandoPerfil ? "#fff1f2" : "#f8fafc", color: editandoPerfil ? "#e11d48" : "#0f172a", fontWeight: "900", fontFamily: fontDisplayFamily, cursor: "pointer", fontSize: "13px" }}
                  >
                    {editandoPerfil ? "Cancelar" : "Editar Perfil"}
                  </button>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "22px", borderRadius: "22px", margin: "24px 0", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: "900" }}>Documento CV Adjunto:</strong>
                    <span style={{ backgroundColor: perfil.cv_nombre ? "#ecfdf5" : "#fee2e2", color: perfil.cv_nombre ? "#065f46" : "#b91c1c", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "900" }}>
                      {perfil.cv_nombre ? `Cargado: ${perfil.cv_nombre}` : "Sin adjuntar"}
                    </span>
                  </div>

                  <form onSubmit={handleSubirCV} style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    <input
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setArchivoCV(e.target.files[0]);
                        }
                      }}
                      style={{ flex: 1, padding: "10px", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px dashed #cbd5e1", fontSize: "13px", fontFamily: fontDisplayFamily }}
                    />
                    <button
                      type="submit"
                      style={{ padding: "10px 20px", borderRadius: "16px", backgroundColor: "#059669", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "13px" }}
                    >
                      Guardar Archivo
                    </button>
                  </form>
                  {mensajeCV && <p style={{ color: "#059669", fontSize: "12px", margin: "8px 0 0", fontWeight: "800" }}>{mensajeCV}</p>}
                </div>

                {editandoPerfil ? (
                  <form onSubmit={handleGuardarPerfil} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Nombre Completo
                      <input type="text" value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Teléfono de Contacto
                      <input type="text" value={perfil.telefono} onChange={e => setPerfil({ ...perfil, telefono: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Estudios y Formación
                      <textarea rows={2} value={perfil.estudios} onChange={e => setPerfil({ ...perfil, estudios: e.target.value })} style={{ ...inputStyle, fontFamily: fontDisplayFamily }} />
                    </label>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>Proyección Profesional
                      <textarea rows={3} value={perfil.proyeccion} onChange={e => setPerfil({ ...perfil, proyeccion: e.target.value })} style={{ ...inputStyle, fontFamily: fontDisplayFamily }} />
                    </label>
                    <button type="submit" style={{ padding: "14px", borderRadius: "18px", backgroundColor: "#059669", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "14px" }}>
                      Guardar Información
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div>
                      <strong style={{ fontSize: "11px", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "900" }}>Datos de Contacto</strong>
                      <p style={{ margin: "4px 0", fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>{perfil.telefono || "Sin registrar"} · {perfil.correo}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "11px", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "900" }}>Estudios Registrados</strong>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#475569", lineHeight: "1.5", fontWeight: "500" }}>{perfil.estudios || "Sin especificar"}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "11px", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "900" }}>Proyección y Enfoque</strong>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#475569", lineHeight: "1.5", fontWeight: "500" }}>{perfil.proyeccion || "Sin especificar"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {seccionActiva === "portafolio" && (
              <div style={{ ...glassCardStyle, maxWidth: "760px", margin: "0 auto", padding: "36px" }} className="animate-fade-in">
                <h2 style={{ margin: "0 0 20px", fontSize: "22px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.4px" }}>Historial de Postulaciones</h2>
                {historial.length === 0 ? (
                  <p style={{ color: "#64748b", fontWeight: "500" }}>Aún no has aplicado a ofertas en la plataforma.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {historial.map((h, idx) => (
                      <div key={h.id_postulacion || idx} style={{ backgroundColor: "#ffffff", padding: "18px 22px", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <div>
                          <strong style={{ fontSize: "16px", color: "#0f172a", fontWeight: "900" }}>{h.titulo}</strong>
                          <span style={{ display: "block", fontSize: "13px", color: "#64748b", marginTop: "2px", fontWeight: "600" }}>🏢 {h.empresa}</span>
                          <small style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>{new Date(h.fecha_postulacion).toLocaleDateString()}</small>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ backgroundColor: "#ecfdf5", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "900" }}>
                            {h.estado}
                          </span>
                          <span style={{ display: "block", fontSize: "13px", color: "#7c3aed", fontWeight: "900", marginTop: "4px" }}>
                            {h.afinidad}% Afinidad
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {seccionActiva === "intereses" && (
              <div style={{ ...glassCardStyle, maxWidth: "700px", margin: "0 auto", padding: "36px" }} className="animate-fade-in">
                <h2 style={{ margin: "0 0 6px", fontSize: "22px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.4px" }}>Preferencias de Empleo</h2>
                <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "13px", fontWeight: "500" }}>Configura tus preferencias contractuales y salariales para personalizar las recomendaciones.</p>
                
                <form onSubmit={handleGuardarIntereses} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>CARGO DESEADO</label>
                    <input type="text" value={cargoInteres} onChange={e => setCargoInteres(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>CIUDAD O UBICACIÓN</label>
                    <input type="text" value={ubicacionInteres} onChange={e => setUbicacionInteres(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>EMPRESA DE INTERÉS</label>
                    <input type="text" value={empresaInteres} onChange={e => setEmpresaInteres(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>RANGO SALARIAL ASPIRADO</label>
                    <input type="text" value={rangoSalarial} onChange={e => setRangoSalarial(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>MODALIDAD DE TRABAJO</label>
                    <select value={modalidadInteres} onChange={e => setModalidadInteres(e.target.value)} style={{ ...inputStyle, cursor: "pointer", fontWeight: "700" }}>
                      <option value="Remoto">Remoto</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Presencial">Presencial</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>TIPO DE CONTRATO</label>
                    <select value={tipoContrato} onChange={e => setTipoContrato(e.target.value)} style={{ ...inputStyle, cursor: "pointer", fontWeight: "700" }}>
                      <option value="Término indefinido">Término indefinido</option>
                      <option value="Término fijo">Término fijo</option>
                      <option value="Prestación de servicios">Prestación de servicios</option>
                    </select>
                  </div>
                  <button type="submit" style={{ padding: "14px", borderRadius: "18px", backgroundColor: "#7c3aed", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "14px", marginTop: "8px" }}>
                    Guardar Preferencias
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          /* Vista Empresa */
          <>
            {seccionActiva === "empresa_ofertas" && (
              <div style={{ maxWidth: "1240px", margin: "0 auto" }} className="animate-fade-in">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "30px" }}>
                  <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>POSTULACIONES</span>
                    <strong style={{ display: "block", fontSize: "28px", color: "#0f172a", fontWeight: "900", marginTop: "4px" }}>
                      {postulacionesEmpresa.length}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800" }}>Candidatos recibidos</span>
                  </div>
                  <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>AFINIDAD PROMEDIO</span>
                    <strong style={{ display: "block", fontSize: "28px", color: "#7c3aed", fontWeight: "900", marginTop: "4px" }}>
                      {postulacionesEmpresa.length > 0
                        ? Math.round(postulacionesEmpresa.reduce((acc, p) => acc + (parseFloat(p.afinidad) || 0), 0) / postulacionesEmpresa.length)
                        : 0}%
                    </strong>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Compatibilidad de perfiles</span>
                  </div>
                  <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>CITAS PROGRAMADAS</span>
                    <strong style={{ display: "block", fontSize: "28px", color: "#059669", fontWeight: "900", marginTop: "4px" }}>
                      {entrevistas.length}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800" }}>En calendario</span>
                  </div>
                  <div style={{ ...glassCardStyle, padding: "22px 24px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>NOTIFICACIONES</span>
                    <strong style={{ display: "block", fontSize: "22px", color: "#0f172a", fontWeight: "900", marginTop: "6px" }}>
                      Automáticas
                    </strong>
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800" }}>● Alertas al correo activas</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "28px" }}>
                  <div style={{ ...glassCardStyle, padding: "34px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                      <span style={{ fontSize: "22px" }}>📝</span>
                      <div>
                        <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: "900", letterSpacing: "-0.4px" }}>Publicar Nueva Vacante</h3>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Completa los datos para recibir postulantes afines</p>
                      </div>
                    </div>

                    <form onSubmit={handleCrearVacante} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <input type="text" placeholder="Título del puesto (ej. Desarrollador Backend Python)" value={tituloVac} onChange={e => setTituloVac(e.target.value)} required style={inputStyle} />
                      <textarea placeholder="Descripción del rol y responsabilidades" rows={3} value={descVac} onChange={e => setDescVac(e.target.value)} required style={{ ...inputStyle, fontFamily: fontDisplayFamily }} />
                      <textarea placeholder="Requisitos principales (separados por coma: Python, FastAPI, Docker, PostgreSQL)" rows={2} value={reqVac} onChange={e => setReqVac(e.target.value)} required style={{ ...inputStyle, fontFamily: fontDisplayFamily }} />
                      <input type="text" placeholder="Rango Salarial (ej. 7.500.000 COP)" value={salarioVac} onChange={e => setSalarioVac(e.target.value)} required style={inputStyle} />
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <select value={modalidadVac} onChange={e => setModalidadVac(e.target.value)} style={{ ...inputStyle, cursor: "pointer", fontWeight: "700" }}>
                          <option value="Remoto">Remoto</option>
                          <option value="Híbrido">Híbrido</option>
                          <option value="Presencial">Presencial</option>
                        </select>
                        <select value={tipoContratoVac} onChange={e => setTipoContratoVac(e.target.value)} style={{ ...inputStyle, cursor: "pointer", fontWeight: "700" }}>
                          <option value="Término indefinido">Indefinido</option>
                          <option value="Término fijo">Término fijo</option>
                          <option value="Prestación de servicios">Servicios</option>
                        </select>
                      </div>

                      <button type="submit" style={{ padding: "14px", borderRadius: "18px", background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "15px", letterSpacing: "-0.2px", marginTop: "6px", boxShadow: "0 6px 18px rgba(5, 150, 105, 0.25)" }}>
                        Publicar Oferta Laboral
                      </button>
                    </form>
                  </div>

                  <div style={{ ...glassCardStyle, padding: "34px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div>
                        <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: "900", letterSpacing: "-0.4px" }}>Postulantes</h3>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Ordenados por nivel de compatibilidad con tu vacante</p>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "900", color: "#059669", backgroundColor: "#ecfdf5", padding: "4px 12px", borderRadius: "12px" }}>
                        {postulacionesEmpresa.length} Candidatos
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "560px", overflowY: "auto", paddingRight: "4px" }}>
                      {postulacionesEmpresa.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                          <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>📥</span>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Aún no hay postulaciones en tus ofertas.</p>
                        </div>
                      ) : (
                        postulacionesEmpresa.map(p => {
                          const score = parseFloat(p.afinidad) || 0;
                          const esAlto = score >= 80;
                          return (
                            <div key={p.id_postulacion} style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "22px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  {p.candidato_foto ? (
                                    <img
                                      src={p.candidato_foto}
                                      alt={p.candidato_nombre}
                                      style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "1px solid #cbd5e1" }}
                                    />
                                  ) : (
                                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: esAlto ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontWeight: "900", fontSize: "16px" }}>
                                      {p.candidato_nombre?.charAt(0) || "C"}
                                    </div>
                                  )}
                                  <div>
                                    <strong style={{ color: "#0f172a", fontSize: "16px", display: "block", fontWeight: "900" }}>{p.candidato_nombre}</strong>
                                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Vacante: {p.vacante_titulo}</span>
                                  </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                  <span style={{ backgroundColor: esAlto ? "#ecfdf5" : "#f5f3ff", color: esAlto ? "#065f46" : "#6d28d9", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "900", display: "inline-block" }}>
                                    {score}% Afinidad
                                  </span>
                                </div>
                              </div>

                              <p style={{ margin: "12px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5", fontWeight: "500" }}>
                                <strong>Formación:</strong> {p.estudios || "Perfil técnico general"}
                              </p>

                              <button
                                onClick={() => setModalAgendar({ id_candidato: p.id_candidato, id_postulacion: p.id_postulacion, candidato_nombre: p.candidato_nombre })}
                                style={{ width: "100%", padding: "11px", borderRadius: "16px", background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)" }}
                              >
                                📅 Programar Entrevista
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === "empresa_agenda" && (
              <CalendarView
                entrevistas={entrevistas}
                esEmpresa={true}
              />
            )}
          </>
        )}
      </main>

      {/* Modal Especificaciones */}
      {modalEspecificaciones && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 110 }}>
          <div style={{ ...glassCardStyle, backgroundColor: "#ffffff", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.4px" }}>Detalles de la Oferta</h3>
              <button onClick={() => setModalEspecificaciones(null)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <div style={{ margin: "18px 0", fontSize: "13px", lineHeight: "1.7", color: "#334155" }}>
              <p style={{ margin: "4px 0" }}>• <strong>Cargo:</strong> {modalEspecificaciones.titulo}</p>
              <p style={{ margin: "4px 0" }}>• <strong>Empresa:</strong> {modalEspecificaciones.nombre_empresa}</p>
              <p style={{ margin: "4px 0" }}>• <strong>Modalidad:</strong> {modalEspecificaciones.modalidad}</p>
              <p style={{ margin: "4px 0" }}>• <strong>Salario:</strong> {modalEspecificaciones.salario}</p>
              
              {modalEspecificaciones.desglose_match && (
                <div style={{ marginTop: "14px", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <strong style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "900" }}>EVALUACIÓN DE COMPATIBILIDAD:</strong>
                  <ul style={{ margin: "8px 0 0 18px", padding: 0, fontSize: "12px", color: "#475569" }}>
                    <li>Afinidad de Habilidades: {modalEspecificaciones.desglose_match.score_semantico_competencias}/50 pts</li>
                    <li>Alineación Laboral y Contrato: {modalEspecificaciones.desglose_match.score_condiciones_laborales}/30 pts</li>
                    <li>Aptitudes Clave: {modalEspecificaciones.desglose_match.keywords_coincidentes?.join(", ") || "General"}</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => handleSwipe("like")}
              style={{ width: "100%", padding: "14px", borderRadius: "18px", background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", fontSize: "14px" }}
            >
              Confirmar Postulación
            </button>
          </div>
        </div>
      )}

      {/* Modal Agendar Cita */}
      {modalAgendar && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 120 }}>
          <div style={{ ...glassCardStyle, backgroundColor: "#ffffff", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "19px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.4px" }}>Agendar Cita con {modalAgendar.candidato_nombre}</h3>
              <button onClick={() => setModalAgendar(null)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <form onSubmit={handleAgendarDesdeEmpresa} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "18px" }}>
              <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "800" }}>Fecha y Hora de la Sesión
                <input type="datetime-local" value={fechaHoraCita} onChange={e => setFechaHoraCita(e.target.value)} required style={inputStyle} />
              </label>
              <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "800" }}>Enlace de Videollamada
                <input type="url" value={enlaceCita} onChange={e => setEnlaceCita(e.target.value)} required style={inputStyle} />
              </label>
              <button type="submit" style={{ padding: "14px", borderRadius: "18px", background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "white", fontWeight: "900", fontFamily: fontDisplayFamily, border: "none", cursor: "pointer", marginTop: "8px", boxShadow: "0 6px 18px rgba(5, 150, 105, 0.25)" }}>
                Confirmar y Enviar Notificación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}