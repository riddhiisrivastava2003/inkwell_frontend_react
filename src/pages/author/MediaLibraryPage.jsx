import { useEffect, useState } from 'react';
import { Row, Col, Form, Badge } from 'react-bootstrap';
import { FiUploadCloud, FiTrash2, FiFileText, FiImage, FiVideo, FiMusic, FiCopy, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import mediaService from '../../services/mediaService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';

function MediaLibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getByUploader(user.id);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load media items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await mediaService.upload({ uploaderId: user.id, file, altText });
      setFile(null);
      setAltText('');
      await load();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (mediaId) => {
    if (!window.confirm('Kya aap pakka is media item ko delete karna chahte hain?')) return;
    try {
      await mediaService.delete(mediaId);
      await load();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMediaIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FiImage />;
    if (mimeType?.startsWith('video/')) return <FiVideo />;
    if (mimeType?.startsWith('audio/')) return <FiMusic />;
    return <FiFileText />;
  };

  return (
    <PageTransition>
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Media Library</h2>
          <p className="text-secondary mb-0">Upload and manage images, videos, and audio for your stories.</p>
        </div>
      </header>

      <motion.div 
        className="card border-0 shadow-sm p-4 mb-5" 
        style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Form onSubmit={onUpload}>
          <Row className="g-4 align-items-end">
            <Col lg={4}>
               <Form.Group>
                  <Form.Label className="small fw-bold text-uppercase opacity-75">Select File</Form.Label>
                  <Form.Control 
                    type="file" 
                    className="p-2"
                    accept="image/*,video/*,audio/*" 
                    onChange={(event) => setFile(event.target.files?.[0] || null)} 
                  />
               </Form.Group>
            </Col>
            <Col lg={5}>
               <Form.Group>
                  <Form.Label className="small fw-bold text-uppercase opacity-75">Alt Text / Description</Form.Label>
                  <Form.Control 
                    value={altText} 
                    onChange={(event) => setAltText(event.target.value)} 
                    placeholder="Short description for accessibility..." 
                  />
               </Form.Group>
            </Col>
            <Col lg={3}>
              <button className="btn btn-primary w-100 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm" disabled={uploading || !file}>
                {uploading ? 'Uploading...' : <><FiUploadCloud /> Upload Media</>}
              </button>
            </Col>
          </Row>
        </Form>
      </motion.div>

      {loading ? (
        <Loader text="Loading your media..." />
      ) : (
        <div className="row g-4">
          <AnimatePresence>
            {items.length > 0 ? items.map((item, idx) => (
              <Col md={6} lg={4} key={item.id}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card border-0 shadow-sm h-100 overflow-hidden hover-lift"
                  style={{ borderRadius: 'var(--ink-radius-md)' }}
                >
                  <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ height: '200px', overflow: 'hidden' }}>
                    {item.mimeType?.startsWith('video/') ? (
                      <video src={item.url} className="w-100 h-100 object-fit-cover" />
                    ) : item.mimeType?.startsWith('audio/') ? (
                      <div className="text-primary opacity-50"><FiMusic size={64} /></div>
                    ) : (
                      <img src={item.url} alt={item.altText || item.originalName} className="w-100 h-100 object-fit-cover" />
                    )}
                    <div className="position-absolute top-0 start-0 p-2">
                       <Badge bg="dark" className="bg-opacity-50 backdrop-blur d-flex align-items-center gap-1">
                          {getMediaIcon(item.mimeType)} {item.mimeType?.split('/')[1]?.toUpperCase()}
                       </Badge>
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <p className="small fw-bold text-dark mb-1 text-truncate" title={item.originalName}>
                       {item.originalName}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                       <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3" onClick={() => copyToClipboard(item.url, item.id)}>
                          {copiedId === item.id ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Link</>}
                       </button>
                       <button className="btn btn-sm btn-outline-danger p-2 rounded-circle" onClick={() => onDelete(item.id)} title="Delete Media">
                          <FiTrash2 size={14} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              </Col>
            )) : (
              <div className="text-center py-5">
                 <div className="mb-3 opacity-25">
                    <FiImage size={64} />
                 </div>
                 <h4 className="text-secondary">Your library is empty</h4>
                 <p className="text-muted">Upload images or videos to use them in your stories.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageTransition>
  );
}

export default MediaLibraryPage;
