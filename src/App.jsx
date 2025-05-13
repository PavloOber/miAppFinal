import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { GastosProvider } from "./context/gastosContext"; 
import { FamiliaProvider } from './context/familiaContext'; 
import AuthGuard from "./utils/authGuard";
import PublicOnlyGuard from "./utils/PublicOnlyGuard"; 

import Navbar from "./components/Navbar";
import Home from "./pages/home";
import Familia from "./pages/Familia";
import Gastos from "./pages/Gastos";
import Login from "./pages/Login";
import Register from "./pages/Register"; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        {/* Place providers here so context is available to all routes below */}
        <GastosProvider>
          <FamiliaProvider>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<Home />} />

              {/* --- Routes only for non-authenticated users --- */}
              <Route
                path="/login"
                element={<PublicOnlyGuard><Login /></PublicOnlyGuard>}
              />
              <Route
                path="/register"
                element={<PublicOnlyGuard><Register /></PublicOnlyGuard>}
              />

              {/* --- Routes only for authenticated users --- */}
              <Route
                path="/gastos"
                element={<AuthGuard><Gastos /></AuthGuard>}
              />
              <Route
                path="/familia"
                element={<AuthGuard><Familia /></AuthGuard>}
              />

              {/* Optional: Catch-all route for 404 or redirect */}
              {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
            </Routes>
          </FamiliaProvider>
        </GastosProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
