import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const AuthGuard = ({ children }) => {
  const { userEmail } = useAuth();

  return userEmail ? children : <Navigate to="/" />;
};

export default AuthGuard;
