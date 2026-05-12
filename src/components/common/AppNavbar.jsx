import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FiMoon, FiSun, FiFeather, FiUser, FiLogOut, FiGrid, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import NotificationBell from './NotificationBell';

function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = () => { logout(); navigate('/'); };

  const dashboardPath = user?.role === 'ADMIN' ? '/admin'
    : user?.role === 'AUTHOR' ? '/dashboard'
    : '/reader-dashboard';

  return (
    <Navbar expand="lg" className="inkwell-navbar shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
          >
            <div className="bg-primary p-1 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <FiFeather size={20} color="white" />
            </div>
          </motion.div>
          <span className="navbar-brand mb-0">InkWell</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="inkwell-nav"
          onClick={() => setMenuOpen(!menuOpen)}
          className="border-0"
        />

        <Navbar.Collapse id="inkwell-nav">
          <Nav className="mx-auto gap-2">
            <Nav.Link as={NavLink} to="/" end className="px-3">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/search" className="px-3 d-flex align-items-center gap-1">
              <FiSearch size={16} /> Search
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={NavLink} to={dashboardPath} className="px-3 d-flex align-items-center gap-1">
                <FiGrid size={16} /> {user?.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
              </Nav.Link>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <motion.div
              className="theme-toggle"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <NotificationBell />
                <Link
                  className="btn btn-outline-secondary btn-sm px-3"
                  to={`/author/${user?.id}`}
                >
                  <FiUser size={14} />
                  <span className="d-none d-xl-inline ms-1">{user?.username}</span>
                </Link>
                <motion.button
                  className="btn btn-danger btn-sm px-3"
                  onClick={onLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiLogOut size={14} />
                  <span className="d-none d-xl-inline ms-1">Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-link text-decoration-none fw-600" to="/login">Login</Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link className="btn btn-primary px-4 shadow-sm" to="/register">
                    Join Now
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
