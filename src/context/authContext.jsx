import { useState, useEffect, createContext } from "react";
// Keep using the list of emails allowed to register
import { allowedEmails } from "../data/allowedEmails"; // Adjust path if needed
import bcrypt from 'bcryptjs';

export const AuthContext = createContext(null); // Export context directly

// Key for localStorage
const STORAGE_KEY = "registeredUsers";

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);

  // Load initial state from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("currentUserEmail");
    if (storedEmail) {
      try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (users.some(u => u.email.toLowerCase() === storedEmail.toLowerCase())) {
          setUserEmail(storedEmail);
        } else {
          // Clear invalid stored email if user not found in the list (e.g., list was cleared/modified)
          localStorage.removeItem("currentUserEmail");
        }
      } catch (error) {
        console.error("Error parsing registered users from localStorage on initial load:", error);
        // Clear stored email if parsing fails (data might be corrupted)
        localStorage.removeItem("currentUserEmail");
      }
    }
  }, []);

  const getRegisteredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      console.error("Error parsing registered users from localStorage:", error);
      return []; // Return an empty array or handle as appropriate
    }
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
    // Store hashed password
    const salt = bcrypt.genSaltSync(10); // Cost factor of 10
    const hashedPassword = bcrypt.hashSync(password, salt);
    users.push({ email: emailLower, password: hashedPassword });
    saveRegisteredUsers(users);
    return { success: true, message: "Registro exitoso." };
  };

  const login = (email, password) => {
    const emailLower = email.toLowerCase();
    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === emailLower);


    // Check if user exists and compare submitted password with stored hash
    if (user && bcrypt.compareSync(password, user.password)) {
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

  const isAuthenticated = !!userEmail;

  return (
    <AuthContext.Provider value={{ userEmail, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
