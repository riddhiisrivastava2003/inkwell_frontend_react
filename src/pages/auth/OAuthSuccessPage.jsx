import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

function OAuthSuccessPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        const token = params.get('token');
        const userId = params.get('userId');
        const email = params.get('email');
        const username = params.get('username');
        const role = params.get('role');
        const response = token ? { token, userId: Number(userId), email, username, role } : await authService.oauthSuccess();
        login(response);
        navigate('/', { replace: true });
      } catch (_error) {
        toast.error('OAuth login failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };
    run();
  }, [login, navigate, params]);

  return <Loader text="Completing social login..." />;
}

export default OAuthSuccessPage;
