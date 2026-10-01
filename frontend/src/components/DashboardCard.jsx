import "../Estilos/DashboardCard.css";

export default function DashboardCard({
  icon: Icon,
  titulo,
  valor,
  clase,
  claseInterna,
  numeroText,
}) {
  return (
    <div className="cards-dashboard">
      <span className={clase}>
        <Icon />
      </span>

      <div className={claseInterna}>
        <span> {titulo} </span>
        <span className={numeroText}> {valor} </span>
      </div>
    </div>
  );
}
