import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiGrid, FiHash, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Loader from '../../components/common/Loader';
import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';

function CategoryTagPage({ mode }) {
  const { categoryId, tagId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = mode === 'category'
          ? await postService.getPostsByCategory(categoryId)
          : await postService.getPostsByTag(tagId);
        setPosts(data || []);
        
        // Try to find the name from the posts or a separate service call if available
        if (data && data.length > 0) {
          const first = data[0];
          if (mode === 'category') {
             const cat = first.categories?.find(c => String(c.id) === String(categoryId));
             setTitle(cat?.name || `Category #${categoryId}`);
          } else {
             const tag = first.tags?.find(t => String(t.id) === String(tagId));
             setTitle(tag?.name || `Tag #${tagId}`);
          }
        } else {
           setTitle(mode === 'category' ? `Category #${categoryId}` : `Tag #${tagId}`);
        }
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, categoryId, tagId]);

  return (
    <PageTransition>
      <div className="container py-4">
        <header className="mb-5">
          <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill mb-4 d-inline-flex align-items-center gap-2">
            <FiArrowLeft /> Back to Feed
          </Link>
          
          <div className="d-flex align-items-center gap-3 mb-2">
             <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4 shadow-sm">
                {mode === 'category' ? <FiGrid size={32} /> : <FiHash size={32} />}
             </div>
             <div>
                <h1 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>{title}</h1>
                <p className="text-secondary mb-0">Showing all stories under this {mode}.</p>
             </div>
          </div>
        </header>

        {loading ? (
          <Loader text={`Gathering ${mode} stories...`} />
        ) : (
          <div className="row g-4">
            <Col lg={12}>
               <div className="d-flex align-items-center gap-2 mb-4 text-secondary small fw-bold text-uppercase letter-spacing-1">
                  <FiFileText size={14} /> {posts.length} {posts.length === 1 ? 'Story' : 'Stories'} Found
               </div>
            </Col>
            
            {posts.length > 0 ? posts.map((post, idx) => (
              <Col md={6} lg={4} key={post.id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                   <PostCard post={post} compact />
                </motion.div>
              </Col>
            )) : (
              <div className="col-12 text-center py-5">
                 <div className="mb-3 opacity-25">
                    <FiFileText size={64} />
                 </div>
                 <h4 className="text-secondary">No stories found here yet</h4>
                 <p className="text-muted">Check back later for fresh content in this {mode}.</p>
                 <Link to="/" className="btn btn-primary rounded-pill mt-3">Explore other stories</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default CategoryTagPage;
