import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/common/PageTransition';
import authService from '../../services/authService';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response?.message || 'If the email is registered, a reset link has been sent.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="container py-5" style={{ maxWidth: 520 }}>
        <h2 className="fw-bold mb-2">Forgot Password</h2>
        <p className="text-secondary mb-4">Enter your registered email to receive a password reset link.</p>

        {message ? <Alert variant="success">{message}</Alert> : null}
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <form onSubmit={onSubmit} className="d-grid gap-3">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-3">
          <Link to="/login" className="text-decoration-none">Back to Login</Link>
        </div>
      </div>
    </PageTransition>
  );
}

export default ForgotPasswordPage;
