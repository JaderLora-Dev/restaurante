import { ChevronLeft, ChevronRight } from "lucide-react";
import "../Estilos/Paginacion.css";

function Paginacion({ pagina, totalPaginas, onPageChange }) {
  const obtenerPaginas = () => {
    // Si hay pocas páginas, mostrar todas
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, index) => index + 1);
    }

    const paginas = [];

    // Primera página
    paginas.push(1);

    // Puntos después de la primera
    if (pagina > 4) {
      paginas.push("...");
    }

    // Páginas alrededor de la actual
    const inicio = Math.max(2, pagina - 1);
    const fin = Math.min(totalPaginas - 1, pagina + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    // Puntos antes de la última
    if (pagina < totalPaginas - 3) {
      paginas.push("...");
    }

    // Última página
    paginas.push(totalPaginas);

    return paginas;
  };

  const paginas = obtenerPaginas();

  return (
    <div className="paginacion-container">
      <button
        disabled={pagina === 1}
        onClick={() => onPageChange(pagina - 1)}
      >
        <ChevronLeft className="icono-chevron" />
      </button>

      <span className="paginas">
        {paginas.map((numero, index) =>
          numero === "..." ? (
            <span
              className="puntos"
              key={`puntos-${index}`}
            >
              ...
            </span>
          ) : (
            <button
              className={numero === pagina ? "activo" : ""}
              key={numero}
              onClick={() => onPageChange(numero)}
            >
              {numero}
            </button>
          ),
        )}
      </span>

      <button
        disabled={pagina === totalPaginas}
        onClick={() => onPageChange(pagina + 1)}
      >
        <ChevronRight className="icono-chevron" />
      </button>
    </div>
  );
}

export default Paginacion;
