import { useEffect, useState } from 'react';
import { Badge, Row, Col } from 'react-bootstrap';
import { FiMessageSquare, FiCheck, FiX, FiClock, FiFileText, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import commentService from '../../services/commentService';
import postService from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';

function AuthorCommentsPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const posts = await postService.getPostsByAuthor(user.id);
      const lists = await Promise.all(posts.map((post) => commentService.getByPost(post.id)));
      const merged = lists.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(merged);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const approve = async (commentId) => {
    try {
      await commentService.approve(commentId);
      setComments((prev) => prev.map((item) => (item.id === commentId ? { ...item, status: 'APPROVED' } : item)));
    } catch (err) {
      console.error('Approval failed', err);
    }
  };

  const reject = async (commentId) => {
    try {
      await commentService.reject(commentId);
      setComments((prev) => prev.map((item) => (item.id === commentId ? { ...item, status: 'REJECTED' } : item)));
    } catch (err) {
      console.error('Rejection failed', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <Badge bg="success" className="bg-opacity-10 text-success rounded-pill px-3">Approved</Badge>;
      case 'PENDING': return <Badge bg="warning" className="bg-opacity-10 text-warning rounded-pill px-3">Pending</Badge>;
      case 'REJECTED': return <Badge bg="danger" className="bg-opacity-10 text-danger rounded-pill px-3">Rejected</Badge>;
      default: return <Badge bg="light" text="dark" className="rounded-pill px-3">{status}</Badge>;
    }
  };

  return (
    <PageTransition>
      <header className="mb-5">
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Comments Moderation</h2>
        <p className="text-secondary">Engage with your audience and manage feedback on your stories.</p>
      </header>

      {loading ? (
        <Loader text="Gathering audience feedback..." />
      ) : (
        <div className="d-grid gap-3">
          <AnimatePresence>
            {comments.length > 0 ? comments.map((comment, idx) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card border-0 shadow-sm p-4 hover-lift"
                style={{ borderRadius: 'var(--ink-radius-md)', borderLeft: comment.status === 'PENDING' ? '4px solid var(--ink-accent)' : '1px solid var(--ink-border)' }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                       <div className="d-flex align-items-center gap-2 text-secondary small fw-bold">
                          <FiUser size={14} className="text-primary" /> User #{comment.authorId}
                       </div>
                       <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiClock size={14} /> {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                       </div>
                       <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiFileText size={14} /> Post #{comment.postId}
                       </div>
                       {getStatusBadge(comment.status)}
                    </div>
                    <p className="mb-0 text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{comment.content}</p>
                  </div>
                  <div className="d-flex gap-2 align-self-end align-self-md-start">
                    {comment.status !== 'APPROVED' && (
                      <button className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => approve(comment.id)}>
                        <FiCheck /> Approve
                      </button>
                    )}
                    {comment.status !== 'REJECTED' && (
                      <button className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => reject(comment.id)}>
                        <FiX /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-5 bg-white shadow-sm rounded-4">
                 <div className="mb-3 opacity-25">
                    <FiMessageSquare size={64} />
                 </div>
                 <h4 className="text-secondary">No comments yet</h4>
                 <p className="text-muted">Once readers start commenting on your stories, they will appear here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageTransition>
  );
}

export default AuthorCommentsPage;
