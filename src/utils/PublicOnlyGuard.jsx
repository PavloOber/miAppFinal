import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const PublicOnlyGuard = ({ children }) => {
  const { userEmail } = useContext(AuthContext);

  // If user IS logged in, redirect them away from public-only pages (like login/register)
  // Redirect to home ('/') or another default page like '/gastos'
  return userEmail ? <Navigate to="/" replace /> : children;
};

export default PublicOnlyGuard;
