import { Header } from "./Header";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

function ConnectedHeader() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Header 
      isAuthenticated={isAuthenticated} 
      onLoginClick={() => navigate("/login")} 
    />
  );
}

export { ConnectedHeader }