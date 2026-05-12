import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiUploadCloud, FiEye, FiHeart, FiPlus, FiMoreVertical, FiFileText } from 'react-icons/fi';
import { Badge, Dropdown, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import ConfirmModal from '../../components/common/ConfirmModal';
import postService from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';

function MyPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await postService.getPostsByAuthor(user.id);
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const remove = async () => {
    try {
      await postService.deletePost(selected.id);
      setSelected(null);
      await load();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const publish = async (postId) => {
    try {
      await postService.updateStatus(postId, 'PUBLISHED');
      await load();
    } catch (err) {
      console.error('Failed to publish post', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED': return <Badge bg="success" className="rounded-pill">Published</Badge>;
      case 'DRAFT': return <Badge bg="warning" className="rounded-pill">Draft</Badge>;
      case 'ARCHIVED': return <Badge bg="secondary" className="rounded-pill">Archived</Badge>;
      default: return <Badge bg="light" text="dark" className="rounded-pill">{status}</Badge>;
    }
  };

  return (
    <PageTransition>
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>My Stories</h2>
          <p className="text-secondary mb-0">Manage, edit, and track your creative work.</p>
        </div>
        <Link to="/dashboard/posts/new" className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
          <FiPlus size={20} /> Create New Story
        </Link>
      </header>

      {loading ? (
        <Loader text="Loading your stories..." />
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 'var(--ink-radius-lg)' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 border-0">Story Details</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0">Stats</th>
                  <th className="pe-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length > 0 ? posts.map((post, idx) => (
                  <motion.tr 
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="ps-4 py-4">
                      <div className="d-flex align-items-center gap-3">
                        {post.featuredImageUrl ? (
                          <img src={post.featuredImageUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }} />
                        ) : (
                          <div className="bg-light text-muted d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', borderRadius: '10px' }}>
                            <FiFileText size={20} />
                          </div>
                        )}
                        <div>
                          <Link to={post.slug ? `/posts/slug/${post.slug}` : `/posts/${post.id}`} className="fw-bold text-dark text-decoration-none d-block mb-1">
                            {post.title}
                          </Link>
                          <small className="text-muted d-block" style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {post.excerpt || 'No summary available.'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="py-4">
                      <div className="d-flex gap-3 text-secondary small">
                        <span className="d-flex align-items-center gap-1"><FiEye size={14}/> {post.viewCount || 0}</span>
                        <span className="d-flex align-items-center gap-1"><FiHeart size={14} className="text-danger"/> {post.likesCount || 0}</span>
                      </div>
                    </td>
                    <td className="pe-4 py-4 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Link className="btn btn-sm btn-outline-primary p-2 rounded-3" to={`/dashboard/posts/${post.id}/edit`} title="Edit Story">
                          <FiEdit2 size={16} />
                        </Link>
                        {post.status !== 'PUBLISHED' && (
                          <button className="btn btn-sm btn-outline-success p-2 rounded-3" onClick={() => publish(post.id)} title="Publish Now">
                            <FiUploadCloud size={16} />
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-danger p-2 rounded-3" onClick={() => setSelected(post)} title="Delete Story">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="mb-3 opacity-25">
                         <FiFileText size={48} />
                      </div>
                      <h5 className="text-secondary">No stories found</h5>
                      <p className="text-muted small">You have not written any stories yet.</p>
                      <Link to="/dashboard/posts/new" className="btn btn-primary btn-sm rounded-pill px-4 mt-2">Start writing</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        show={Boolean(selected)}
        title="Delete Story"
        body={`Are you sure you want to delete this story: "${selected?.title || ''}"? This action cannot be undone.`}
        onConfirm={remove}
        onCancel={() => setSelected(null)}
      />
    </PageTransition>
  );
}

export default MyPostsPage;
