import { Search } from "lucide-react";
import "../Estilos/BuscarInput.css";

function BuscarInput({ value, placeholder = "Buscar...", onChange }) {
  return (
    <div className="container-input">
      <Search className="icono-buscar" />
      <input
        className="buscar-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default BuscarInput;
