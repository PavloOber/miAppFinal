import { useState } from "react";
import { AuthContext } from "./authContext";
import { allowedEmails } from "../data/allowedEmails";

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);

  const login = (email) => {
    if (allowedEmails.some(allowed => allowed.toLowerCase() === email.toLowerCase())) {
      setUserEmail(email);
      return true;
    }
    return false;
  };

  const logout = () => setUserEmail(null);

  return (
    <AuthContext.Provider value={{ userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
