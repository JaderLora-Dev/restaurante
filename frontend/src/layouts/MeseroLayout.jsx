import { Outlet } from "react-router-dom";

import SidebarMesero from "../components/SidebarMesero.jsx";

function MeseroLayout() {
  return (
    <div className="layout">
      <SidebarMesero />

      <main className="content-mesero">
        <Outlet />
      </main>
    </div>
  );
}

export default MeseroLayout;
