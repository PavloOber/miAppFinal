import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    if (login(email)) {
      navigate("/gastos");
    } else {
      alert("Email no permitido");
    }
  };

  return (
    <div>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
      />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default Login;
