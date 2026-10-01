import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Pedido from "../pages/Pedido.jsx";
import Mesas from "../pages/admin/Mesas.jsx";
import Productos from "../pages/admin/Productos.jsx";
import Categorias from "../pages/admin/Categorias.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import RoleRoute from "../components/RoleRoute.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import MeseroLayout from "../layouts/MeseroLayout.jsx";
import MesaMesero from "../components/MesaMesero.jsx";
import PedidosActivos from "../components/PedidosActivos.jsx";
import Usuarios from "../pages/admin/Usuarios.jsx";
import Pedidos from "../pages/admin/pedidos.jsx";
import HistorialPagos from "../components/HistorialPagos.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function AppRoutes() {
  const { usuario, cargando } = useAuth;

  if (cargando) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  let redireccion = "/login";

  if (usuario?.rol === "admin") {
    redireccion = "/admin";
  } else if (usuario?.rol === "mesero") {
    redireccion = "/mesero/mesas";
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={redireccion} />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/*panel admin*/}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route
          index
          element={<Dashboard />}
        />
        <Route
          path="mesas"
          element={<Mesas />}
        />
        <Route
          path="usuarios"
          element={<Usuarios />}
        />
        <Route
          path="pagos"
          element={<HistorialPagos />}
        />
        <Route
          path="pedidos"
          element={<Pedidos />}
        />
        <Route
          path="categorias"
          element={<Categorias />}
        />
        <Route
          path="productos"
          element={<Productos />}
        />
      </Route>

      {/*sidebar del mesero */}
      <Route
        path="/mesero"
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={["mesero", "admin"]}>
              <MeseroLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="mesas"
              replace
            />
          }
        />
        <Route
          path="mesas"
          element={<MesaMesero />}
        />

        <Route
          path="pedidos"
          element={<PedidosActivos />}
        />
      </Route>

      {/* pedido */}
      <Route
        path="/pedido/:idMesa"
        element={
          <PrivateRoute>
            <RoleRoute rolesPermitidos={["mesero"]}>
              <Pedido />
            </RoleRoute>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
