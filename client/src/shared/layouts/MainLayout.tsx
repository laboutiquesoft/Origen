import { Outlet } from "react-router-dom";
import { ConnectedHeader } from "../components/header/HeaderContainer";

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      {/* Header unificado con Tailwind y tus variables CSS */}
      <ConnectedHeader />

      <main>
        <Outlet />
      </main>
    </div>
  );
}