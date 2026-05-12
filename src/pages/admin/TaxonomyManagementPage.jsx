import { useEffect, useState } from 'react';
import { Row, Col, Form, InputGroup, Badge, Alert } from 'react-bootstrap';
import { FiPlus, FiGrid, FiHash, FiActivity, FiSearch, FiInfo, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import postService from '../../services/postService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

function TaxonomyManagementPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setError('');
      const [cats, tagData] = await Promise.all([postService.getCategories(), postService.getTags()]);
      setCategories(cats || []);
      setTags(tagData || []);
    } catch (_error) {
      setError('Unable to load categories/tags. Please check your network or backend.');
      toast.error('Failed to load taxonomy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await postService.createCategory({
        name: categoryName,
        description: '',
        parentCategoryId: parentCategoryId ? Number(parentCategoryId) : null,
      });
      setCategoryName('');
      setParentCategoryId('');
      await load();
      toast.success('Category created');
    } catch (_error) {
      setError('Failed to create category. It might already exist.');
      toast.error('Failed to create category');
    }
  };

  const createTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    try {
      await postService.createTag({ name: tagName });
      setTagName('');
      await load();
      toast.success('Tag created');
    } catch (_error) {
      setError('Failed to create tag. It might already exist.');
      toast.error('Failed to create tag');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await postService.deleteCategory(id);
      toast.success('Category deleted');
      await load();
    } catch (_error) {
      toast.error('Failed to delete category');
    }
  };

  const deleteTag = async (id) => {
    try {
      await postService.deleteTag(id);
      toast.success('Tag deleted');
      await load();
    } catch (_error) {
      toast.error('Failed to delete tag');
    }
  };

  if (loading) return <Loader text="Organizing taxonomy..." />;

  return (
    <PageTransition>
      <header className="mb-5">
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Categories & Tags</h2>
        <p className="text-secondary">Structure your content ecosystem by managing global taxonomy settings.</p>
      </header>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setError('')} dismissible>
           <FiInfo className="me-2" /> {error}
        </Alert>
      )}

      <Row className="g-5">
        <Col lg={6}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 'var(--ink-radius-lg)' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
               <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                  <FiGrid size={24} />
               </div>
               <h5 className="fw-bold mb-0">Platform Categories</h5>
            </div>

            <Form onSubmit={createCategory} className="mb-5">
              <Form.Label className="small fw-bold text-uppercase opacity-75">Add New Category</Form.Label>
              <InputGroup>
                <Form.Control 
                  placeholder="Enter category name..." 
                  value={categoryName} 
                  onChange={(event) => setCategoryName(event.target.value)} 
                />
                <button className="btn btn-primary px-4 d-flex align-items-center gap-2" type="submit">
                  <FiPlus /> Add
                </button>
              </InputGroup>
              <Form.Select className="mt-2" value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)}>
                <option value="">No parent (root category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form>

            <div className="d-grid gap-3">
              <AnimatePresence>
                {categories.length > 0 ? categories.map((category) => (
                  <motion.div 
                    key={category.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="d-flex justify-content-between align-items-center bg-light rounded-4 p-3 border border-opacity-10"
                  >
                    <div>
                       <div className="fw-bold text-dark">{category.name}</div>
                       <div className="text-muted x-small">ID: #{category.id} {category.parentCategoryId ? `• Parent: #${category.parentCategoryId}` : '• Root'}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="white" text="primary" className="shadow-sm border rounded-pill px-3">
                        {category.postCount || 0} Stories
                      </Badge>
                      <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteCategory(category.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </motion.div>
                )) : (
                   <p className="text-center text-muted py-4">No categories created yet.</p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </Col>

        <Col lg={6}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 'var(--ink-radius-lg)' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
               <div className="p-3 bg-accent bg-opacity-10 text-accent rounded-4" style={{ color: 'var(--ink-accent)' }}>
                  <FiHash size={24} />
               </div>
               <h5 className="fw-bold mb-0">Community Tags</h5>
            </div>

            <Form onSubmit={createTag} className="mb-5">
              <Form.Label className="small fw-bold text-uppercase opacity-75">Add New Tag</Form.Label>
              <InputGroup>
                <Form.Control 
                  placeholder="Enter tag name..." 
                  value={tagName} 
                  onChange={(event) => setTagName(event.target.value)} 
                />
                <button className="btn btn-accent px-4 d-flex align-items-center gap-2 text-white" style={{ background: 'var(--ink-accent)', borderColor: 'var(--ink-accent)' }} type="submit">
                  <FiPlus /> Add
                </button>
              </InputGroup>
            </Form>

            <div className="p-4 bg-light rounded-4 border border-opacity-10">
               <Form.Label className="small fw-bold text-uppercase opacity-75 mb-3 d-block">Active Tags ({tags.length})</Form.Label>
               <div className="d-flex flex-wrap gap-2">
                 <AnimatePresence>
                   {tags.length > 0 ? tags.map((tag) => (
                     <motion.span 
                       key={tag.id} 
                       initial={{ scale: 0.8, opacity: 0 }} 
                       animate={{ scale: 1, opacity: 1 }}
                       className="badge bg-white text-dark shadow-sm border rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2"
                     >
                       #{tag.name}
                       <button className="btn btn-sm btn-outline-danger p-0 px-1" type="button" onClick={() => deleteTag(tag.id)}>
                         <FiTrash2 size={12} />
                       </button>
                     </motion.span>
                   )) : (
                      <p className="text-center text-muted w-100 py-4">No tags available.</p>
                   )}
                 </AnimatePresence>
               </div>
            </div>

            <div className="mt-auto pt-5">
               <div className="p-4 bg-info bg-opacity-10 rounded-4 border border-info border-opacity-10 d-flex gap-3 align-items-start">
                  <FiInfo className="text-info mt-1" size={20} />
                  <div>
                     <h6 className="fw-bold text-info mb-1">Moderator Tip</h6>
                     <p className="small text-secondary mb-0">Consistent categories and tags help users discover content more effectively. Avoid creating duplicate or similar tags.</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </Col>
      </Row>
    </PageTransition>
  );
}

export default TaxonomyManagementPage;
