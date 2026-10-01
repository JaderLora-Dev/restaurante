export const formatearHora = (fecha) => {
  if (!fecha) return "";

  const date = new Date(fecha);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
