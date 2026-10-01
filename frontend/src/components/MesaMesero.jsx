import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { mostrarMesas } from "../services/mesasService.js";
import { Circle, Table, UsersRound } from "lucide-react";
import "../Estilos/MesaMesero.css";
import Spinner from "./Spinner.jsx";
import { obtenerPedidoMesa } from "../services/pedidosService.js";
import { mostrarError } from "../utils/alertas.js";
function MesaMesero() {
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const cargarMesas = async () => {
    try {
      setCargando(true);
      const respuesta = await mostrarMesas();

      setMesas(respuesta);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  const handleEntrarMesa = async (idMesa) => {
    try {
      await obtenerPedidoMesa(idMesa);

      //solo llegar aqui si la consulta fue exitosa
      navigate(`/Pedido/${idMesa}`);
    } catch (error) {
      console.error(error);
      mostrarError(
        error?.response?.data.mensaje || "No puedes accceder a esta mesa.",
      );
    }
  };

  return (
    <section>
      <header className="header_panel-mesero">
        <h2 className="texto_panel">Panel Mesero</h2>
      </header>
      <div className="container-sesion">
        <h2>Lista de mesas</h2>
        {cargando ? (
          <Spinner />
        ) : (
          <div className="mesas_container">
            {mesas.map((m) => (
              <div
                key={m.idMesas}
                className={`mesa_card
              ${m.estado}
              `}
                onClick={() => handleEntrarMesa(m.idMesas)}
              >
                <div className={`mesas_iconos_estado icono-${m.estado}`}>
                  {m.estado === "Disponible" ? (
                    <Table className="mesa_table" />
                  ) : (
                    <UsersRound className="mesa_usersRo" />
                  )}
                  <h3 className="nombre_mesa"> Mesa {m.numero}</h3>
                </div>
                <p className={`texto_icono ${m.estado}`}>
                  {" "}
                  <Circle className="icono_estado" /> {m.estado}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MesaMesero;
