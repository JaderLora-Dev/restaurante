import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function PrivateRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div>
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
