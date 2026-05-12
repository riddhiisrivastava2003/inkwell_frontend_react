import { useEffect, useState } from 'react';
import { Badge, Row, Col, Form } from 'react-bootstrap';
import { FiFileText, FiCheck, FiX, FiTrash2, FiUser, FiClock, FiSearch, FiLayout, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import postService from '../../services/postService';
import Loader from '../../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

function PostModerationPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await postService.getAllPostsForAdmin();
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (postId, status) => {
    try {
      await postService.updateStatus(postId, status);
      setPosts(prev => prev.map(p => p.id === postId ? {...p, status} : p));
      toast.success(`Post moved to ${status}`);
    } catch (err) {
      console.error('Status update failed', err);
      toast.error('Failed to update status');
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action is permanent.')) return;
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete post');
    }
  };

  const toggleFeature = async (postId, featured) => {
    try {
      await postService.featurePost(postId, featured);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, featured } : p)));
      toast.success(featured ? 'Post pinned to top' : 'Post unpinned');
    } catch (_error) {
      toast.error('Failed to update pin status');
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED': return <Badge bg="success" className="bg-opacity-10 text-success rounded-pill px-3">Published</Badge>;
      case 'DRAFT': return <Badge bg="warning" className="bg-opacity-10 text-warning rounded-pill px-3">Draft</Badge>;
      case 'UNPUBLISHED': return <Badge bg="secondary" className="bg-opacity-10 text-secondary rounded-pill px-3">Unpublished</Badge>;
      default: return <Badge bg="light" text="dark" className="rounded-pill px-3">{status}</Badge>;
    }
  };

  return (
    <PageTransition>
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Post Moderation</h2>
          <p className="text-secondary mb-0">Review content quality and manage story visibility across the platform.</p>
        </div>
        <div className="position-relative" style={{ minWidth: '300px' }}>
           <FiSearch className="position-absolute text-muted" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
           <Form.Control 
             className="ps-5 rounded-pill shadow-sm border-0" 
             placeholder="Search stories by title..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      {loading ? (
        <Loader text="Gathering platform content..." />
      ) : (
        <div className="d-grid gap-3">
          <AnimatePresence>
            {filteredPosts.length > 0 ? filteredPosts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card border-0 shadow-sm p-4 hover-lift"
                style={{ borderRadius: 'var(--ink-radius-md)' }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                       <div className="d-flex align-items-center gap-2 text-secondary small fw-bold">
                          <FiUser size={14} className="text-primary" /> Author #{post.authorId}
                       </div>
                       <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiClock size={14} /> {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Recently'}
                       </div>
                       {getStatusBadge(post.status)}
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{post.title}</h5>
                    {post.featured ? <Badge bg="primary" className="rounded-pill mb-2">Pinned</Badge> : null}
                    <p className="mb-0 text-secondary small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                       {post.excerpt || 'No summary available for this post.'}
                    </p>
                  </div>
                  <div className="d-flex gap-2 align-self-end align-self-md-start">
                    <button className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 ${post.featured ? 'btn-outline-secondary' : 'btn-outline-primary'}`} onClick={() => toggleFeature(post.id, !post.featured)}>
                      <FiStar /> {post.featured ? 'Unpin' : 'Pin'}
                    </button>
                    {post.status !== 'PUBLISHED' && (
                      <button className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => updateStatus(post.id, 'PUBLISHED')}>
                        <FiCheck /> Approve
                      </button>
                    )}
                    {post.status === 'PUBLISHED' && (
                      <button className="btn btn-sm btn-outline-warning rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => updateStatus(post.id, 'UNPUBLISHED')}>
                        <FiX /> Take Down
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-danger p-2 rounded-circle" onClick={() => deletePost(post.id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-5 bg-white shadow-sm rounded-4">
                 <div className="mb-3 opacity-25">
                    <FiLayout size={64} />
                 </div>
                 <h4 className="text-secondary">No stories found</h4>
                 <p className="text-muted">Try a different search or check back later.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageTransition>
  );
}

export default PostModerationPage;
