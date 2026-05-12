import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiFeather, FiGithub, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(form);
      login(response);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page-wrapper">
        <div className="auth-left-panel d-none d-lg-flex col-lg-5">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Link to="/" className="d-flex align-items-center gap-3 mb-5 text-white text-decoration-none">
              <div className="bg-white bg-opacity-20 p-2 rounded-3 backdrop-blur">
                <FiFeather size={28} />
              </div>
              <span className="h3 mb-0 fw-800 letter-spacing-2">InkWell</span>
            </Link>
            <h1 className="display-4 fw-800 mb-4 serif" style={{ lineHeight: 1.1 }}>
              Where Your <span className="text-white">Narrative</span> Begins.
            </h1>
            <p className="opacity-80 mb-5 fs-5 fw-500" style={{ maxWidth: 420 }}>
              Join a sanctuary for high-fidelity stories and independent voices.
            </p>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex -space-x-3">
                {[1,2,3,4].map(i => (
                   <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="user" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', marginLeft: i > 1 ? -12 : 0 }} />
                ))}
              </div>
              <span className="small opacity-75 fw-600">Join 10k+ readers worldwide</span>
            </div>
          </motion.div>
        </div>

        <div className="auth-right-panel">
          <motion.div 
            className="auth-card-inner" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-5 d-lg-none">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
                 <FiFeather size={32} className="text-primary" />
                 <span className="h4 mb-0 fw-800 text-dark">InkWell</span>
              </Link>
            </div>

            <h2 className="fw-800 mb-2 serif">Welcome Back</h2>
            <p className="text-secondary mb-5 fw-500">Sign in to continue your journey.</p>

            {error && <Alert variant="danger" className="mb-4 border-0 shadow-sm rounded-4">{error}</Alert>}

            <form onSubmit={onSubmit} className="d-grid gap-4">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  className="form-control"
                  placeholder="name@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-primary small text-decoration-none fw-600">Forgot?</Link>
                </div>
                <div className="input-group">
                  <input
                    className="form-control"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              
              <button className="btn btn-primary btn-lg mt-3 w-100 shadow-lg" type="submit" disabled={loading}>
                {loading ? 'Authenticating...' : <>Log In <FiArrowRight /></>}
              </button>
            </form>

            <div className="position-relative text-center my-5">
               <hr className="opacity-10" />
               <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-700 letter-spacing-1" style={{ background: 'var(--ink-surface)' }}>
                 OR
               </span>
            </div>

            <div className="d-flex gap-3">
              <a className="btn btn-light flex-fill shadow-sm py-3 border" href={authService.oauthUrl('google')}>
                <FcGoogle size={20} /> <span className="d-none d-sm-inline">Google</span>
              </a>
              <a className="btn btn-light flex-fill shadow-sm py-3 border" href={authService.oauthUrl('github')}>
                <FiGithub size={20} /> <span className="d-none d-sm-inline">GitHub</span>
              </a>
            </div>

            <p className="text-center text-secondary mt-5 mb-0">
              New here? <Link to="/register" className="text-primary fw-700 text-decoration-none">Create account</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default LoginPage;
