export const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);

export const calcularTotalVentas = (datos) => {
  return datos.reduce((total, item) => {
    return total + Number(item.total);
  }, 0);
};

export const formatearDia = (fecha) => {
  if (!fecha) return " Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
};

export const obtenerRangoSemana = (semana) => {
  const diasASumar = (Number(semana) - 1) * 7;

  const inicio = new Date(2026, 0, 1 + diasASumar);
  const fin = new Date(2026, 0, 1 + diasASumar + 6);

  return `${inicio.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  })} - ${fin.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  })}`;
};

export const formatearMes = (mes) => {
  const meses = [
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return meses[Number(mes)] || "Mes";
};

export const prepararDatosGrafica = (
  tipoGrafica,
  ventasDia,
  ventasSemana,
  ventasMes,
) => {
  const configuraciones = {
    dia: ventasDia.map((item) => ({
      ...item,
      name: formatearDia(item.dia),
      total: Number(item.total),
    })),

    semana: ventasSemana.map((item) => ({
      ...item,
      name: obtenerRangoSemana(item.semana),
      total: Number(item.total),
    })),

    mes: ventasMes.map((item) => ({
      ...item,
      name: formatearMes(item.mes),
      total: Number(item.total),
    })),
  };

  return configuraciones[tipoGrafica] || [];
};
