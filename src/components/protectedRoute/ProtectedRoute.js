import { Navigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Optional: Add a spinner or loading component

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
