import { useMemo, useState } from "react";
import GraficaVentas from "../../components/GraficaVentas.jsx";
import {
  calcularTotalVentas,
  formatearMoneda,
  prepararDatosGrafica,
} from "../../utils/dashboardUtils.js";
import {
  ChartNoAxesCombined,
  ClipboardList,
  DollarSign,
  Hamburger,
  Table,
  Users,
} from "lucide-react";
import "../../Estilos/Dashboard.css";
import useDashboard from "../../hooks/useDashboard.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import UltimosPedidos from "../../components/UltimosPedidos.jsx";
import ProductosTop from "../../components/ProductosTop.jsx";
import MeserosTop from "../../components/MeserosTop.jsx";

export default function Dashboard() {
  const [tipoGrafica, setTipoGrafica] = useState("dia");

  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );

  const {
    resumen,
    ventasDia,
    ventasSemana,
    ventasMes,
    meseroTop,
    productoTop,
    ultimosPedidos,
  } = useDashboard(fechaInicio, fechaFin);

  //obtener los datos de la grafica
  const datosGraficaActual = useMemo(
    () => prepararDatosGrafica(tipoGrafica, ventasDia, ventasSemana, ventasMes),
    [tipoGrafica, ventasDia, ventasSemana, ventasMes],
  );

  const totalFormateado = formatearMoneda(
    calcularTotalVentas(datosGraficaActual),
  );

  return (
    <div>
      <header className="header-dashborad">
        <h1>Dashboard</h1>
      </header>
      <div className="contenedor-padre-dashboard">
        <section className="container-cards">
          <DashboardCard
            icon={DollarSign}
            titulo={"Ventas hoy"}
            valor={Number(resumen.ventasHoy).toLocaleString("es-CO")}
            clase="ico-ventasHoy"
            numeroText="text-numero-ventasHoy"
            claseInterna="card-interno-ventasHoy"
          />
          <DashboardCard
            icon={ClipboardList}
            titulo={"Pedidos hoy"}
            valor={resumen.pedidos}
            clase="ico-pedidos"
            numeroText="text-numero-pedidos"
            claseInterna="card-interno-pedidos"
          />

          <DashboardCard
            icon={Table}
            titulo={"Mesas"}
            valor={resumen.mesas}
            clase="ico-mesa"
            numeroText="text-numero-mesa"
            claseInterna="card-interno-mesa"
          />

          <DashboardCard
            icon={Users}
            titulo={"Usuarios"}
            valor={resumen.usuarios}
            clase="ico-usuarios"
            numeroText="text-numero-usuarios"
            claseInterna="card-interno-usuarios"
          />

          <DashboardCard
            icon={Hamburger}
            titulo={"Productos vendidos"}
            valor={resumen.productosHoy}
            clase="ico-productos"
            numeroText="text-numero-productos"
            claseInterna="card-interno-productos"
          />

          <DashboardCard
            icon={Table}
            titulo={"Mesas Disponibles"}
            valor={resumen.mesasDisponibles}
            clase="ico-mesaD"
            numeroText="text-numero-mesaD"
            claseInterna="card-interno-mesaD"
          />
        </section>

        <section className="grafica-dashboard">
          <div className="contenedor-titulos-dashboard">
            <h3>
              {tipoGrafica === "dia" && "Ventas Por Día"}
              {tipoGrafica === "semana" && "Ventas por Semanas"}
              {tipoGrafica === "mes" && "Ventas Mensuales"}
            </h3>

            <select
              className="opciones-texto"
              value={tipoGrafica}
              onChange={(e) => setTipoGrafica(e.target.value)}
            >
              <option value="dia">Por Día</option>
              <option value="semana">Por Semana</option>
              <option value="mes">Por Mes</option>
            </select>
          </div>

          <div className="contenedor-filtros">
            <div>
              <label>Desde </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label> Hasta </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
          <div className="container-total-ventas">
            <span className="icono-graficas">
              <ChartNoAxesCombined />
            </span>
            <div className="total-ventas-interno">
              <span className="text-total-ventas">Total de ventas</span>
              <span className="numero-total-ventas">{totalFormateado}</span>
            </div>
          </div>
          <GraficaVentas data={datosGraficaActual} />
        </section>
        <section className="dashboard-ultimosPedidos">
          <UltimosPedidos pedidos={ultimosPedidos} />
        </section>
        <section className="dashboard-productoTop">
          <ProductosTop productos={productoTop} />
        </section>
        <section className="container-productos-meseros">
          <MeserosTop meseros={meseroTop} />
        </section>
      </div>
    </div>
  );
}
