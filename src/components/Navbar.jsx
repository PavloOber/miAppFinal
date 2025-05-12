import { Link } from "react-router-dom";
import { useContext } from 'react'; // Import useContext
// import { useAuth } from "../context/useAuth"; // Remove useAuth import
import { AuthContext } from "../context/authContext"; // Import AuthContext WITHOUT extension

const Navbar = () => {
  // const { userEmail, logout } = useAuth();
  const { userEmail, logout } = useContext(AuthContext); // Use useContext

  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/gastos">Gastos</Link>
      {/* Conditionally show Familia link based on login status */}
      {userEmail && <Link to="/familia">Familia</Link>}
      {userEmail ? (
        <>
          <span>Bienvenido, {userEmail}</span> {/* Optional: Display user email */}
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register">Registrarse</Link> {/* Added Register link */}
        </>
      )}
    </nav>
  );
};

export default Navbar;
