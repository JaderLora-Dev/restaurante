import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

export default function RoleRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div>
        {" "}
        <Spinner />
      </div>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}
