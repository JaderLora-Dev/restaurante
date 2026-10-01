import "../Estilos/SelectLimit.css";
function SelectLimit({ value, onChange }) {
  return (
    <div className="container-select">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
      </select>
    </div>
  );
}
export default SelectLimit;
