import { useEffect, useState } from 'react';
import { Col, Container, Row, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiHash, FiChevronRight, FiSearch, FiMail, FiBookmark, FiUserPlus, FiEdit3, FiImage, FiVideo, FiMoreHorizontal, FiFeather } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';
import heroIllustration from '../../assets/hero-illustration.png';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import newsletterService from '../../services/newsletterService';

const CompactBanner = ({ isAuthenticated }) => (
  <div className="py-5 mb-5 overflow-hidden position-relative" style={{ background: 'var(--ink-surface-2)', borderRadius: '0 0 3rem 3rem' }}>
    <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5" style={{ background: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
    <Container className="position-relative z-index-1">
      <Row className="align-items-center">
        <Col lg={7}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge bg-primary px-3 py-2 mb-3 shadow-sm" style={{ fontSize: '0.8rem' }}>NEW NARRATIVES DAILY</span>
            <h1 className="display-4 fw-800 serif mb-3" style={{ lineHeight: '1.1' }}>
              Where <span className="text-primary">Stories</span> Find Their Voice.
            </h1>
            <p className="text-secondary mb-4 fs-5" style={{ maxWidth: '90%' }}>
              Join a global community of writers and readers exploring the most compelling narratives in technology, life, and beyond.
            </p>
            <div className="d-flex gap-3">
              <Link to={isAuthenticated ? "/dashboard/posts/new" : "/register"} className="btn btn-primary px-4 py-2 shadow-lg">
                <FiFeather /> {isAuthenticated ? "Start Writing" : "Get Started"}
              </Link>
              {!isAuthenticated && <Link to="/login" className="btn btn-outline-secondary px-4">Sign In</Link>}
            </div>
          </motion.div>
        </Col>
        <Col lg={5} className="d-none d-lg-block">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-4 bg-white rounded-4 shadow-xl border"
          >
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-primary-light p-2 rounded-circle text-white">
                <FiTrendingUp size={24} />
              </div>
              <h5 className="fw-bold mb-0">Trending Now</h5>
            </div>
            <p className="text-muted small">"The art of storytelling is not just about the words, but the soul behind them."</p>
            <hr className="my-3 opacity-10" />
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="rounded-circle border border-white" style={{ width: 32, height: 32, marginLeft: i > 1 ? -12 : 0 }} alt="user" />
                ))}
              </div>
              <span className="small text-muted fw-bold">10k+ Active Writers</span>
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  </div>
);

const TrendingScroll = ({ items, onSelect }) => (
  <div className="d-flex gap-3 overflow-auto pb-3 mb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
    {items.map((item, i) => (
      <motion.div 
        key={i} 
        className="flex-shrink-0 text-center cursor-pointer" 
        style={{ width: 100, scrollSnapAlign: 'start' }}
        whileHover={{ scale: 1.05 }}
        onClick={() => onSelect(item.id)}
      >
        <div className="position-relative mb-2">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=cat-${item.id}`} 
            className="rounded-circle border-2 p-1 border-primary" 
            style={{ width: 64, height: 64, objectFit: 'cover' }} 
            alt="story" 
          />
          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" style={{ width: 14, height: 14 }}></div>
        </div>
        <div className="fw-bold text-dark text-truncate px-1" style={{ fontSize: '0.75rem' }}>{item.name}</div>
      </motion.div>
    ))}
  </div>
);

const CreatePostBar = ({ user, onClick }) => (
  <motion.div 
    className="card border-0 shadow-sm p-3 mb-5 d-flex flex-row align-items-center gap-3 cursor-pointer hover-lift" 
    onClick={onClick}
    whileHover={{ y: -5 }}
  >
    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}`} className="rounded-circle" style={{ width: 45, height: 45 }} alt="me" />
    <div className="flex-grow-1 bg-light rounded-pill px-4 py-2 text-muted border border-dashed" style={{ fontSize: '0.95rem' }}>
      What's the next great story, {user?.fullName?.split(' ')[0] || 'Writer'}?
    </div>
    <div className="d-flex gap-3 text-muted px-2">
       <FiImage size={20} className="hover-text-primary" />
       <FiVideo size={20} className="hover-text-primary" />
    </div>
  </motion.div>
);

const SocialSidebarWidget = ({ title, children, icon: Icon }) => (
  <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
    <div className="d-flex align-items-center gap-2 mb-4">
      {Icon && <Icon className="text-primary" size={20} />}
      <h6 className="fw-bold mb-0 text-uppercase small letter-spacing-2">{title}</h6>
    </div>
    {children}
  </div>
);

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [email, setEmail] = useState('');

  const loadPosts = async (nextPage = 1, append = false, keyword = '') => {
    setLoading(true);
    try {
      const feed = await postService.getPublishedPosts(keyword, nextPage, 10);
      setHasMore(feed.hasMore);
      const newPosts = append ? [...posts, ...feed.items] : feed.items;
      setPosts(newPosts);
      setFilteredPosts(newPosts);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [cats, trending] = await Promise.all([postService.getCategories(), postService.getTrendingTags()]);
        setCategories(cats || []);
        setTags(trending || []);
      } catch (_error) {
        setCategories([]);
        setTags([]);
      }
      await loadPosts(1, false);
    };
    bootstrap();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query) {
      const filtered = posts.filter(p => {
        const inTitle = p.title?.toLowerCase().includes(query);
        const inExcerpt = p.excerpt?.toLowerCase().includes(query);
        const inCategories = p.categories?.some(c => c.name.toLowerCase().includes(query));
        const inTags = p.tags?.some(t => t.name.toLowerCase().includes(query));
        
        return inTitle || inExcerpt || inCategories || inTags;
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await newsletterService.subscribe({
        email,
        userId: user?.id || null,
        fullName: user?.fullName || user?.username || '',
        preferences: 'general',
      });
      toast.success('Success! Welcome to the Inner Circle.');
      setEmail('');
    } catch (_error) {
      toast.error('Subscription failed. Please try again.');
    }
  };

  const onCreateClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to share your story');
      navigate('/login');
    } else {
      navigate('/dashboard/posts/new');
    }
  };

  return (
    <PageTransition>
      <CompactBanner isAuthenticated={isAuthenticated} />

      <Container className="py-2">
        <Row className="g-5">
          <Col lg={8}>
            <div className="d-flex align-items-center justify-content-between mb-4">
               <h5 className="fw-bold mb-0 serif">Explore Categories</h5>
               <Link to="/search" className="text-primary small text-decoration-none fw-bold hover-underline">See all categories <FiChevronRight /></Link>
            </div>
            <TrendingScroll items={categories.slice(0, 10)} onSelect={(id) => navigate(`/category/${id}`)} />

            {isAuthenticated && <CreatePostBar user={user} onClick={onCreateClick} />}

            <div className="mb-4 d-flex align-items-center justify-content-between">
              <h4 className="fw-bold mb-0 serif">The Latest Feed</h4>
              <div className="d-flex gap-2">
                 <Button variant="light" size="sm" className="rounded-pill px-4 fw-600 bg-white shadow-sm border">Relevant</Button>
                 <Button variant="light" size="sm" className="rounded-pill px-4 fw-600 border">Recent</Button>
              </div>
            </div>

            {loading && posts.length === 0 ? <Loader text="Curating your stories..." /> : null}
            {!loading && filteredPosts.length === 0 ? (
              <EmptyState title="No stories found" subtitle="Try adjusting your search terms or explore different categories." />
            ) : null}

            <div className="d-flex flex-column gap-5">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {hasMore && !searchQuery ? (
              <div className="text-center mt-5 mb-5">
                <Button 
                  variant="primary" 
                  className="px-5 py-3 rounded-pill fw-bold shadow-lg" 
                  onClick={() => loadPosts(page + 1, true)} 
                  disabled={loading}
                >
                  {loading ? 'Discovering...' : 'Show More Stories'}
                </Button>
              </div>
            ) : null}
          </Col>

          <Col lg={4}>
            <div className="sticky-top" style={{ top: '100px' }}>
              <SocialSidebarWidget title="Discover Content" icon={FiSearch}>
                 <Form className="position-relative mb-4">
                   <Form.Control 
                     type="text" 
                     placeholder="Search narratives, authors..." 
                     className="rounded-pill bg-light border-0 py-3 ps-4 shadow-none"
                     style={{ fontSize: '0.95rem' }}
                     value={searchQuery}
                     onChange={handleSearch}
                   />
                   <div className="position-absolute end-0 top-50 translate-middle-y me-2">
                      <div className="bg-primary rounded-circle p-2 text-white shadow-sm">
                         <FiSearch size={16} />
                      </div>
                   </div>
                 </Form>
                 <div className="px-1">
                    <div className="text-muted small fw-bold mb-3 letter-spacing-1">TRENDING TOPICS</div>
                    <div className="d-flex flex-wrap gap-2">
                       {['#AI', '#Philosophy', '#Future', '#Design', '#Writing'].map(t => (
                         <span key={t} className="badge bg-light text-primary cursor-pointer hover-lift border" style={{ fontSize: '0.8rem' }} onClick={() => handleSearch({ target: { value: t.replace('#','') }})}>
                           {t}
                         </span>
                       ))}
                    </div>
                 </div>
              </SocialSidebarWidget>

              <div className="card border-0 p-4 mb-4 shadow-xl overflow-hidden position-relative bg-primary text-white" style={{ borderRadius: '1.5rem' }}>
                 <div className="position-relative z-index-1">
                   <span className="badge bg-white text-primary mb-3">NEWSLETTER</span>
                   <h4 className="fw-bold mb-2 serif">InkWell Weekly</h4>
                   <p className="small opacity-80 mb-4">Get the best narratives delivered directly to your inbox every Sunday.</p>
                   <Form className="d-grid gap-2" onSubmit={handleNewsletter}>
                     <Form.Control 
                       type="email" 
                       placeholder="Email Address" 
                       className="rounded-pill border-0 py-3 text-center"
                       style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)' }}
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                     />
                     <Button type="submit" variant="light" className="rounded-pill fw-bold py-3 shadow-lg border-0 text-primary">Subscribe</Button>
                   </Form>
                 </div>
                 <div className="position-absolute end-0 bottom-0 opacity-10" style={{ transform: 'translate(10%, 10%)' }}>
                   <FiMail size={140} />
                 </div>
              </div>

              <SocialSidebarWidget title="Popular Tags" icon={FiHash}>
                <div className="d-flex flex-wrap gap-2">
                  {tags.slice(0, 12).map(tag => (
                    <Link key={tag.id} to={`/tag/${tag.id}`} className="badge bg-light text-secondary border px-3 py-2 text-decoration-none hover-lift">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </SocialSidebarWidget>

              <div className="mt-5 text-muted px-2" style={{ fontSize: '0.8rem' }}>
                <div className="d-flex flex-wrap gap-4 mb-3 fw-600">
                  <Link to="/about" className="text-muted text-decoration-none hover-text-primary transition-all">About</Link>
                  <Link to="/privacy" className="text-muted text-decoration-none hover-text-primary transition-all">Privacy</Link>
                  <Link to="/terms" className="text-muted text-decoration-none hover-text-primary transition-all">Terms</Link>
                </div>
                <p className="mb-0 opacity-60">© 2026 InkWell Editorial. Crafting narratives that matter.</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </PageTransition>
  );
}

export default HomePage;




