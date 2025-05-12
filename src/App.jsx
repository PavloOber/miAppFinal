import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import AuthGuard from "./utils/authGuard";

import Navbar from "./components/Navbar";
import Home from "./pages/home";
import Familia from "./pages/Familia";
import Gastos from "./pages/Gastos";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/familia"
            element={
              <AuthGuard>
                <Familia />
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
