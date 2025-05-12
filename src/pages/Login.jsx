import { useState, useContext } from "react"; // Added useContext
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/useAuth"; // Assuming this is replaced by direct context usage
import { AuthContext } from "../context/authContext"; // Import AuthContext

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Added password state
  const [error, setError] = useState("");      // Added error state
  const navigate = useNavigate();
  // const { login } = useAuth();
  const { login } = useContext(AuthContext); // Use AuthContext

  const handleLogin = async (e) => { // Make it async if login can be async, and accept event for preventDefault
    e.preventDefault(); // Prevent form submission from reloading page
    setError(""); // Clear previous errors

    if (!email || !password) {
        setError("Por favor, ingresa email y contraseña.");
        return;
    }

    try {
      const result = login(email, password); // Pass email and password
      if (result.success) {
        navigate("/gastos"); // Or to a dashboard, or home
      } else {
        setError(result.message || "Email o contraseña incorrectos.");
      }
    } catch (err) {
      // This catch might not be necessary if login always returns an object
      setError("Ocurrió un error inesperado durante el inicio de sesión.");
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p>
        ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
      </p>
    </div>
  );
};

export default Login;
