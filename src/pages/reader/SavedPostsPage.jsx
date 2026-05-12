import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiBookmark } from 'react-icons/fi';
import PageTransition from '../../components/common/PageTransition';
import Loader from '../../components/common/Loader';
import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';

function SavedPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await postService.getSavedPosts();
        setPosts(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading saved stories..." />;

  return (
    <PageTransition>
      <Container className="py-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FiBookmark />
          <h3 className="mb-0">Saved Posts</h3>
        </div>
        {posts.length === 0 ? (
          <div className="text-muted">No saved posts yet.</div>
        ) : (
          <Row className="g-4">
            {posts.map((post) => (
              <Col md={6} key={post.id}>
                <PostCard post={post} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </PageTransition>
  );
}

export default SavedPostsPage;

