import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, RadialBarChart, RadialBar, PieChart, Pie
} from 'recharts';
import { Row, Col } from 'react-bootstrap';
import { FiTrendingUp, FiEye, FiHeart, FiMessageSquare, FiBarChart2, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';

const PALETTE = ['#6366f1', '#f43f8b', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--ink-surface)',
      border: '1px solid var(--ink-border)',
      borderRadius: '14px',
      padding: '12px 18px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      minWidth: '160px'
    }}>
      <p style={{ color: 'var(--ink-text)', fontWeight: 700, marginBottom: '8px', fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--ink-text-2)', fontSize: '0.8rem' }}>{entry.name}:</span>
          <span style={{ color: 'var(--ink-text)', fontWeight: 700, fontSize: '0.85rem' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

function AuthorAnalyticsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [postData, comments] = await Promise.all([
          postService.getPostsByAuthor(user.id),
          commentService.countTotal(),
        ]);
        setPosts(postData || []);
        setCommentCount(comments.count || 0);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  const chartData = posts.map((post) => ({
    name: post.title.slice(0, 14) + (post.title.length > 14 ? '…' : ''),
    fullName: post.title,
    views: post.viewCount || 0,
    likes: post.likesCount || 0,
  })).sort((a, b) => b.views - a.views).slice(0, 8);

  const totals = posts.reduce(
    (acc, post) => ({
      views: acc.views + (post.viewCount || 0),
      likes: acc.likes + (post.likesCount || 0),
      comments: commentCount,
    }),
    { views: 0, likes: 0, comments: 0 },
  );

  const stats = [
    { label: 'Total Views', value: totals.views, icon: <FiEye />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Total Likes', value: totals.likes, icon: <FiHeart />, color: '#f43f8b', bg: 'rgba(244,63,139,0.12)' },
    { label: 'Comments', value: totals.comments, icon: <FiMessageSquare />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ];

  const engagementData = posts.slice(0, 5).map((post, i) => ({
    name: post.title.slice(0, 16) + (post.title.length > 16 ? '…' : ''),
    fullTitle: post.title,
    rate: parseFloat(((post.likesCount || 0) / (post.viewCount || 1) * 100).toFixed(1)),
    fill: PALETTE[i % PALETTE.length],
  })).sort((a, b) => b.rate - a.rate);

  if (loading) return <Loader text="Calculating performance metrics..." />;

  return (
    <PageTransition>
      <header className="mb-5">
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--ink-text)' }}>Analytics Insights</h2>
        <p style={{ color: 'var(--ink-text-2)' }}>Track your growth and understand what resonates with your readers.</p>
      </header>

      {/* ── Stat Cards ── */}
      <Row className="g-4 mb-5">
        {stats.map((stat, idx) => (
          <Col md={4} key={stat.label}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.12 }}>
              <div className="card border-0 p-4 shadow-sm h-100" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)', borderLeft: `4px solid ${stat.color}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="small fw-bold text-uppercase" style={{ letterSpacing: '0.06em', color: 'var(--ink-text-2)' }}>{stat.label}</span>
                  <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ background: stat.bg, color: stat.color, fontSize: '1.1rem' }}>{stat.icon}</div>
                </div>
                <h2 className="fw-800 mb-2" style={{ fontSize: '2.4rem', color: stat.color, letterSpacing: '-0.03em' }}>{stat.value.toLocaleString()}</h2>
                <div className="small fw-bold d-flex align-items-center gap-1" style={{ color: '#10b981' }}>
                  <FiTrendingUp size={13} /> +12% from last month
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        {/* ── Dual-Metric Bar Chart ── */}
        <Col lg={8}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--ink-text)' }}>
                  <span style={{ color: '#6366f1' }}><FiBarChart2 /></span> Top Performing Stories
                </h5>
                <div className="d-flex align-items-center gap-3">
                  <span className="d-flex align-items-center gap-1 small fw-600" style={{ color: '#6366f1' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: '#6366f1', display: 'inline-block' }} /> Views
                  </span>
                  <span className="d-flex align-items-center gap-1 small fw-600" style={{ color: '#f43f8b' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: '#f43f8b', display: 'inline-block' }} /> Likes
                  </span>
                </div>
              </div>

              <div style={{ height: 360 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 8 }} barGap={4}>
                      <defs>
                        <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
                        </linearGradient>
                        <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fb7eb9" stopOpacity={1} />
                          <stop offset="100%" stopColor="#f43f8b" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ink-border)" />
                      <XAxis
                        dataKey="name"
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
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="views" name="Views" fill="url(#gradViews)" radius={[6, 6, 0, 0]} barSize={18} />
                      <Bar dataKey="likes" name="Likes" fill="url(#gradLikes)" radius={[6, 6, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex h-100 align-items-center justify-content-center" style={{ color: 'var(--ink-muted)' }}>
                    No chart data available yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Col>

        {/* ── Engagement Rate Horizontal Bar ── */}
        <Col lg={4}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--ink-text)' }}>
                <span style={{ color: '#f59e0b' }}><FiActivity /></span> Engagement Rate
              </h5>

              {engagementData.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {engagementData.map((item, i) => (
                    <div key={i}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small fw-600" style={{ color: 'var(--ink-text)', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                        <span className="small fw-800" style={{ color: item.fill }}>{item.rate}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 8, background: 'var(--ink-border)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, item.rate * 10)}%` }}
                          transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${item.fill}99, ${item.fill})` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="d-flex h-100 align-items-center justify-content-center" style={{ color: 'var(--ink-muted)' }}>No data yet.</div>
              )}

              <div className="mt-4 p-3 rounded-3" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                <p className="small mb-0" style={{ color: 'var(--ink-text-2)', lineHeight: '1.5' }}>
                  Engagement rate = (Likes ÷ Views) × 100. Higher is better.
                </p>
              </div>
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* ── Engagement Breakdown Table ── */}
      <Row className="g-4">
        <Col lg={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
              <h5 className="fw-bold mb-4" style={{ color: 'var(--ink-text)' }}>Engagement Breakdown</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle" style={{ color: 'var(--ink-text)' }}>
                  <thead style={{ background: 'var(--ink-surface-2)' }}>
                    <tr>
                      <th className="border-0 small text-uppercase py-3" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>#</th>
                      <th className="border-0 small text-uppercase py-3" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>Story Title</th>
                      <th className="border-0 small text-uppercase py-3" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>Views</th>
                      <th className="border-0 small text-uppercase py-3" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>Likes</th>
                      <th className="border-0 small text-uppercase py-3" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>Engagement</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--ink-text)' }}>
                    {posts.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5).map((post, i) => {
                      const rate = ((post.likesCount || 0) / (post.viewCount || 1) * 100).toFixed(1);
                      const barColor = PALETTE[i % PALETTE.length];
                      return (
                        <tr key={post.id} style={{ borderColor: 'var(--ink-border)', backgroundColor: 'transparent' }}>
                          <td style={{ color: 'var(--ink-muted)', backgroundColor: 'transparent', borderColor: 'var(--ink-border)', fontWeight: 700, width: 40 }}>{i + 1}</td>
                          <td className="py-3 fw-bold" style={{ color: 'var(--ink-text)', backgroundColor: 'transparent', borderColor: 'var(--ink-border)' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 6, height: 32, borderRadius: 4, background: barColor, flexShrink: 0 }} />
                              {post.title}
                            </div>
                          </td>
                          <td className="py-3" style={{ color: '#6366f1', backgroundColor: 'transparent', borderColor: 'var(--ink-border)', fontWeight: 700 }}>{post.viewCount || 0}</td>
                          <td className="py-3" style={{ color: '#f43f8b', backgroundColor: 'transparent', borderColor: 'var(--ink-border)', fontWeight: 700 }}>{post.likesCount || 0}</td>
                          <td className="py-3" style={{ backgroundColor: 'transparent', borderColor: 'var(--ink-border)' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ flex: 1, height: 8, borderRadius: 8, background: 'var(--ink-border)', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, parseFloat(rate) * 10)}%`, height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }} />
                              </div>
                              <span className="small fw-800" style={{ color: barColor, minWidth: '40px' }}>{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </Col>
      </Row>
    </PageTransition>
  );
}

export default AuthorAnalyticsPage;
