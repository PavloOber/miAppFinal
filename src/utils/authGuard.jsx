import { useContext } from 'react'; // Import useContext
import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/useAuth"; // Assuming replaced by direct context
import { AuthContext } from "../context/authContext"; // Import AuthContext

const AuthGuard = ({ children }) => {
  // const { userEmail } = useAuth();
  const { userEmail } = useContext(AuthContext); // Use AuthContext

  // If no userEmail, redirect to the login page
  return userEmail ? children : <Navigate to="/login" replace />;
};

export default AuthGuard;
