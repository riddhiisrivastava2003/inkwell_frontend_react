import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';

function NotFoundPage() {
  return (
    <PageTransition>
      <div className="container py-5">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="col-md-6 text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-5"
            >
               <div className="display-1 fw-bold gradient-text mb-0" style={{ fontSize: '8rem', letterSpacing: '-0.05em' }}>404</div>
               <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-danger bg-opacity-10 text-danger fw-bold small">
                  <FiAlertCircle /> Page Not Found
               </div>
            </motion.div>
            
            <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.02em' }}>Lost in space?</h2>
            <p className="text-secondary mb-5 px-lg-5" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
               It looks like you've taken a wrong turn. The page you're searching for has been moved or doesn't exist anymore.
            </p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg d-inline-flex align-items-center gap-2">
                <FiHome /> Return to Homepage
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default NotFoundPage;
