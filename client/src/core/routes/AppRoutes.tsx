import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../../shared/layouts/MainLayout";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import { HomePage } from "../../modules/home/pages/HomePage";
import { TenantsPage } from "../../modules/tenants/pages/TenantsPage";
import { Login, ForgotPasswordPage, ResetPasswordPage, AllmightyDashboard } from "../../modules/auth/pages/index";
import { useAuth } from "../../modules/auth/context/AuthContext";
import { Spinner } from "../../shared/components/index";
import { GlobalCataloguePage } from "../../modules/catalogues/pages/GlobalCataloguePage";

// 🔐 Guardia de Autenticación para rutas privadas
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner active={true} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner active={true} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roles = user?.roles || [];
  if (!roles.includes('AllMighty')) return <Navigate to="/dashboard-allmighty" replace />;
  return children;
};

const GlobalAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner active={true} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roles = user?.roles || [];
  if (!roles.includes('AllMighty') && !roles.includes('Admin')) return <Navigate to="/dashboard" replace />;
  return children;
};

// Guard that checks if user has access to a specific microservice
const MicroserviceRoute = ({ children, code }: { children: React.ReactNode; code: string }) => {
  const { isAuthenticated, isLoading, hasAccessToMicroservice } = useAuth();
  if (isLoading) return <Spinner active={true} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!hasAccessToMicroservice(code)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Rutas Públicas de la Landing (Usan MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* 2. Rutas de Publicas de Autenticación (Páginas limpias sin Layouts) */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* 3. Rutas Privadas / Aplicación (Usan DashboardLayout con Sidebar y TopBar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/allmighty-dashboard" element={<AllmightyDashboard />} />
          <Route path="/allmighty/tenants" element={<SuperAdminRoute><TenantsPage/></SuperAdminRoute>} />
          <Route path="/allmighty/global-catalogue" element={<SuperAdminRoute><GlobalCataloguePage/></SuperAdminRoute>} />
          
      

          {/* 📂 Módulo Registros Asistenciales */}
          <Route path="/assistance-records">
            <Route index element={<div>Métricas de Registros Asistenciales</div>} />
            <Route path="consents" element={<div>Consentimientos</div>} />
            <Route path="templates" element={<div>Plantillas</div>} />
            <Route path="documents" element={<div>Documentos</div>} />
            <Route path="formats" element={<div>Registros Qx</div>} />
          </Route>
        </Route>
      </Route>

      

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export { AppRoutes };