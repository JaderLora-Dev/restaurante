import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

export default function GraficaVentas({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  const chartData = {
    // Lee directamente la propiedad 'name' generada por el Dashboard
    labels: safeData.map((item) => item.name || ""),
    datasets: [
      {
        label: "Ventas",
        data: safeData.map((item) => Number(item.total || 0)),
        borderColor: "rgb(103, 28, 252)",
        backgroundColor: "rgba(103, 28, 252, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  if (safeData.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        No hay datos para mostrar
      </p>
    );
  }

  return <Line data={chartData} />;
}
