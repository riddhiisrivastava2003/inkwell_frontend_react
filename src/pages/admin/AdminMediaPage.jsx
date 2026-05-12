import { useEffect, useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { FiTrash2, FiImage } from 'react-icons/fi';
import PageTransition from '../../components/common/PageTransition';
import mediaService from '../../services/mediaService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

function AdminMediaPage() {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getAll();
      setMedia(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await mediaService.delete(id);
      toast.success('Media removed');
      await load();
    } catch (_err) {
      toast.error('Failed to remove media');
    }
  };

  if (loading) return <Loader text="Loading media library..." />;

  return (
    <PageTransition>
      <h2 className="fw-bold mb-4">Admin Media Library</h2>
      <Row className="g-4">
        {media.length === 0 ? (
          <Col><p className="text-muted">No media found.</p></Col>
        ) : (
          media.map((item) => (
            <Col md={6} lg={4} key={item.id}>
              <div className="card border-0 shadow-sm p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg="light" text="dark">#{item.id}</Badge>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(item.id)}>
                    <FiTrash2 />
                  </button>
                </div>
                {item.url ? (
                  <img src={item.url} alt={item.altText || 'media'} className="img-fluid rounded mb-2" style={{ maxHeight: 180, objectFit: 'cover' }} />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center mb-2" style={{ height: 120 }}>
                    <FiImage />
                  </div>
                )}
                <div className="small text-muted">Uploader: {item.uploaderId || '-'}</div>
                <div className="small text-muted">Linked Post: {item.linkedPostId || '-'}</div>
              </div>
            </Col>
          ))
        )}
      </Row>
    </PageTransition>
  );
}

export default AdminMediaPage;

