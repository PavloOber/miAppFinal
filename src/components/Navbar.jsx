import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { userEmail, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/gastos">Gastos</Link>
      {userEmail && <Link to="/familia">Familia</Link>}
      {userEmail ? (
        <button onClick={logout}>Cerar sesión</button>
      ) : (
        <Link to="/login">Iniciar sesión</Link>
      )}
    </nav>
  );
};

export default Navbar;
