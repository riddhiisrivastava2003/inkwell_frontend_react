import React, { useEffect, useState } from 'react';
import { Carousel, Col, Row, Container } from 'react-bootstrap';
import { FiEdit3, FiFileText, FiImage, FiMessageSquare, FiTrendingUp, FiPlus, FiArrowRight, FiEye, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import mediaService from '../../services/mediaService';
import { useAuth } from '../../hooks/useAuth';

function AuthorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ posts: 0, views: 0, likes: 0, comments: 0, media: 0 });
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [posts, commentCount, media] = await Promise.all([
          postService.getPostsByAuthor(user.id),
          commentService.countTotal(),
          mediaService.getByUploader(user.id),
        ]);
        const likes = posts.reduce((sum, item) => sum + (item.likesCount || 0), 0);
        const views = posts.reduce((sum, item) => sum + (item.viewCount || 0), 0);
        setStats({ posts: posts.length, views, likes, comments: commentCount.count || 0, media: media.length });
        setPublishedPosts((posts || []).filter((item) => item.status === 'PUBLISHED').slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) load();
  }, [user?.id]);

  const tiles = [
    { label: 'Total Posts', value: stats.posts, icon: <FiFileText />, to: '/dashboard/posts', color: 'var(--ink-primary)' },
    { label: 'Total Views', value: stats.views, icon: <FiEye />, to: '/dashboard/analytics', color: 'var(--ink-primary-2)' },
    { label: 'Total Likes', value: stats.likes, icon: <FiHeart />, to: '/dashboard/analytics', color: 'var(--ink-danger)' },
    { label: 'Comments', value: stats.comments, icon: <FiMessageSquare />, to: '/dashboard/comments', color: 'var(--ink-success)' },
    { label: 'Media Items', value: stats.media, icon: <FiImage />, to: '/dashboard/media', color: 'var(--ink-accent)' },
  ];

  return (
    <PageTransition>
      <div className="py-5 mb-5 overflow-hidden position-relative" style={{ background: 'var(--ink-surface-2)', borderRadius: '0 0 2.5rem 2.5rem' }}>
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="badge bg-primary px-3 py-2 mb-3 shadow-sm">CREATOR DASHBOARD</span>
              <h2 className="display-6 fw-800 mb-2 serif">Welcome back, {user?.fullName?.split(' ')[0] || user?.username}</h2>
              <p className="text-secondary mb-0 fs-5">Your stories are inspiring readers worldwide.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Link to="/dashboard/posts/new" className="btn btn-primary px-4 py-3 shadow-lg rounded-pill">
                <FiPlus size={20} /> Create New Story
              </Link>
            </motion.div>
          </div>
        </Container>
      </div>

      <Container>
        <Row className="g-4 mb-5">
          {tiles.map((tile, idx) => (
            <Col md={4} lg={idx < 3 ? 4 : 6} key={tile.label}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={tile.to} className="text-decoration-none">
                  <div className="card border-0 p-4 h-100 shadow-sm bg-white" style={{ borderRadius: '1.25rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="display-6 fw-800" style={{ color: 'var(--ink-text)', letterSpacing: '-0.02em' }}>{tile.value.toLocaleString()}</div>
                      <div style={{ color: tile.color, background: `${tile.color}15`, padding: '12px', borderRadius: '14px' }}>
                        {React.cloneElement(tile.icon, { size: 24 })}
                      </div>
                    </div>
                    <div className="text-muted fw-bold small text-uppercase letter-spacing-1">{tile.label}</div>
                  </div>
                </Link>
              </motion.div>
            </Col>
          ))}
        </Row>

        <Row className="g-5">
          <Col lg={8}>
            <div className="card border-0 p-4 h-100 shadow-sm bg-white" style={{ borderRadius: '1.25rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-800 serif">Recent Publications</h5>
                <Link to="/dashboard/posts" className="text-primary small fw-bold text-decoration-none hover-underline">All Posts <FiArrowRight /></Link>
              </div>

              {publishedPosts.length > 0 ? (
                <div className="rounded-4 overflow-hidden shadow-sm">
                  <Carousel interval={4000} indicators={publishedPosts.length > 1} className="modern-carousel">
                    {publishedPosts.map((post) => (
                      <Carousel.Item key={post.id}>
                        <Link to={post.slug ? `/posts/slug/${post.slug}` : `/posts/${post.id}`} className="text-decoration-none">
                          <div className="position-relative" style={{ height: '380px' }}>
                            {post.featuredImageUrl ? (
                              <img src={post.featuredImageUrl} alt={post.title} className="w-100 h-100 object-fit-cover" style={{ filter: 'brightness(0.6)' }} />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark">
                                <FiFileText size={64} className="text-white opacity-10" />
                              </div>
                            )}
                            <div className="position-absolute bottom-0 start-0 w-100 p-4 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                              <div className="d-flex align-items-center gap-3 small mb-2 opacity-75">
                                 <span className="d-flex align-items-center gap-1"><FiEye size={14}/> {post.viewCount || 0}</span>
                                 <span className="d-flex align-items-center gap-1"><FiHeart size={14}/> {post.likesCount || 0}</span>
                              </div>
                              <h3 className="fw-bold mb-2 serif">{post.title}</h3>
                              <p className="small mb-0 opacity-80 line-clamp-2">{post.excerpt || 'Read the full story to dive deeper into this narrative.'}</p>
                            </div>
                          </div>
                        </Link>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-4 border-2 border-dashed">
                  <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex mb-3">
                    <FiEdit3 size={32} className="text-primary" />
                  </div>
                  <h6 className="fw-bold">No Published Stories Yet</h6>
                  <p className="text-muted small mb-4">Start your journey by sharing your first narrative with the community.</p>
                  <Link to="/dashboard/posts/new" className="btn btn-primary rounded-pill px-4">Create Your First Story</Link>
                </div>
              )}
            </div>
          </Col>

          <Col lg={4}>
            <div className="card border-0 p-4 shadow-sm h-100 bg-white" style={{ borderRadius: '1.25rem' }}>
              <h5 className="fw-800 serif mb-4">Quick Insights</h5>
              <div className="d-grid gap-3">
                <Link to="/dashboard/media" className="btn btn-light border-0 shadow-none p-3 text-start d-flex align-items-center gap-3 rounded-4 bg-light hover-lift">
                  <div className="bg-white p-2 rounded-3 shadow-sm text-primary"><FiImage size={20} /></div>
                  <div>
                    <div className="fw-bold text-dark">Media Library</div>
                    <div className="small text-muted">Manage your assets</div>
                  </div>
                </Link>
                <Link to="/dashboard/comments" className="btn btn-light border-0 shadow-none p-3 text-start d-flex align-items-center gap-3 rounded-4 bg-light hover-lift">
                  <div className="bg-white p-2 rounded-3 shadow-sm text-success"><FiMessageSquare size={20} /></div>
                  <div>
                    <div className="fw-bold text-dark">Engagements</div>
                    <div className="small text-muted">Review latest comments</div>
                  </div>
                </Link>
                <Link to="/dashboard/analytics" className="btn btn-light border-0 shadow-none p-3 text-start d-flex align-items-center gap-3 rounded-4 bg-light hover-lift">
                  <div className="bg-white p-2 rounded-3 shadow-sm text-info"><FiTrendingUp size={20} /></div>
                  <div>
                    <div className="fw-bold text-dark">Performance</div>
                    <div className="small text-muted">Detailed statistics</div>
                  </div>
                </Link>
              </div>
              
              <div className="mt-5 p-4 bg-primary text-white rounded-4 shadow-lg position-relative overflow-hidden">
                 <div className="position-relative z-index-1">
                   <small className="fw-bold text-uppercase opacity-75 d-block mb-1">PRO TIP</small>
                   <p className="small mb-0 fw-500">Add descriptive tags to help readers discover your stories through search.</p>
                 </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </PageTransition>
  );
}

export default AuthorDashboardPage;
