import { useState } from "react";
import { login } from "../services/authService.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../Estilos/Login.css";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [verContraseña, setVerContraseña] = useState(false);

  const { setUsuario } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login(email, contraseña);

      const usuario = data.usuario;

      setUsuario(usuario);

      //redirigir
      if (usuario.rol === "admin") {
        navigate("/admin");
      } else if (usuario.rol === "mesero") {
        navigate("/mesero/mesas");
      } else {
        setError("Rol de usuario no válido.");

        setTimeout(() => {
          setError("");
        }, 4000);
      }
    } catch (error) {
      setError(error?.response?.data?.mensaje || "No se puedo iniciar sesión.");
      setTimeout(() => {
        setError("");
      }, 4000);
    }
  };

  return (
    <div className="container">
      <div className="container_login">
        <h1 className="titulo">Inicio Sesión</h1>

        <div className="input_label">
          <input
            className="input_correo"
            type="email"
            placeholder=" "
            onChange={(e) => setEmail(e.target.value)}
          />

          <label
            className="label_correo"
            htmlFor="correo electronico"
          >
            Correo Electronico
          </label>
        </div>

        <div className="input_label">
          <input
            className="input_contra"
            type={verContraseña ? "text" : "password"}
            placeholder=" "
            onChange={(e) => setContraseña(e.target.value)}
          />
          <label
            className="label_contra"
            htmlFor="contraseña"
          >
            Contraseña
          </label>
          <span
            className="icono"
            onClick={() => setVerContraseña(!verContraseña)}
          >
            {verContraseña ? <Eye /> : <EyeOff />}
          </span>
        </div>
        <button
          className="boton_login"
          onClick={handleLogin}
        >
          Ingresar
        </button>
      </div>

      {error && <div className="error_credenciales">{error}</div>}
    </div>
  );
}
