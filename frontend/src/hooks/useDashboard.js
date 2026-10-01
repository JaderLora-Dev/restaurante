import { useEffect, useState } from "react";
import {
  mostrarProductosTop,
  mostrarResumen,
  mostrarTopMeseros,
  mostrarUltimosProductos,
  mostrarVentasDia,
  mostrarVentasMes,
  mostrarVentasSemana,
} from "../services/dashboardService";

export default function useDashboard(fechaInicio, fechaFin) {
  //resumen
  const [resumen, setResumen] = useState({});

  //ventas
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasSemana, setVentasSemana] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);

  //datos generales
  const [productoTop, setProductoTop] = useState([]);
  const [meseroTop, setMeseroTop] = useState([]);
  const [ultimosPedidos, setUltimisPedidos] = useState([]);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const data = await mostrarResumen();

        setResumen(data);
      } catch (error) {
        console.error("Error al cargar resumen", error);
      }
    };

    cargarResumen();
  }, []);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const [dia, semana, mes] = await Promise.all([
          mostrarVentasDia(fechaInicio, fechaFin),
          mostrarVentasSemana(fechaInicio, fechaFin),
          mostrarVentasMes(fechaInicio, fechaFin),
        ]);

        setVentasDia(dia);
        setVentasSemana(semana);
        setVentasMes(mes);
      } catch (error) {
        console.error("Error al cargar ventas", error);
      }
    };
    cargarVentas();
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    const cargarDatosGenerales = async () => {
      try {
        const [productoTop, meseros, pedidos] = await Promise.all([
          mostrarProductosTop(),
          mostrarTopMeseros(),
          mostrarUltimosProductos(),
        ]);

        setProductoTop(productoTop);
        setMeseroTop(meseros);
        setUltimisPedidos(pedidos);
      } catch (error) {
        console.error("Error al cargar datos generales:", error);
      }
    };
    cargarDatosGenerales();
  }, []);

  return {
    resumen,
    ventasDia,
    ventasSemana,
    ventasMes,
    productoTop,
    meseroTop,
    ultimosPedidos,
  };
}
