import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Col, Form, Row, Container, Button, Badge } from 'react-bootstrap';
import { FiSearch, FiFilter, FiHash, FiGrid, FiX, FiTrendingUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';
import Loader from '../../components/common/Loader';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [tagId, setTagId] = useState(searchParams.get('tag') || '');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (currentKeyword = keyword, currentCat = categoryId, currentTag = tagId) => {
    setLoading(true);
    try {
      const params = {};
      if (currentKeyword) params.q = currentKeyword;
      if (currentCat) params.category = currentCat;
      if (currentTag) params.tag = currentTag;
      setSearchParams(params);

      let list = (await postService.getPublishedPosts(currentKeyword, 1, 100)).items;
      if (currentCat) list = list.filter((post) => post.categories?.some((item) => String(item.id) === String(currentCat)));
      if (currentTag) list = list.filter((post) => post.tags?.some((item) => String(item.id) === String(currentTag)));
      setResults(list);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryId, tagId, setSearchParams]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [catData, tagData] = await Promise.all([postService.getCategories(), postService.getTags()]);
        setCategories(catData || []);
        setTags(tagData || []);
        await runSearch();
      } catch (err) {
        console.error('Bootstrap failed', err);
      }
    };
    bootstrap();
  }, []); // Run once on mount

  const clearFilters = () => {
    setKeyword('');
    setCategoryId('');
    setTagId('');
    runSearch('', '', '');
  };

  return (
    <PageTransition>
      {/* Search Hero Section */}
      <div className="py-5 mb-5 border-bottom bg-white" style={{ marginTop: '-2rem' }}>
        <Container>
          <div className="text-center mb-5">
             <h1 className="display-4 fw-bold mb-3 serif">Discover Knowledge</h1>
             <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
               Search across thousands of narratives, perspectives, and insights shared by our global community.
             </p>
          </div>

          <div className="mx-auto" style={{ maxWidth: '800px' }}>
            <Form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="position-relative">
              <div className="d-flex gap-2">
                <div className="position-relative flex-grow-1">
                  <Form.Control 
                    className="rounded-pill shadow-sm py-3 ps-5 border-0 bg-light"
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)} 
                    placeholder="Search titles, topics, or keywords..."
                    style={{ fontSize: '1.1rem' }}
                  />
                  <FiSearch className="position-absolute start-0 top-50 translate-middle-y ms-4 text-primary" size={20} />
                </div>
                <Button type="submit" variant="primary" className="rounded-pill px-5 fw-bold shadow-sm">Search</Button>
              </div>
            </Form>

            <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
              <div className="d-flex align-items-center gap-2">
                <FiGrid className="text-muted" />
                <Form.Select 
                  size="sm" 
                  className="rounded-pill border-0 bg-light px-3" 
                  value={categoryId} 
                  onChange={(e) => { setCategoryId(e.target.value); runSearch(keyword, e.target.value, tagId); }}
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiHash className="text-muted" />
                <Form.Select 
                  size="sm" 
                  className="rounded-pill border-0 bg-light px-3" 
                  value={tagId} 
                  onChange={(e) => { setTagId(e.target.value); runSearch(keyword, categoryId, e.target.value); }}
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  <option value="">All Tags</option>
                  {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Form.Select>
              </div>
              {(keyword || categoryId || tagId) && (
                <Button variant="link" size="sm" className="text-danger text-decoration-none d-flex align-items-center gap-1" onClick={clearFilters}>
                  <FiX /> Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
           <h4 className="serif fw-bold mb-0">
             {loading ? 'Searching...' : results.length > 0 ? `Showing ${results.length} results` : 'Search Results'}
           </h4>
           <div className="d-flex gap-2">
             <Badge bg="light" text="dark" className="border">Relevance</Badge>
             <Badge bg="light" text="dark" className="border opacity-50">Latest</Badge>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-5">
               <Loader text="Mining the database..." />
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {results.length > 0 ? (
                <Row className="g-4">
                  {results.map((post, idx) => (
                    <Col md={6} lg={4} key={post.id}>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                         <PostCard post={post} />
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                   <div className="bg-light d-inline-flex p-4 rounded-circle mb-4">
                      <FiSearch size={48} className="text-muted" />
                   </div>
                   <h3 className="serif fw-bold">No results found</h3>
                   <p className="text-muted mb-4">We couldn't find any stories matching your current search criteria.</p>
                   <div className="d-flex justify-content-center gap-2">
                      <Button variant="outline-primary" className="rounded-pill px-4" onClick={clearFilters}>Clear All Filters</Button>
                      <Button variant="primary" className="rounded-pill px-4" onClick={() => navigate('/')}>Back to Feed</Button>
                   </div>
                   
                   <div className="mt-5 pt-5 border-top" style={{ maxWidth: '500px', margin: '0 auto' }}>
                      <h6 className="fw-bold text-uppercase small text-muted mb-3"><FiTrendingUp className="me-2"/> Try these popular topics</h6>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                         {categories.slice(0, 6).map(c => (
                           <Badge key={c.id} bg="light" text="primary" className="p-2 px-3 border cursor-pointer hover-bg-primary hover-text-white transition-all" onClick={() => {setCategoryId(c.id); runSearch('', c.id, '');}}>
                             {c.name}
                           </Badge>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </PageTransition>
  );
}

export default SearchPage;
