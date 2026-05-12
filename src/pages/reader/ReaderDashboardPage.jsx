import React, { useEffect, useState } from 'react';
import { Col, Row, Container, Badge, Button } from 'react-bootstrap';
import { FiBookOpen, FiCompass, FiTag, FiTrendingUp, FiArrowRight, FiHeart, FiClock, FiStar, FiSearch, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import postService from '../../services/postService';
import authService from '../../services/authService';
import PostCard from '../../components/post/PostCard';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';

function ReaderDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ stories: 0, tags: 0 });
  const [featured, setFeatured] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [feed, tagsData, catsData] = await Promise.all([
          postService.getPublishedPosts('', 1, 6),
          postService.getTrendingTags(),
          postService.getCategories()
        ]);
        const saved = await postService.getSavedPosts();
        const followingIds = user?.id ? await authService.getFollowingIds(user.id) : [];
        const followedPostsList = await Promise.all((followingIds || []).map((authorId) => postService.getPostsByAuthor(authorId)));
        const followedPosts = followedPostsList
          .flat()
          .filter((p) => p.status === 'PUBLISHED')
          .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
          .slice(0, 6);

        const tagCount = (tagsData || []).length;
        setStats({ stories: feed.total || 0, tags: tagCount });
        setFeatured(feed.items || []);
        setFollowingFeed(followedPosts);
        setCategories(catsData || []);
        setTiles((prev) => prev.map((tile) => {
          if (tile.key === 'saved') return { ...tile, value: String((saved || []).length) };
          if (tile.key === 'interests') return { ...tile, value: String(tagCount) };
          return tile;
        }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);
  const [tiles, setTiles] = useState([
    { key: 'read', label: 'Stories Read', value: '24', icon: <FiBookOpen />, color: '#4361ee', sub: 'Last 30 days' },
    { key: 'likes', label: 'Likes Given', value: '156', icon: <FiHeart />, color: '#ef476f', sub: 'Total engagement' },
    { key: 'saved', label: 'Saved Items', value: '0', icon: <FiClock />, color: '#06d6a0', sub: 'Read later' },
    { key: 'interests', label: 'Interests', value: String(stats.tags), icon: <FiStar />, color: '#ffd166', sub: 'Across tags' },
  ]);

  if (loading) return <Loader text="Preparing your reading space..." />;

  return (
    <PageTransition>
      {/* Welcome Section */}
      <div className="py-5 mb-5 overflow-hidden position-relative" style={{ background: 'var(--ink-surface-2)', borderRadius: '0 0 2.5rem 2.5rem' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                 <span className="badge bg-primary px-3 py-2 mb-3 shadow-sm">READER DASHBOARD</span>
                 <h1 className="display-5 fw-800 mb-3 serif">Welcome back, {user?.fullName?.split(' ')[0] || 'Reader'}</h1>
                 <p className="text-secondary mb-4 fs-5" style={{ maxWidth: '90%' }}>
                   Your personal gateway to the world's most compelling stories. Discover what's new in the InkWell community today.
                 </p>
                 <div className="d-flex gap-3">
                    <Button as={Link} to="/" variant="primary" className="px-4 py-2 shadow-sm">
                      <FiCompass /> Explore Feed
                    </Button>
                    <Button as={Link} to="/search" variant="outline-secondary" className="px-4 py-2">
                      <FiSearch /> Search Topics
                    </Button>
                 </div>
               </motion.div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-4 bg-white rounded-4 shadow-lg border border-dashed text-center"
               >
                  <div className="bg-primary-light p-3 rounded-circle text-white d-inline-flex mb-3">
                    <FiTrendingUp size={32} />
                  </div>
                  <h6 className="fw-bold">Trending Today</h6>
                  <p className="small text-muted mb-0">"The Future of AI Ethics" is the most read story in your region.</p>
               </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Activity Stats */}
        <div className="mb-4 d-flex align-items-center justify-content-between px-1">
           <h4 className="serif fw-bold mb-0">Your Reading Activity</h4>
           <Link to="/" className="text-primary small fw-bold text-decoration-none hover-underline">Full History <FiArrowRight /></Link>
        </div>
        <Row className="g-4 mb-5">
          {tiles.map((tile, idx) => (
            <Col md={6} lg={3} key={tile.label}>
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: '1.25rem' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ color: tile.color, background: `${tile.color}15`, padding: '12px', borderRadius: '14px' }}>
                      {React.cloneElement(tile.icon, { size: 24 })}
                    </div>
                  </div>
                  <h3 className="fw-800 mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>{tile.value}</h3>
                  <div className="fw-bold small text-dark mb-1">{tile.label}</div>
                  <div className="text-muted small">{tile.sub}</div>
                  {tile.key === 'saved' && (
                    <Link to="/reader/saved" className="small text-primary text-decoration-none fw-bold mt-2 d-inline-block">Open saved posts</Link>
                  )}
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>

        <Row className="g-5">
           {/* Main Feed Section */}
           <Col lg={8}>
              <div className="mb-4 d-flex align-items-center justify-content-between px-1">
                 <h4 className="serif fw-bold mb-0">Recommended for You</h4>
                 <div className="d-flex gap-2">
                    <span className="badge bg-primary-light text-primary border border-primary px-3 py-2 opacity-75">Personalized</span>
                 </div>
              </div>
              
              <div className="d-flex flex-column gap-5">
                {featured.length > 0 ? featured.map((post) => (
                  <PostCard key={post.id} post={post} />
                )) : (
                  <div className="text-center py-5 border-2 border-dashed rounded-4 bg-light">
                     <p className="text-muted mb-0">No recommendations available at the moment. Explore the feed to get better suggestions!</p>
                  </div>
                )}
              </div>
           </Col>

           {/* Sidebar Section */}
           <Col lg={4}>
              <div className="mb-5">
                <div className="card border-0 shadow-sm p-4">
                  <h5 className="serif fw-bold mb-3">From Authors You Follow</h5>
                  {followingFeed.length > 0 ? (
                    <div className="d-grid gap-2">
                      {followingFeed.slice(0, 3).map((post) => (
                        <Link key={post.id} to={post.slug ? `/posts/slug/${post.slug}` : `/posts/${post.id}`} className="text-decoration-none text-dark small">
                          {post.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0 small">Follow authors to build your personalized feed.</p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                 <div className="card border-0 shadow-sm p-4">
                    <h5 className="serif fw-bold mb-4">Discover Interests</h5>
                    <div className="d-flex flex-wrap gap-2">
                       {categories.map(cat => (
                         <Link 
                           key={cat.id} 
                           to={`/category/${cat.id}`} 
                           className="badge bg-light text-secondary border px-3 py-2 text-decoration-none hover-lift"
                         >
                           {cat.name}
                         </Link>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="card border-0 shadow-sm p-4 bg-primary text-white overflow-hidden position-relative" style={{ borderRadius: '1.25rem' }}>
                 <div className="position-relative z-index-1">
                   <h6 className="fw-bold mb-2">Join the Conversation</h6>
                   <p className="small opacity-80 mb-3">You've left 0 comments this week. Engaging with authors helps build the community!</p>
                   <Button as={Link} to="/" variant="light" className="w-100 fw-bold shadow-sm text-primary">Explore Discussions</Button>
                 </div>
                 <div className="position-absolute end-0 bottom-0 opacity-10" style={{ transform: 'translate(20%, 20%)' }}>
                    <FiMessageCircle size={100} />
                 </div>
              </div>
           </Col>
        </Row>
      </Container>
    </PageTransition>
  );
}

export default ReaderDashboardPage;
