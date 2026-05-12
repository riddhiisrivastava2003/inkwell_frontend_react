import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';
import { FiUsers, FiFileText, FiMail, FiShield, FiTrendingUp, FiArrowRight, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import authService from '../../services/authService';
import postService from '../../services/postService';
import newsletterService from '../../services/newsletterService';

function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, posts: 0, subscribers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setError('');
        const [users, postAnalytics, subscriberCount] = await Promise.all([
          authService.getUsers(),
          postService.adminAnalytics(),
          newsletterService.getCount(),
        ]);
        setStats({
          users: users.length,
          posts: postAnalytics.totalPosts || 0,
          subscribers: subscriberCount.active || 0,
        });
      } catch (err) {
        setError('Failed to load platform data. Please ensure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const adminTiles = [
    { label: 'Platform Users', value: stats.users, icon: <FiUsers />, color: 'var(--ink-primary)', to: '/admin/users' },
    { label: 'Published Posts', value: stats.posts, icon: <FiFileText />, color: 'var(--ink-primary-2)', to: '/admin/posts' },
    { label: 'Newsletter subs', value: stats.subscribers, icon: <FiMail />, color: 'var(--ink-success)', to: '/admin/newsletter' },
  ];

  return (
    <PageTransition>
      <div className="py-5 mb-5 overflow-hidden position-relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', borderRadius: '0 0 2.5rem 2.5rem' }}>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at 15% 50%, rgba(129,140,248,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(99,102,241,0.1) 0%, transparent 40%)', pointerEvents: 'none' }}></div>
        <Container>
          <div className="d-flex align-items-center gap-4 position-relative">
             <div className="p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <FiShield size={32} className="text-white" />
             </div>
             <div>
                <span className="badge px-3 py-1 mb-2 fw-600" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>SYSTEM ADMINISTRATOR</span>
                <h2 className="display-6 fw-800 mb-0 text-white serif">Platform Control Center</h2>
             </div>
          </div>
        </Container>
      </div>

      <Container>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-danger shadow-sm mb-5 border-0 p-3 d-flex align-items-center gap-3" 
            style={{ borderRadius: '1rem' }}
          >
            <FiShield size={20} />
            <div className="fw-600">{error}</div>
          </motion.div>
        )}

        <Row className="g-4 mb-5">
          {adminTiles.map((tile, idx) => (
            <Col md={4} key={tile.label}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: '1.25rem', background: 'var(--ink-surface)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="small fw-800 text-uppercase letter-spacing-1" style={{ color: 'var(--ink-text-2)' }}>{tile.label}</div>
                    <div style={{ color: tile.color, background: `${tile.color}18`, padding: '12px', borderRadius: '14px' }}>
                      {React.cloneElement(tile.icon, { size: 24 })}
                    </div>
                  </div>
                  <h3 className="display-6 fw-800 mb-3" style={{ color: 'var(--ink-text)', letterSpacing: '-0.02em' }}>{tile.value.toLocaleString()}</h3>
                  <div className="mt-auto pt-2">
                     <Link to={tile.to} className="text-decoration-none small fw-bold d-flex align-items-center gap-2" style={{ color: tile.color }}>
                        Manage Database <FiArrowRight size={16} />
                     </Link>
                  </div>
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>

        <Row className="g-5">
           <Col lg={7}>
               <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: '1.25rem', background: 'var(--ink-surface)' }}>
                 <div className="d-flex justify-content-between align-items-center mb-5">
                    <h5 className="fw-800 mb-0 serif d-flex align-items-center gap-3" style={{ color: 'var(--ink-text)' }}>
                       <div className="p-2 rounded-3 shadow-sm" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--ink-primary)' }}><FiActivity size={20} /></div>
                       Platform Integrity
                    </h5>
                    <span className="badge px-3 py-2" style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--ink-success)', border: '1px solid rgba(5,150,105,0.3)', fontWeight: 600 }}>SYSTEMS ONLINE</span>
                 </div>
                 
                 <div className="d-grid gap-4">
                    <div className="p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                       <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-3 shadow-sm" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--ink-primary)' }}><FiShield /></div>
                          <div>
                             <div className="small fw-600" style={{ color: 'var(--ink-muted)' }}>Core Services</div>
                             <div className="fw-bold" style={{ color: 'var(--ink-text)' }}>API Gateway &amp; Auth</div>
                          </div>
                       </div>
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--ink-success)', boxShadow: '0 0 8px rgba(5,150,105,0.5)' }}></div>
                    </div>
                    <div className="p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                       <div className="d-flex align-items-center gap-3">
                          <div className="p-2 rounded-3 shadow-sm" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: '#06b6d4' }}><FiTrendingUp /></div>
                          <div>
                             <div className="small fw-600" style={{ color: 'var(--ink-muted)' }}>Content Engine</div>
                             <div className="fw-bold" style={{ color: 'var(--ink-text)' }}>Media &amp; Taxonomy</div>
                          </div>
                       </div>
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--ink-success)', boxShadow: '0 0 8px rgba(5,150,105,0.5)' }}></div>
                    </div>
                 </div>

                 <div className="mt-5 p-4 rounded-4 position-relative overflow-hidden" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                    <div className="position-relative">
                      <h6 className="fw-bold mb-3 serif" style={{ color: 'var(--ink-primary)' }}>Ecosystem Analytics</h6>
                      <p className="small mb-0 fw-500" style={{ lineHeight: '1.6', color: 'var(--ink-text-2)' }}>
                        The platform is experiencing a <span className="fw-bold" style={{ color: 'var(--ink-primary)' }}>15% surge</span> in active sessions today. 
                        Content moderation queue is clear, and all systems are performing within optimal latency parameters.
                      </p>
                    </div>
                 </div>
              </div>
           </Col>
           
           <Col lg={5}>
              <div className="card border-0 p-4 shadow-sm h-100 bg-white" style={{ borderRadius: '1.25rem' }}>
                 <h5 className="fw-800 serif mb-4">Quick Administration</h5>
                 <div className="d-flex flex-column gap-3">
                    <Link to="/admin/taxonomy" className="btn btn-light border-0 shadow-none p-4 text-start d-flex align-items-center justify-content-between rounded-4 bg-light hover-lift">
                       <div className="d-flex align-items-center gap-3">
                          <div className="p-2 bg-white text-info rounded-3 shadow-sm"><FiActivity size={20} /></div>
                          <span className="fw-bold">Categories & Tags</span>
                       </div>
                       <FiArrowRight />
                    </Link>
                    <Link to="/admin/comments" className="btn btn-light border-0 shadow-none p-4 text-start d-flex align-items-center justify-content-between rounded-4 bg-light hover-lift">
                       <div className="d-flex align-items-center gap-3">
                          <div className="p-2 bg-white text-danger rounded-3 shadow-sm"><FiShield size={20} /></div>
                          <span className="fw-bold">Global Moderation</span>
                       </div>
                       <FiArrowRight />
                    </Link>
                    <Link to="/admin/analytics" className="btn btn-light border-0 shadow-none p-4 text-start d-flex align-items-center justify-content-between rounded-4 bg-light hover-lift">
                       <div className="d-flex align-items-center gap-3">
                          <div className="p-2 bg-white text-primary rounded-3 shadow-sm"><FiTrendingUp size={20} /></div>
                          <span className="fw-bold">Full Analytics</span>
                       </div>
                       <FiArrowRight />
                    </Link>
                 </div>
                 
                 <div className="mt-auto pt-5">
                    <div className="p-4 bg-primary text-white rounded-4 shadow-lg">
                       <h6 className="fw-bold mb-2">Security Audit</h6>
                       <p className="small mb-0 opacity-75">All administrative actions are being logged. Next scheduled security audit: May 15, 2026.</p>
                    </div>
                 </div>
              </div>
           </Col>
        </Row>
      </Container>
    </PageTransition>
  );
}

export default AdminDashboardPage;
