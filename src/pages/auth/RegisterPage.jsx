import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiFeather, FiArrowRight, FiUploadCloud, FiShield, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import authService from '../../services/authService';
import mediaService from '../../services/mediaService';
import { useAuth } from '../../hooks/useAuth';

function RegisterPage({ adminMode = false }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: adminMode ? 'ADMIN' : 'READER',
    adminKey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      let avatarUrl = '';
      if (avatarFile) {
        try {
          const uploaded = await mediaService.upload({
            uploaderId: 0,
            file: avatarFile,
            altText: `${form.username || 'user'} avatar`,
          });
          avatarUrl = uploaded?.url || '';
        } catch (e) {
          console.error('Avatar upload failed', e);
        }
      }

      const payload = { ...form, avatarUrl };
      const response = adminMode
        ? await authService.registerAdmin(payload)
        : await authService.register(payload);

      login(response);
      navigate(adminMode ? '/admin' : form.role === 'AUTHOR' ? '/dashboard' : '/reader-dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page-wrapper">
        <div className="auth-left-panel d-none d-lg-flex col-lg-5" style={{ background: adminMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'var(--ink-gradient)' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Link to="/" className="d-flex align-items-center gap-3 mb-5 text-white text-decoration-none">
              <div className="bg-white bg-opacity-20 p-2 rounded-3 backdrop-blur">
                <FiFeather size={28} />
              </div>
              <span className="h3 mb-0 fw-800 letter-spacing-2">InkWell</span>
            </Link>
            <h1 className="display-4 fw-800 mb-4 serif" style={{ lineHeight: 1.1 }}>
              {adminMode ? 'Secure Admin Control.' : 'Start Your Creative Journey.'}
            </h1>
            <p className="opacity-80 mb-5 fs-5 fw-500" style={{ maxWidth: 420 }}>
              {adminMode 
                ? 'Authorized access for platform management and ecosystem oversight.' 
                : 'Join our community of readers and writers. Read what you love, write what you know.'}
            </p>
            
            <div className="card bg-white bg-opacity-10 border-0 p-4 text-white backdrop-blur shadow-sm rounded-4">
              <h6 className="fw-800 mb-3 d-flex align-items-center gap-2">
                 {adminMode ? <FiShield className="text-warning" /> : <FiUser className="text-info" />} 
                 {adminMode ? 'Administrator Access' : 'Member Privileges'}
              </h6>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-3 opacity-80 fw-500" style={{ fontSize: '0.95rem' }}>
                {adminMode ? (
                  <>
                    <li className="d-flex align-items-center gap-2">✓ User & Content Moderation</li>
                    <li className="d-flex align-items-center gap-2">✓ Platform Growth Analytics</li>
                    <li className="d-flex align-items-center gap-2">✓ Category & Tag Management</li>
                  </>
                ) : (
                  <>
                    <li className="d-flex align-items-center gap-2">✓ Discover High-Quality Content</li>
                    <li className="d-flex align-items-center gap-2">✓ Build Your Own Audience</li>
                    <li className="d-flex align-items-center gap-2">✓ Engage with Top Creators</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        </div>

        <div className="auth-right-panel py-5">
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

            <div className="d-flex justify-content-between align-items-start mb-5">
               <div>
                  <h2 className="fw-800 mb-2 serif">{adminMode ? 'Admin Portal' : 'Create Account'}</h2>
                  <p className="text-secondary mb-0 fw-500">Join the InkWell community today.</p>
               </div>
               <Link to={adminMode ? '/register' : '/register/admin'} className={`btn btn-sm ${adminMode ? 'btn-light border text-primary' : 'btn-light border text-danger'} rounded-pill px-3 shadow-none fw-700`}>
                  {adminMode ? 'User Mode' : 'Admin Mode'}
               </Link>
            </div>

            {error && <Alert variant="danger" className="mb-4 border-0 shadow-sm rounded-4">{error}</Alert>}

            <form className="d-grid gap-4" onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" placeholder="John Doe" required value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Username</label>
                  <input className="form-control" placeholder="johndoe" required minLength={3} value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} />
                </div>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input className="form-control" type="email" placeholder="name@example.com" required value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              </div>
              
              <div>
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input className="form-control" type={showPassword ? 'text' : 'password'} minLength={6} placeholder="Min. 6 characters" required value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
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

              <div>
                <label className="form-label">Profile Avatar <span className="text-muted fw-normal">(Optional)</span></label>
                <div className="position-relative">
                  <input 
                    className="form-control" 
                    type="file" 
                    accept="image/*" 
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} 
                    style={{ paddingLeft: '3rem' }}
                  />
                  <FiUploadCloud className="text-muted position-absolute" size={20} style={{ top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {adminMode ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <label className="form-label text-danger">Security Verification Key</label>
                  <div className="input-group">
                    <input
                      className="form-control border-danger"
                      placeholder="Admin registration key"
                      required
                      type={showAdminKey ? 'text' : 'password'}
                      value={form.adminKey}
                      onChange={(event) => setForm((prev) => ({ ...prev, adminKey: event.target.value }))}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAdminKey((prev) => !prev)}
                      aria-label={showAdminKey ? 'Hide admin key' : 'Show admin key'}
                    >
                      {showAdminKey ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div>
                  <label className="form-label">Account Type</label>
                  <select className="form-select form-control" style={{ background: 'var(--ink-surface-2)' }} value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
                    <option value="READER">Reader — Discover & Discuss</option>
                    <option value="AUTHOR">Author — Write & Publish</option>
                  </select>
                </div>
              )}

              <button className={`btn ${adminMode ? 'btn-danger' : 'btn-primary'} btn-lg mt-3 w-100 shadow-lg`} disabled={loading}>
                {loading ? 'Processing...' : <>{adminMode ? 'Create Admin Account' : 'Get Started'} <FiArrowRight /></>}
              </button>
            </form>

            <p className="text-center text-secondary mt-5 mb-0">
              Already have an account? <Link to="/login" className="text-primary fw-700 text-decoration-none">Log in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default RegisterPage;
