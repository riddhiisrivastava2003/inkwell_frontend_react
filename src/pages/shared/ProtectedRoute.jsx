import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isChecking, user } = useAuth();
  const location = useLocation();

  if (isChecking) return <Loader text="Checking session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

