import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authProvider } from "../authProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

// Définissez une interface pour l'objet utilisateur
interface User {
  role?: string;
  // Ajoutez d'autres propriétés si nécessaire
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean | null;
    userRole: string | null;
  }>({
    isAuthenticated: null,
    userRole: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { authenticated } = await authProvider.check();
        if (authenticated) {
          const user = await authProvider.getIdentity?.();
          setAuthState({
            isAuthenticated: true,
            userRole: (user as User)?.role || null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            userRole: null,
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthState({
          isAuthenticated: false,
          userRole: null,
        });
      }
    };
    checkAuth();
  }, []);

  if (authState.isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && authState.userRole && !roles.includes(authState.userRole)) {
    // Redirect to an appropriate page if the user doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;