import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  ClipboardList,
  LogOut,
  X,
  Menu,
  Table,
  HandPlatter,
} from "lucide-react";
import { useState } from "react";
import "../Estilos/SidebarMesero.css";
import { cerrarSesion } from "../services/authService";

function SidebarMesero() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { setUsuario } = useAuth();
  const navigete = useNavigate();

  const handleLogout = async () => {
    try {
      await cerrarSesion();

      setUsuario(null);

      navigete("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="dashboard-mesero">
      <button
        className="menu-btn-mesero"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {" "}
        {menuAbierto ? <X /> : <Menu />}
      </button>
      <aside
        className={
          menuAbierto ? "sidebar-mesero activo" : "sidebar-mesero cerrado"
        }
      >
        <h2 className="logo-mesero">
          <HandPlatter />
          <span className="texto-menu">Panel mesero</span>
        </h2>

        <nav>
          <NavLink
            to="/mesero/mesas"
            className={({ isActive }) =>
              isActive ? "menu-mesero activo" : "menu-mesero"
            }
          >
            <Table />
            <span className="texto-menu">Mesas</span>
          </NavLink>

          <NavLink
            to="/mesero/pedidos"
            className={({ isActive }) =>
              isActive ? "menu-mesero activo" : "menu-mesero"
            }
          >
            <ClipboardList />
            <span className="texto-menu">Pedidos Activos</span>
          </NavLink>

          <button
            type="button"
            className="boton-logout-mesero"
            onClick={handleLogout}
          >
            <LogOut />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </aside>
    </div>
  );
}

export default SidebarMesero;
