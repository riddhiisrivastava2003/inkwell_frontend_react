import { useEffect, useState } from 'react';
import { Badge, Form, Row, Col } from 'react-bootstrap';
import { FiUsers, FiUserCheck, FiUserX, FiShield, FiMoreVertical, FiMail, FiSearch, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import authService from '../../services/authService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId, role) => {
    try {
      await authService.changeUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? {...u, role} : u));
      toast.success('Role updated');
    } catch (err) {
      console.error('Failed to change role', err);
      toast.error('Failed to change role');
    }
  };

  const toggleStatus = async (userId, active) => {
    try {
      await authService.setUserStatus(userId, active);
      setUsers(prev => prev.map(u => u.id === userId ? {...u, active} : u));
      toast.success(active ? 'User activated' : 'User suspended');
    } catch (err) {
      console.error('Failed to toggle status', err);
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await authService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted permanently');
    } catch (_error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <Badge bg="danger" className="bg-opacity-10 text-danger rounded-pill px-3">Admin</Badge>;
      case 'AUTHOR': return <Badge bg="primary" className="bg-opacity-10 text-primary rounded-pill px-3">Author</Badge>;
      default: return <Badge bg="info" className="bg-opacity-10 text-info rounded-pill px-3">Reader</Badge>;
    }
  };

  return (
    <PageTransition>
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>User Management</h2>
          <p className="text-secondary mb-0">Monitor and manage access for all members of the InkWell platform.</p>
        </div>
        <div className="position-relative" style={{ minWidth: '300px' }}>
           <FiSearch className="position-absolute text-muted" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
           <Form.Control 
             className="ps-5 rounded-pill shadow-sm border-0" 
             placeholder="Search by name, email or username..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      {loading ? (
        <Loader text="Gathering user data..." />
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 'var(--ink-radius-lg)' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 border-0 small text-uppercase fw-bold text-muted">User Profile</th>
                  <th className="py-3 border-0 small text-uppercase fw-bold text-muted">Email</th>
                  <th className="py-3 border-0 small text-uppercase fw-bold text-muted">Access Level</th>
                  <th className="py-3 border-0 small text-uppercase fw-bold text-muted">Status</th>
                  <th className="pe-4 py-3 border-0 text-end small text-uppercase fw-bold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="ps-4 py-4">
                        <div className="d-flex align-items-center gap-3">
                           <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontWeight: 700 }}>
                              {user.username.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <div className="fw-bold text-dark">{user.fullName || user.username}</div>
                              <div className="text-muted small">@{user.username}</div>
                           </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="d-flex align-items-center gap-2">
                           <FiMail size={14} className="text-muted" /> {user.email}
                        </div>
                      </td>
                      <td className="py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4">
                        {user.active ? (
                          <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3">Active</Badge>
                        ) : (
                          <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3">Suspended</Badge>
                        )}
                      </td>
                      <td className="pe-4 py-4 text-end">
                        <div className="d-flex gap-2 justify-content-end align-items-center">
                          <Form.Select 
                            className="form-select-sm w-auto rounded-pill border-light shadow-sm" 
                            style={{ fontSize: '0.8rem' }}
                            value={user.role} 
                            onChange={(event) => changeRole(user.id, event.target.value)}
                          >
                            <option value="READER">Reader</option>
                            <option value="AUTHOR">Author</option>
                            <option value="ADMIN">Admin</option>
                          </Form.Select>
                          <button 
                            className={`btn btn-sm ${user.active ? 'btn-outline-warning' : 'btn-outline-success'} rounded-pill px-3`}
                            onClick={() => toggleStatus(user.id, !user.active)}
                            style={{ minWidth: '100px', fontSize: '0.8rem' }}
                          >
                            {user.active ? <><FiUserX /> Suspend</> : <><FiUserCheck /> Activate</>}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => deleteUser(user.id)}
                            title="Delete user permanently"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                         <div className="opacity-25 mb-3"><FiUsers size={48} /></div>
                         <h5 className="text-secondary">No matching users found</h5>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

export default UserManagementPage;
