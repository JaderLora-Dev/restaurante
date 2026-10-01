import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Table,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import "../Estilos/Sidebar.css";
import { useAuth } from "../context/AuthContext";
import { cerrarSesion } from "../services/authService";

export default function Sidebar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { setUsuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await cerrarSesion();

      setUsuario(null);

      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  return (
    <div>
      <button
        className="menu-btn"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {menuAbierto ? <X /> : <Menu />}
      </button>
      <aside className={menuAbierto ? "sidebar activo" : "sidebar cerrado"}>
        <h2 className="logo">
          <ChefHat />
          <span className="texto-menu">Restaurante</span>
        </h2>
        <nav>
          <NavLink
            to={"/admin"}
            end
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <LayoutDashboard />
            <span className="texto-menu">Dashborad</span>
          </NavLink>

          <NavLink
            to={"/admin/productos"}
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <UtensilsCrossed />
            <span className="texto-menu">Productos</span>
          </NavLink>

          <NavLink
            to={"/admin/categorias"}
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <LayoutGrid />
            <span className="texto-menu">Categorias</span>
          </NavLink>

          <NavLink
            to={"/admin/mesas"}
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <Table />
            <span className="texto-menu">Mesas</span>
          </NavLink>

          <NavLink
            to={"/admin/pedidos"}
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <ClipboardList />
            <span className="texto-menu">Pedidos</span>
          </NavLink>

          <NavLink
            to="/admin/pagos"
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <Wallet />
            <span className="texto-menu">Pagos</span>
          </NavLink>

          <NavLink
            to={"/admin/usuarios"}
            className={({ isActive }) =>
              isActive ? "menu-link activo" : "menu-link"
            }
          >
            <Users />
            <span className="texto-menu">Usuarios</span>
          </NavLink>

          <button
            type="button"
            className="boton-logout"
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
