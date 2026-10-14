import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://swipejob-backend.onrender.com";

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: "candidato" | "empresa";
  id_candidato?: number;
  id_empresa?: number;
}

interface PerfilCandidato {
  nombre: string;
  correo: string;
  telefono: string;
  estudios: string;
  proyeccion: string;
  perfil_profesional: string;
  cv_nombre?: string;
}

interface Vacante {
  id_vacante: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  salario: string;
  modalidad: string;
  ubicacion: string;
  nombre_empresa: string;
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
  const [seccionActiva, setSeccionActiva] = useState<"inicio" | "match" | "perfil" | "portafolio" | "intereses">("inicio");

  // Inputs Auth
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rolRegistro, setRolRegistro] = useState<"candidato" | "empresa">("candidato");

  // Perfil detallado del candidato
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

  // Feed y Especificaciones
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [indiceVacante, setIndiceVacante] = useState(0);
  const [modalEspecificaciones, setModalEspecificaciones] = useState<Vacante | null>(null);
  const [requiereCV, setRequiereCV] = useState(false);

  // Historial / Portafolio
  const [historial, setHistorial] = useState<PostulacionHistorial[]>([]);

  // Intereses del candidato
  const [cargoInteres, setCargoInteres] = useState("Desarrollador de software");
  const [ubicacionInteres, setUbicacionInteres] = useState("Medellín");
  const [empresaInteres, setEmpresaInteres] = useState("Nutresa");
  const [rangoSalarial, setRangoSalarial] = useState("2.500.000 CP - 7.500.000 CP");
  const [modalidadInteres, setModalidadInteres] = useState("Remoto");
  const [tipoContrato, setTipoContrato] = useState("Término indefinido");

  // Panel de Empresa
  const [tituloVac, setTituloVac] = useState("");
  const [descVac, setDescVac] = useState("");
  const [reqVac, setReqVac] = useState("");
  const [salarioVac, setSalarioVac] = useState("");
  const [modalidadVac, setModalidadVac] = useState("Remoto");
  const [postulacionesEmpresa, setPostulacionesEmpresa] = useState<any[]>([]);

  useEffect(() => {
    if (usuario?.rol === "candidato" && usuario.id_candidato) {
      cargarPerfil(usuario.id_candidato);
      cargarFeed(usuario.id_candidato);
      cargarHistorial(usuario.id_candidato);
    } else if (usuario?.rol === "empresa" && usuario.id_empresa) {
      cargarPostulacionesEmpresa(usuario.id_empresa);
    }
  }, [usuario]);

  const cargarPerfil = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/candidato/perfil/${id}`);
      const data = await res.json();
      if (data) setPerfil(data);
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
    } catch {}
  };

  const cargarHistorial = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/candidato/postulaciones/${id}`);
      const data = await res.json();
      setHistorial(data || []);
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
      alert("Credenciales incorrectas o backend conectando.");
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
      if (!res.ok) throw new Error();
      const data = await res.json();
      alert("Cuenta registrada con éxito.");
      setUsuario(data);
    } catch {
      alert("Error al registrar cuenta.");
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
    if (!archivoCV || !usuario?.id_candidato) return alert("Selecciona un archivo PDF o TXT primero.");
    const formData = new FormData();
    formData.append("id_candidato", usuario.id_candidato.toString());
    formData.append("archivo", archivoCV);

    try {
      const res = await fetch(`${API_URL}/api/candidato/cv`, { method: "POST", body: formData });
      const data = await res.json();
      setMensajeCV(data.mensaje);
      cargarPerfil(usuario.id_candidato);
      cargarFeed(usuario.id_candidato);
    } catch {
      alert("Error al subir el archivo.");
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
      alert("Intereses guardados para el matching con n8n.");
      setSeccionActiva("match");
    } catch {
      alert("Error al guardar intereses.");
    }
  };

  const handleSwipe = async (decision: "like" | "dislike") => {
    if (!vacantes[indiceVacante] || !usuario?.id_candidato) return;
    const v = vacantes[indiceVacante];
    try {
      await fetch(`${API_URL}/api/swipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_candidato: usuario.id_candidato, id_vacante: v.id_vacante, decision })
      });
      cargarHistorial(usuario.id_candidato);
    } catch {}
    setIndiceVacante(prev => prev + 1);
    setModalEspecificaciones(null);
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
          ubicacion: "Colombia"
        })
      });
      alert("Vacante publicada exitosamente.");
      setTituloVac(""); setDescVac(""); setReqVac(""); setSalarioVac("");
      cargarPostulacionesEmpresa(usuario.id_empresa);
    } catch {}
  };

  // ESTILO COMÚN PARA INPUTS (FUERZA COLOR OSCURO #1e293b)
  const inputStyle: React.CSSProperties = {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  };

  // VISTA 1: AUTENTICACIÓN
  if (!usuario) {
    return (
      <div style={{ width: "100vw", minHeight: "100vh", backgroundColor: "#f7f9fc", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "36px 28px", width: "100%", maxWidth: "420px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(20,41,72,0.06)", textAlign: "center" }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "15px" }}>
            <span style={{ fontSize: "32px", fontWeight: "900", color: "#8b30f5" }}>Swipe</span>
            <span style={{ fontSize: "32px", fontWeight: "900", color: "#00c274" }}>Job</span>
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#142948", margin: "0 0 10px", textTransform: "uppercase" }}>
            {vistaAuth === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px" }}>Conectar con</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "22px" }}>
            <span style={{ border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "10px", fontWeight: "bold", color: "#ea4335", backgroundColor: "#f8fafc" }}>G</span>
            <span style={{ border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "10px", fontWeight: "bold", color: "#0077b5", backgroundColor: "#f8fafc" }}>in</span>
            <span style={{ border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "10px", fontWeight: "bold", color: "#00a4ef", backgroundColor: "#f8fafc" }}>■</span>
          </div>

          {vistaAuth === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="email" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required style={inputStyle} />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              <button type="submit" style={{ padding: "13px", borderRadius: "25px", backgroundColor: "#142948", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "14px", marginTop: "8px", boxShadow: "0 4px 12px rgba(20,41,72,0.2)" }}>
                Iniciar Sesión
              </button>
              <button type="button" onClick={() => setVistaAuth("registro")} style={{ background: "none", border: "none", color: "#8b30f5", fontWeight: "bold", cursor: "pointer", fontSize: "13px", marginTop: "6px" }}>
                ¿No tienes cuenta? Crear cuenta
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistro} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <select value={rolRegistro} onChange={(e: any) => setRolRegistro(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="candidato">Soy Candidato</option>
                <option value="empresa">Soy Empresa</option>
              </select>
              <input type="text" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
              <input type="email" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required style={inputStyle} />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
              <input type="text" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} />
              <button type="submit" style={{ padding: "13px", borderRadius: "25px", backgroundColor: "#00c274", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "14px", marginTop: "6px" }}>
                Crear Cuenta
              </button>
              <button type="button" onClick={() => setVistaAuth("login")} style={{ background: "none", border: "none", color: "#8b30f5", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                Ya tengo cuenta, iniciar sesión
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // VISTA 2: APLICACIÓN PRINCIPAL A PANTALLA COMPLETA
  return (
    <div style={{ display: "flex", width: "100vw", minHeight: "100vh", backgroundColor: "#f7f9fc", color: "#1e293b", boxSizing: "border-box" }}>
      
      {/* BARRA LATERAL */}
      <aside style={{ width: "240px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "24px 14px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "2px", marginBottom: "12px" }}>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#8b30f5" }}>Swipe</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#00c274" }}>Job</span>
          </div>
          <div style={{ width: "64px", height: "64px", backgroundColor: "#8b30f5", borderRadius: "50%", margin: "0 auto 10px", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "28px" }}>
            👤
          </div>
          <strong style={{ fontSize: "15px", display: "block", color: "#142948" }}>{usuario.nombre}</strong>
          <span style={{ fontSize: "12px", color: "#64748b", textTransform: "capitalize" }}>{usuario.rol}</span>
        </div>

        {usuario.rol === "candidato" ? (
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <button
              onClick={() => setSeccionActiva("inicio")}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "none",
                backgroundColor: seccionActiva === "inicio" ? "#8b30f5" : "transparent",
                color: seccionActiva === "inicio" ? "#ffffff" : "#142948",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              🏠 Inicio
            </button>
            <button
              onClick={() => setSeccionActiva("match")}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "none",
                backgroundColor: seccionActiva === "match" ? "#8b30f5" : "transparent",
                color: seccionActiva === "match" ? "#ffffff" : "#142948",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              ★ Match
            </button>
            <button
              onClick={() => setSeccionActiva("perfil")}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "none",
                backgroundColor: seccionActiva === "perfil" ? "#8b30f5" : "transparent",
                color: seccionActiva === "perfil" ? "#ffffff" : "#142948",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              👤 Perfil
            </button>
            <button
              onClick={() => setSeccionActiva("portafolio")}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "none",
                backgroundColor: seccionActiva === "portafolio" ? "#8b30f5" : "transparent",
                color: seccionActiva === "portafolio" ? "#ffffff" : "#142948",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              💼 Portafolio / Historial
            </button>
            <button
              onClick={() => setSeccionActiva("intereses")}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "none",
                backgroundColor: seccionActiva === "intereses" ? "#8b30f5" : "transparent",
                color: seccionActiva === "intereses" ? "#ffffff" : "#142948",
                textAlign: "left",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              🎯 Mis Intereses
            </button>
          </nav>
        ) : (
          <div style={{ flex: 1, padding: "10px", fontSize: "14px", color: "#64748b" }}>
            Panel de Reclutador de Empresa
          </div>
        )}

        <button
          onClick={() => setUsuario(null)}
          style={{
            padding: "11px",
            borderRadius: "12px",
            backgroundColor: "#fff1f2",
            color: "#e11d48",
            border: "1px solid #fecdd3",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", boxSizing: "border-box" }}>
        {usuario.rol === "candidato" ? (
          <>
            {/* INICIO */}
            {seccionActiva === "inicio" && (
              <div style={{ maxWidth: "600px", margin: "20px auto", backgroundColor: "#ffffff", padding: "36px 30px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(20,41,72,0.04)", textAlign: "center" }}>
                <div style={{ width: "84px", height: "84px", backgroundColor: "#8b30f5", borderRadius: "50%", margin: "0 auto 16px", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "38px" }}>
                  ★
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#142948", margin: "0 0 10px" }}>
                  Buenas tardes, {usuario.nombre}
                </h2>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
                  Bienvenido a SwipeJob. Recuerda ingresar a tu perfil para actualizar tus datos y verificar que tu Hoja de Vida esté procesada para el matching.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    onClick={() => setSeccionActiva("perfil")}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "25px",
                      backgroundColor: "#8b30f5",
                      color: "white",
                      fontWeight: "bold",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Ir a mi Perfil
                  </button>
                  <button
                    onClick={() => setSeccionActiva("match")}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "25px",
                      backgroundColor: "#142948",
                      color: "white",
                      fontWeight: "bold",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Explorar Matches
                  </button>
                </div>
              </div>
            )}

            {/* PERFIL */}
            {seccionActiva === "perfil" && (
              <div style={{ maxWidth: "660px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(20,41,72,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", backgroundColor: "#8b30f5", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "28px" }}>
                      👤
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "20px", color: "#142948", fontWeight: "800" }}>{perfil.nombre || usuario.nombre}</h2>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>{perfil.correo || usuario.correo}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditandoPerfil(!editandoPerfil)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: "20px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: editandoPerfil ? "#fff1f2" : "#f8fafc",
                      color: editandoPerfil ? "#e11d48" : "#142948",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    {editandoPerfil ? "Cancelar" : "Editar Perfil"}
                  </button>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "18px", margin: "22px 0", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px", color: "#142948" }}>Documento de Hoja de Vida:</strong>
                    <span style={{ backgroundColor: perfil.cv_nombre ? "#a1f4c5" : "#fee2e2", color: perfil.cv_nombre ? "#065f46" : "#b91c1c", padding: "4px 12px", borderRadius: "14px", fontSize: "12px", fontWeight: "bold" }}>
                      ESTADO: {perfil.cv_nombre ? `Subido (${perfil.cv_nombre})` : "Sin subir"}
                    </span>
                  </div>
                  <form onSubmit={handleSubirCV} style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    <input type="file" accept=".pdf,.txt" onChange={e => setArchivoCV(e.target.files ? e.target.files[0] : null)} style={{ flex: 1, padding: "10px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px dashed #cbd5e1", fontSize: "13px", color: "#1e293b" }} />
                    <button type="submit" style={{ padding: "10px 18px", borderRadius: "20px", backgroundColor: "#00c274", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "13px" }}>
                      Subir CV
                    </button>
                  </form>
                  {mensajeCV && <p style={{ color: "#059669", fontSize: "12px", margin: "8px 0 0", fontWeight: "bold" }}>{mensajeCV}</p>}
                </div>

                {editandoPerfil ? (
                  <form onSubmit={handleGuardarPerfil} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Nombre
                      <input type="text" value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Teléfono de Contacto
                      <input type="text" value={perfil.telefono} onChange={e => setPerfil({ ...perfil, telefono: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Estudios
                      <textarea rows={2} value={perfil.estudios} onChange={e => setPerfil({ ...perfil, estudios: e.target.value })} style={{ ...inputStyle, fontFamily: "inherit" }} />
                    </label>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Proyección Laboral
                      <textarea rows={3} value={perfil.proyeccion} onChange={e => setPerfil({ ...perfil, proyeccion: e.target.value })} style={{ ...inputStyle, fontFamily: "inherit" }} />
                    </label>
                    <button type="submit" style={{ padding: "13px", borderRadius: "25px", backgroundColor: "#00c274", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "14px", marginTop: "6px" }}>
                      Guardar Cambios del Perfil
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <strong style={{ fontSize: "12px", color: "#8b30f5", textTransform: "uppercase" }}>Contacto</strong>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b" }}>{perfil.telefono || "No especificado"} · {perfil.correo}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "12px", color: "#8b30f5", textTransform: "uppercase" }}>Estudios</strong>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#475569" }}>{perfil.estudios || "Sin registrar"}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "12px", color: "#8b30f5", textTransform: "uppercase" }}>Proyección Profesional</strong>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#475569" }}>{perfil.proyeccion || "Sin registrar"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MATCH */}
            {seccionActiva === "match" && (
              <div style={{ maxWidth: "560px", margin: "0 auto" }}>
                {requiereCV ? (
                  <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #e2e8f0", textAlign: "center", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
                    <h3 style={{ margin: 0, color: "#d97706" }}>Hoja de Vida Requerida</h3>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: "10px 0 20px" }}>Debes subir tu CV en tu perfil para que n8n pueda contrastar tus competencias y desbloquear el feed.</p>
                    <button onClick={() => setSeccionActiva("perfil")} style={{ padding: "12px 24px", borderRadius: "25px", backgroundColor: "#8b30f5", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}>
                      Subir CV Ahora
                    </button>
                  </div>
                ) : vacantes.length > 0 && indiceVacante < vacantes.length ? (
                  <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(20,41,72,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: "20px", color: "#142948", fontWeight: "800" }}>{vacantes[indiceVacante].titulo}</h2>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#8b30f5" }}>★ {vacantes[indiceVacante].nombre_empresa}</span>
                      </div>
                      <span style={{ backgroundColor: "#a1f4c5", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                        Empresa Verificada
                      </span>
                    </div>

                    <p style={{ color: "#64748b", fontSize: "14px", margin: "16px 0", lineHeight: "1.5" }}>{vacantes[indiceVacante].descripcion}</p>

                    <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", margin: "14px 0", fontSize: "13px", color: "#1e293b" }}>
                      💰 Salario: <strong>{vacantes[indiceVacante].salario}</strong> · 📍 Modalidad: <strong>{vacantes[indiceVacante].modalidad}</strong>
                    </div>

                    <button
                      onClick={() => setModalEspecificaciones(vacantes[indiceVacante])}
                      style={{
                        width: "100%",
                        padding: "11px",
                        borderRadius: "20px",
                        backgroundColor: "#a1f4c5",
                        color: "#065f46",
                        fontWeight: "bold",
                        border: "none",
                        cursor: "pointer",
                        margin: "10px 0",
                        fontSize: "14px"
                      }}
                    >
                      Ver Especificaciones
                    </button>

                    <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                      <button
                        onClick={() => handleSwipe("dislike")}
                        style={{
                          flex: 1,
                          padding: "13px",
                          borderRadius: "25px",
                          border: "1px solid #ef4444",
                          backgroundColor: "#ffffff",
                          color: "#ef4444",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Descartar
                      </button>
                      <button
                        onClick={() => handleSwipe("like")}
                        style={{
                          flex: 1,
                          padding: "13px",
                          borderRadius: "25px",
                          border: "none",
                          backgroundColor: "#142948",
                          color: "white",
                          fontWeight: "bold",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(20,41,72,0.2)"
                        }}
                      >
                        ✓ Aplicar (Swipe Like)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#64748b" }}>Has revisado todas las vacantes afines a tu hoja de vida.</p>
                  </div>
                )}
              </div>
            )}

            {/* MODAL ESPECIFICACIONES */}
            {modalEspecificaciones && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,41,72,0.4)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 100 }}>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "28px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#142948", fontWeight: "800" }}>Especificaciones del Match</h3>
                    <button onClick={() => setModalEspecificaciones(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
                  </div>
                  <div style={{ margin: "18px 0", fontSize: "13px", lineHeight: "1.7", color: "#334155" }}>
                    <p style={{ margin: "4px 0" }}>• <strong>Cargo:</strong> {modalEspecificaciones.titulo}</p>
                    <p style={{ margin: "4px 0" }}>• <strong>Empresa:</strong> {modalEspecificaciones.nombre_empresa}</p>
                    <p style={{ margin: "4px 0" }}>• <strong>Requisitos:</strong> {modalEspecificaciones.requisitos}</p>
                    <p style={{ margin: "4px 0" }}>• <strong>Modalidad:</strong> {modalEspecificaciones.modalidad}</p>
                    <p style={{ margin: "4px 0" }}>• <strong>Salario:</strong> {modalEspecificaciones.salario}</p>
                    <div style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", padding: "10px", borderRadius: "12px", fontWeight: "bold", marginTop: "12px" }}>
                      ⭐ Compatibilidad Técnica por CV: Alta (Evaluado en n8n)
                    </div>
                  </div>
                  <button
                    onClick={() => handleSwipe("like")}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: "25px",
                      backgroundColor: "#142948",
                      color: "white",
                      fontWeight: "bold",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Confirmar Postulación
                  </button>
                </div>
              </div>
            )}

            {/* PORTAFOLIO */}
            {seccionActiva === "portafolio" && (
              <div style={{ maxWidth: "660px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(20,41,72,0.04)" }}>
                <h2 style={{ margin: "0 0 20px", fontSize: "20px", color: "#142948", fontWeight: "800" }}>Historial y Portafolio de Postulaciones</h2>
                {historial.length === 0 ? (
                  <p style={{ color: "#64748b" }}>Aún no tienes aplicaciones registradas.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {historial.map(h => (
                      <div key={h.id_postulacion} style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "15px", color: "#142948" }}>{h.titulo}</strong>
                          <span style={{ display: "block", fontSize: "13px", color: "#64748b" }}>{h.empresa}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ backgroundColor: "#a1f4c5", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                            ESTADO: {h.estado}
                          </span>
                          <span style={{ display: "block", fontSize: "12px", color: "#8b30f5", fontWeight: "bold", marginTop: "4px" }}>
                            {h.afinidad}% Afinidad n8n
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MIS INTERESES */}
            {seccionActiva === "intereses" && (
              <div style={{ maxWidth: "620px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(20,41,72,0.04)" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: "#142948", fontWeight: "800" }}>Cuéntanos tus intereses</h2>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>Estas respuestas alimentan el 30% del algoritmo de matching en n8n.</p>
                <form onSubmit={handleGuardarIntereses} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>CARGO DE INTERÉS</label>
                    <input type="text" value={cargoInteres} onChange={e => setCargoInteres(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>UBICACIÓN DE INTERÉS</label>
                    <input type="text" value={ubicacionInteres} onChange={e => setUbicacionInteres(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>EMPRESAS DE INTERÉS</label>
                    <input type="text" value={empresaInteres} onChange={e => setEmpresaInteres(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>RANGO SALARIAL</label>
                    <input type="text" value={rangoSalarial} onChange={e => setRangoSalarial(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>MODALIDAD</label>
                    <select value={modalidadInteres} onChange={e => setModalidadInteres(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="Remoto">Remoto</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Tiempo completo">Tiempo completo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>TIPO DE CONTRATO</label>
                    <select value={tipoContrato} onChange={e => setTipoContrato(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="Término indefinido">Término indefinido</option>
                      <option value="Término fijo">Término fijo</option>
                      <option value="Prestación de servicios">Prestación de servicios</option>
                      <option value="Prácticas / Pasantías">Prácticas / Pasantías</option>
                    </select>
                  </div>
                  <button type="submit" style={{ padding: "13px", borderRadius: "25px", backgroundColor: "#8b30f5", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "10px", fontSize: "14px" }}>
                    Guardar Intereses y Activar Matching
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          /* VISTA EMPRESA */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(20,41,72,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#142948" }}>Publicar Oferta Laboral</h3>
              <form onSubmit={handleCrearVacante} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="text" placeholder="Título del cargo (ej. Desarrollador Python)" value={tituloVac} onChange={e => setTituloVac(e.target.value)} required style={inputStyle} />
                <textarea placeholder="Descripción del cargo" rows={3} value={descVac} onChange={e => setDescVac(e.target.value)} required style={{ ...inputStyle, fontFamily: "inherit" }} />
                <textarea placeholder="Requisitos técnicos (ej. Python, SQL, Docker)" rows={2} value={reqVac} onChange={e => setReqVac(e.target.value)} required style={{ ...inputStyle, fontFamily: "inherit" }} />
                <input type="text" placeholder="Salario (ej. $7.250.000 COP)" value={salarioVac} onChange={e => setSalarioVac(e.target.value)} required style={inputStyle} />
                
                <select 
                  value={modalidadVac} 
                  onChange={e => setModalidadVac(e.target.value)} 
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Remoto">Modalidad: Remoto</option>
                  <option value="Híbrido">Modalidad: Híbrido</option>
                  <option value="Presencial">Modalidad: Presencial</option>
                </select>

                <button type="submit" style={{ padding: "13px", borderRadius: "25px", backgroundColor: "#142948", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "14px" }}>
                  Publicar Vacante
                </button>
              </form>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(20,41,72,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#142948" }}>Postulaciones Recibidas (Matching n8n)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "480px", overflowY: "auto" }}>
                {postulacionesEmpresa.map(p => (
                  <div key={p.id_postulacion} style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#142948" }}>{p.candidato_nombre}</strong>
                      <span style={{ backgroundColor: "#a1f4c5", color: "#065f46", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                        {p.afinidad}% Afinidad
                      </span>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: "12px", color: "#64748b" }}>Vacante: {p.vacante_titulo}</p>
                    <p style={{ margin: "4px 0", fontSize: "12px", color: "#475569" }}>Estudios: {p.estudios}</p>
                    <span style={{ fontSize: "11px", color: "#8b30f5", fontWeight: "bold" }}>Adjunto: {p.cv_url}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}