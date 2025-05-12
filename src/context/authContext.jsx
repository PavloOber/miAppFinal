import { useState, useEffect, createContext } from "react";
// Keep using the list of emails allowed to register
import { allowedEmails } from "../data/allowedEmails"; // Adjust path if needed

export const AuthContext = createContext(null); // Export context directly

// Key for localStorage
const STORAGE_KEY = "registeredUsers";

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);

  // Load initial state from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("currentUserEmail");
    if (storedEmail) {
      // Basic check: Does this email still exist in our 'registered' list?
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (users.some(u => u.email.toLowerCase() === storedEmail.toLowerCase())) {
         setUserEmail(storedEmail);
      }
      else {
        // Clear invalid stored email
        localStorage.removeItem("currentUserEmail");
      }
    }
  }, []);

  const getRegisteredUsers = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  };

  const saveRegisteredUsers = (users) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  const register = (email, password) => {
    const emailLower = email.toLowerCase();
    // 1. Check if email is allowed to register
    if (!allowedEmails.some(allowed => allowed.toLowerCase() === emailLower)) {
      return { success: false, message: "Email no permitido para registro." };
    }

    const users = getRegisteredUsers();
    // 2. Check if email is already registered
    if (users.some(user => user.email.toLowerCase() === emailLower)) {
      return { success: false, message: "Este email ya está registrado." };
    }

    // 3. Add new user (store email in lowercase for consistency)
    // !! INSECURE: Storing plain password in localStorage !!
    users.push({ email: emailLower, password: password });
    saveRegisteredUsers(users);
    return { success: true, message: "Registro exitoso." };
  };

  const login = (email, password) => {
    const emailLower = email.toLowerCase();
    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === emailLower);

    // Check if user exists and password matches
    // !! INSECURE: Comparing plain password !!
    if (user && user.password === password) {
      setUserEmail(user.email); // Use the stored email case
      localStorage.setItem("currentUserEmail", user.email);
      return { success: true };
    }

    // Login failed
    setUserEmail(null);
    localStorage.removeItem("currentUserEmail");
    return { success: false, message: "Email o contraseña incorrectos." };
  };

  const logout = () => {
    setUserEmail(null);
    localStorage.removeItem("currentUserEmail");
  };

  return (
    <AuthContext.Provider value={{ userEmail, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
