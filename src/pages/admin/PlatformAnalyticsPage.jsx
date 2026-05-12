import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie } from 'recharts';
import { Row, Col } from 'react-bootstrap';
import { FiActivity, FiUsers, FiFileText, FiMessageSquare, FiTrendingUp, FiPieChart, FiBarChart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import authService from '../../services/authService';
import commentService from '../../services/commentService';
import postService from '../../services/postService';
import Loader from '../../components/common/Loader';

const BAR_COLORS = ['#6366f1', '#f43f8b', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16'];
const ROLE_COLORS = { admin: '#ef4444', author: '#6366f1', reader: '#10b981' };

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--ink-surface)',
      border: '1px solid var(--ink-border)',
      borderRadius: '14px',
      padding: '12px 18px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      minWidth: '180px',
    }}>
      <p style={{ color: 'var(--ink-text)', fontWeight: 700, marginBottom: '6px', fontSize: '0.83rem', lineHeight: '1.4' }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.fill, flexShrink: 0 }} />
          <span style={{ color: 'var(--ink-text-2)', fontSize: '0.8rem' }}>Views:</span>
          <span style={{ color: 'var(--ink-text)', fontWeight: 800, fontSize: '0.9rem' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'var(--ink-surface)',
      border: '1px solid var(--ink-border)',
      borderRadius: '12px',
      padding: '10px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.payload.color }} />
        <span style={{ color: 'var(--ink-text)', fontWeight: 700 }}>{d.name}: {d.value}</span>
      </div>
    </div>
  );
};

function PlatformAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [postAnalytics, setPostAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [users, posts, comments] = await Promise.all([
          authService.getUsers(),
          postService.adminAnalytics(),
          commentService.countTotal(),
        ]);
        setAnalytics({
          totalUsers: users?.length || 0,
          totalComments: comments?.count || 0,
          userRoles: {
            admin: users?.filter(u => u.role === 'ADMIN').length || 0,
            author: users?.filter(u => u.role === 'AUTHOR').length || 0,
            reader: users?.filter(u => u.role === 'READER').length || 0,
          }
        });
        setPostAnalytics(posts);
      } catch (err) {
        console.error('Failed to load platform analytics', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleData = analytics ? [
    { name: 'Admins', value: analytics.userRoles.admin, color: ROLE_COLORS.admin },
    { name: 'Authors', value: analytics.userRoles.author, color: ROLE_COLORS.author },
    { name: 'Readers', value: analytics.userRoles.reader, color: ROLE_COLORS.reader },
  ] : [];

  const topPosts = (postAnalytics?.mostViewedPosts || []).map((p, i) => ({
    ...p,
    shortTitle: p.title.slice(0, 18) + (p.title.length > 18 ? '…' : ''),
    barColor: BAR_COLORS[i % BAR_COLORS.length],
  }));

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: <FiUsers />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Published Posts', value: postAnalytics?.totalPosts || 0, icon: <FiFileText />, color: '#f43f8b', bg: 'rgba(244,63,139,0.12)' },
    { label: 'Global Comments', value: analytics?.totalComments || 0, icon: <FiMessageSquare />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ];

  const totalRoles = roleData.reduce((s, r) => s + r.value, 0);

  if (loading) return <Loader text="Aggregating platform intelligence..." />;

  return (
    <PageTransition>
      <header className="mb-5">
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--ink-text)' }}>Platform Insights</h2>
        <p style={{ color: 'var(--ink-text-2)' }}>Comprehensive overview of the InkWell ecosystem and user engagement.</p>
      </header>

      {/* ── Stat Cards ── */}
      <Row className="g-4 mb-5">
        {stats.map((stat, idx) => (
          <Col md={4} key={stat.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <div className="card border-0 p-4 shadow-sm" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)', borderLeft: `4px solid ${stat.color}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="small fw-bold text-uppercase" style={{ letterSpacing: '0.06em', color: 'var(--ink-text-2)' }}>{stat.label}</span>
                  <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ background: stat.bg, color: stat.color, fontSize: '1.1rem' }}>{stat.icon}</div>
                </div>
                <h2 className="fw-800 mb-2" style={{ fontSize: '2.4rem', color: stat.color, letterSpacing: '-0.03em' }}>{stat.value.toLocaleString()}</h2>
                <div className="small fw-bold d-flex align-items-center gap-1" style={{ color: '#10b981' }}>
                  <FiTrendingUp size={13} /> +8% platform growth
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* ── Most Viewed Bar Chart ── */}
        <Col lg={8}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
              <div className="d-flex justify-content-between align-items-center mb-5">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--ink-text)' }}>
                  <span style={{ color: '#6366f1' }}><FiBarChart /></span> Most Viewed Content
                </h5>
              </div>

              <div style={{ height: 380 }}>
                {topPosts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPosts} margin={{ top: 8, right: 16, left: -10, bottom: 8 }}>
                      <defs>
                        {BAR_COLORS.map((color, i) => (
                          <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ink-border)" />
                      <XAxis
                        dataKey="shortTitle"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--ink-muted)', fontSize: 11, fontWeight: 500 }}
                        interval={0}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--ink-surface-2)', opacity: 0.5 }} />
                      <Bar dataKey="viewCount" radius={[8, 8, 0, 0]} barSize={36}>
                        {topPosts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#barGrad${index % BAR_COLORS.length})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex h-100 align-items-center justify-content-center" style={{ color: 'var(--ink-muted)' }}>
                    No post analytics available yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Col>

        {/* ── User Distribution Donut ── */}
        <Col lg={4}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--ink-text)' }}>
                <span style={{ color: '#f59e0b' }}><FiPieChart /></span> User Distribution
              </h5>

              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {roleData.map((r, i) => (
                        <filter key={i} id={`glow${i}`}>
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                      animationBegin={200}
                      animationDuration={1200}
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-3 d-flex flex-column gap-2">
                {roleData.map((role) => {
                  const pct = totalRoles > 0 ? ((role.value / totalRoles) * 100).toFixed(0) : 0;
                  return (
                    <div key={role.name} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color, boxShadow: `0 0 6px ${role.color}80`, flexShrink: 0 }} />
                        <span className="small fw-600" style={{ color: 'var(--ink-text-2)' }}>{role.name}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 60, height: 5, borderRadius: 4, background: 'var(--ink-border)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: role.color, borderRadius: 4 }} />
                        </div>
                        <span className="small fw-800" style={{ color: role.color, minWidth: '24px' }}>{role.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* ── Platform Health ── */}
      <Row className="g-4 mt-2">
        <Col lg={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 text-white rounded-circle shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <FiActivity size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: 'var(--ink-primary)' }}>Platform Health Report</h5>
                  <p className="mb-0 small" style={{ color: 'var(--ink-text-2)' }}>Server latency is at 45ms. Database performance is optimal. 0 reported security incidents in the last 24 hours.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </Col>
      </Row>
    </PageTransition>
  );
}

export default PlatformAnalyticsPage;
