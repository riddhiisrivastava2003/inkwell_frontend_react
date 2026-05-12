import { useEffect, useState } from 'react';
import { Alert, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import { FiMail, FiSend, FiUsers, FiUserCheck, FiUserX, FiCheckCircle, FiInfo, FiSearch, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import newsletterService from '../../services/newsletterService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

function NewsletterPage() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [count, setCount] = useState({});
  const [campaign, setCampaign] = useState({ subject: '', content: '', preferenceKeyword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [listResult, statsResult] = await Promise.allSettled([
        newsletterService.listSubscribers(),
        newsletterService.getCount(),
      ]);
      const list = listResult.status === 'fulfilled' ? (listResult.value || []) : [];
      const stats = statsResult.status === 'fulfilled' ? (statsResult.value || {}) : {};
      setSubscribers(list);
      setCount(stats);

      if (listResult.status === 'rejected') {
        console.error('Failed to load subscribers list', listResult.reason);
      }
      if (statsResult.status === 'rejected') {
        console.error('Failed to load newsletter count', statsResult.reason);
      }
    } catch (err) {
      console.error('Failed to load newsletter data', err);
      if (err?.response?.status === 403) {
        toast.error('Only admins can access newsletter data');
      } else {
        toast.error('Failed to load newsletter data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sendCampaign = async (event) => {
    event.preventDefault();
    if (!campaign.subject || !campaign.content) return;
    setSending(true);
    try {
      const payload = {
        ...campaign,
        preferenceKeyword: campaign.preferenceKeyword?.trim() ? campaign.preferenceKeyword.trim() : null,
      };
      const response = await newsletterService.sendCampaign(payload);
      const recipients = response?.recipients || 0;
      const sent = response?.sent || 0;
      const failed = response?.failed || 0;
      setMessage(`Campaign processed: recipients=${recipients}, sent=${sent}, failed=${failed}.`);
      toast.success(`Campaign: sent ${sent}/${recipients}, failed ${failed}`);
      setCampaign({ subject: '', content: '', preferenceKeyword: '' });
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Failed to send campaign', err);
      toast.error('Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const activatePending = async (subscriberId) => {
    try {
      await newsletterService.activateSubscriber(subscriberId, user?.id);
      toast.success('Subscriber activated');
      await load();
    } catch (err) {
      console.error('Failed to activate subscriber', err);
      toast.error('Failed to activate subscriber');
    }
  };

  const deactivateSubscriber = async (subscriberId) => {
    try {
      await newsletterService.deactivateSubscriber(subscriberId);
      toast.success('Subscriber deactivated');
      await load();
    } catch (err) {
      console.error('Failed to deactivate subscriber', err);
      toast.error('Failed to deactivate subscriber');
    }
  };

  const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = [
    { label: 'Active', value: count.active || 0, icon: <FiUserCheck />, color: 'var(--ink-success)' },
    { label: 'Pending', value: count.pending || 0, icon: <FiClock />, color: 'var(--ink-accent)' },
    { label: 'Unsubscribed', value: count.unsubscribed || 0, icon: <FiUserX />, color: 'var(--ink-danger)' },
    { label: 'Total Base', value: count.total || 0, icon: <FiUsers />, color: 'var(--ink-primary)' },
  ];

  if (loading) return <Loader text="Analyzing audience reach..." />;

  return (
    <PageTransition>
      <header className="mb-5">
        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Newsletter Management</h2>
        <p className="text-secondary">Grow your audience and reach them directly with email campaigns.</p>
      </header>

      {message && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
           <Alert variant="success" className="border-0 shadow-sm rounded-4 mb-5 d-flex align-items-center gap-2">
              <FiCheckCircle size={20} /> {message}
           </Alert>
        </motion.div>
      )}

      <Row className="g-4 mb-5">
        {stats.map((stat, idx) => (
          <Col md={3} key={stat.label}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
              <div className="card border-0 p-4 h-100 shadow-sm" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
                 <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--ink-text-2)' }}>{stat.label}</span>
                    <div className="p-2 rounded-3" style={{ background: `color-mix(in srgb, ${stat.color} 10%, transparent)`, color: stat.color }}>{stat.icon}</div>
                 </div>
                 <h3 className="fw-bold mb-0" style={{ fontSize: '2rem', color: 'var(--ink-text)' }}>{stat.value.toLocaleString()}</h3>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-5">
         <Col lg={7}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card border-0 shadow-lg p-5 h-100" style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)' }}>
               <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                     <FiSend size={24} />
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--ink-text)' }}>Create New Campaign</h5>
               </div>
               
               <Form onSubmit={sendCampaign}>
                  <Row className="g-4">
                     <Col md={12}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-uppercase" style={{ opacity: 0.75, color: 'var(--ink-text-2)' }}>Campaign Subject</Form.Label>
                           <Form.Control 
                             className="form-control-lg" 
                             placeholder="Weekly Digest: Fresh Stories for You" 
                             value={campaign.subject} 
                             onChange={(event) => setCampaign((prev) => ({ ...prev, subject: event.target.value }))} 
                             required
                             style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-text)', border: '1px solid var(--ink-border)' }}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={12}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-uppercase" style={{ opacity: 0.75, color: 'var(--ink-text-2)' }}>Target Preference (Optional)</Form.Label>
                           <Form.Control 
                             placeholder="e.g. technology, art, design" 
                             value={campaign.preferenceKeyword} 
                             onChange={(event) => setCampaign((prev) => ({ ...prev, preferenceKeyword: event.target.value }))} 
                             style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-text)', border: '1px solid var(--ink-border)' }}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={12}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-uppercase" style={{ opacity: 0.75, color: 'var(--ink-text-2)' }}>Content</Form.Label>
                           <Form.Control 
                             as="textarea" 
                             rows={6} 
                             placeholder="Write your email content here... Markdown is supported." 
                             value={campaign.content} 
                             onChange={(event) => setCampaign((prev) => ({ ...prev, content: event.target.value }))} 
                             required
                             style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-text)', border: '1px solid var(--ink-border)' }}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={12}>
                        <button className="btn btn-primary btn-lg w-100 py-3 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-lg" disabled={sending}>
                           {sending ? 'Delivering...' : <><FiSend /> Blast Campaign Now</>}
                        </button>
                     </Col>
                  </Row>
               </Form>
            </motion.div>
         </Col>
         
         <Col lg={5}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card border-0 shadow-sm p-4 h-100"
              style={{ borderRadius: 'var(--ink-radius-lg)', background: 'var(--ink-surface)', border: '1px solid var(--ink-border)' }}
            >
               <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--ink-text)' }}>Audience List</h5>
                  <div className="position-relative" style={{ minWidth: '180px' }}>
                     <FiSearch className="position-absolute text-muted" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
                     <Form.Control 
                        size="sm" 
                        className="ps-4 rounded-pill" 
                        placeholder="Search email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-text)', border: '1px solid var(--ink-border)' }}
                     />
                  </div>
               </div>

               <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table className="table table-hover align-middle mb-0" style={{ color: 'var(--ink-text)' }}>
                     <thead style={{ background: 'var(--ink-surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                           <th className="border-0 small text-uppercase py-3" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>Email Address</th>
                           <th className="border-0 small text-uppercase py-3 text-end" style={{ color: 'var(--ink-text-2)', background: 'var(--ink-surface-2)' }}>Status</th>
                        </tr>
                     </thead>
                     <tbody style={{ color: 'var(--ink-text)' }}>
                        {filteredSubscribers.length > 0 ? filteredSubscribers.map((subscriber, idx) => (
                           <tr key={subscriber.id} style={{ borderColor: 'var(--ink-border)', backgroundColor: 'transparent', color: 'var(--ink-text)' }}>
                              <td className="py-3" style={{ backgroundColor: 'transparent', color: 'var(--ink-text)', borderColor: 'var(--ink-border)' }}>
                                 <div className="fw-medium" style={{ color: 'var(--ink-text)' }}>{subscriber.email}</div>
                                 <div className="x-small" style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>ID: #{subscriber.id} {subscriber.userId ? `• User: ${subscriber.userId}` : ''}</div>
                              </td>
                              <td className="py-3 text-end" style={{ backgroundColor: 'transparent', color: 'var(--ink-text)', borderColor: 'var(--ink-border)' }}>
                                 <Badge
                                   bg={subscriber.status === 'ACTIVE' ? 'success' : subscriber.status === 'PENDING' ? 'warning' : 'danger'}
                                   className="bg-opacity-10 rounded-pill px-2"
                                   style={{
                                     color: subscriber.status === 'ACTIVE' ? 'var(--ink-success)' : subscriber.status === 'PENDING' ? 'var(--ink-accent)' : 'var(--ink-danger)',
                                     background: subscriber.status === 'ACTIVE' ? 'rgba(5,150,105,0.15)' : subscriber.status === 'PENDING' ? 'rgba(255,51,102,0.15)' : 'rgba(220,38,38,0.15)',
                                   }}
                                 >
                                    {subscriber.status}
                                 </Badge>
                                 {subscriber.status === 'PENDING' && (
                                   <button
                                     type="button"
                                     className="btn btn-sm btn-outline-success rounded-pill ms-2"
                                     onClick={() => activatePending(subscriber.id)}
                                   >
                                     Activate
                                   </button>
                                 )}
                                 {subscriber.status === 'ACTIVE' && (
                                   <button
                                     type="button"
                                     className="btn btn-sm btn-outline-danger rounded-pill ms-2"
                                     onClick={() => deactivateSubscriber(subscriber.id)}
                                   >
                                     Deactivate
                                   </button>
                                 )}
                              </td>
                           </tr>
                        )) : (
                           <tr><td colSpan="2" className="text-center py-4" style={{ color: 'var(--ink-muted)' }}>No subscribers found.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
               
               <div className="mt-auto pt-4">
                  <div className="p-3 rounded-4 d-flex gap-3 align-items-start" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                     <FiInfo className="text-primary mt-1" size={18} />
                     <p className="small mb-0" style={{ color: 'var(--ink-text-2)' }}>Recipients will receive this email based on their preferences and active status.</p>
                  </div>
               </div>
            </motion.div>
         </Col>
      </Row>
    </PageTransition>
  );
}

export default NewsletterPage;
