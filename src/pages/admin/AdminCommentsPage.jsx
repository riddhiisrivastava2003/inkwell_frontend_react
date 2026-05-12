import { useEffect, useState } from 'react';
import { Badge, Alert, Row, Col, Form } from 'react-bootstrap';
import { FiMessageSquare, FiCheck, FiX, FiClock, FiFileText, FiUser, FiShield, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import commentService from '../../services/commentService';
import postService from '../../services/postService';
import Loader from '../../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setError('');
      const posts = await postService.getAllPostsForAdmin();
      const lists = await Promise.all((posts || []).map((post) => commentService.getByPost(post.id)));
      const merged = lists.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(merged);
    } catch (_error) {
      setError('Failed to load global comments. Please ensure the backend is reachable.');
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (commentId, action) => {
    try {
      if (action === 'approve') await commentService.approve(commentId);
      if (action === 'reject') await commentService.reject(commentId);
      setComments((prev) => prev.map((comment) => (
        comment.id === commentId
          ? { ...comment, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
          : comment
      )));
      toast.success(`Comment ${action}d`);
    } catch (err) {
      console.error('Moderation action failed', err);
      toast.error('Moderation action failed');
    }
  };

  const filteredComments = comments.filter(c => 
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.id).includes(searchTerm) ||
    String(c.postId).includes(searchTerm)
  );

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
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
           <div className="d-flex align-items-center gap-2 mb-1">
              <FiShield className="text-primary" />
              <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em' }}>Global Moderation</h2>
           </div>
           <p className="text-secondary mb-0">Oversee discussions across the entire platform and enforce community guidelines.</p>
        </div>
        <div className="position-relative" style={{ minWidth: '300px' }}>
           <FiSearch className="position-absolute text-muted" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
           <Form.Control 
             className="ps-5 rounded-pill shadow-sm border-0" 
             placeholder="Search comments or post IDs..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4">
           {error}
        </Alert>
      )}

      {loading ? (
        <Loader text="Auditing platform discussions..." />
      ) : (
        <div className="d-grid gap-3">
          <AnimatePresence>
            {filteredComments.length > 0 ? filteredComments.map((comment, idx) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="card border-0 shadow-sm p-4 hover-lift"
                style={{ borderRadius: 'var(--ink-radius-md)', borderLeft: comment.status === 'PENDING' ? '4px solid var(--ink-primary)' : '1px solid var(--ink-border)' }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                       <div className="d-flex align-items-center gap-2 text-secondary small fw-bold">
                          <FiUser size={14} className="text-primary" /> User #{comment.authorId}
                       </div>
                       <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiClock size={14} /> {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Recently'}
                       </div>
                       <div className="d-flex align-items-center gap-2 text-secondary small">
                          <FiFileText size={14} /> Post #{comment.postId}
                       </div>
                       {getStatusBadge(comment.status)}
                    </div>
                    <p className="mb-0 text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{comment.content}</p>
                    <div className="mt-2 text-muted x-small">Comment ID: #{comment.id}</div>
                  </div>
                  <div className="d-flex gap-2 align-self-end align-self-md-start">
                    {comment.status !== 'APPROVED' && (
                      <button className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => moderate(comment.id, 'approve')}>
                        <FiCheck /> Approve
                      </button>
                    )}
                    {comment.status !== 'REJECTED' && (
                      <button className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1" onClick={() => moderate(comment.id, 'reject')}>
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
                 <h4 className="text-secondary">No comments found</h4>
                 <p className="text-muted">Platform discussions are clean or no comments match your search.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageTransition>
  );
}

export default AdminCommentsPage;
