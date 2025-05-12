import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { GastosProvider } from "./context/gastosContext"; 
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
      {/* GastosProvider provides shared expense data to authenticated routes */}
      <GastosProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public route */}
            <Route path="/" element={<Home />} />

            {/* Routes only for non-authenticated users */}
            <Route
              path="/login"
              element={<PublicOnlyGuard><Login /></PublicOnlyGuard>}
            />
            <Route
              path="/register"
              element={<PublicOnlyGuard><Register /></PublicOnlyGuard>}
            />

            {/* Routes only for authenticated users (now have access to GastosContext) */}
            <Route
              path="/gastos"
              element={<AuthGuard><Gastos /></AuthGuard>}
            />
            <Route
              path="/familia"
              element={<AuthGuard><Familia /></AuthGuard>}
            />

            {/* Add other routes and decide protection level */}

            {/* Optional: Catch-all route for 404 or redirect */}
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          </Routes>
        </Router>
      </GastosProvider>
    </AuthProvider>
  );
}

export default App;
